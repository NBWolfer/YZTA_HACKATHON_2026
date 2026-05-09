from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.agents.orchestrator import chat

router = APIRouter(prefix="/api/chat", tags=["chat"])


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str


class ChatRequest(BaseModel):
    messages: list[ChatMessage]
    provider: str = None


class ToolCallInfo(BaseModel):
    tool: str
    args: dict
    result: dict


class ChatResponse(BaseModel):
    response: str
    tool_calls: list[ToolCallInfo] = []


class WhatsAppRequest(BaseModel):
    from_: str = None
    body: str
    timestamp: int = None

    class Config:
        populate_by_name = True
        alias_generator = lambda string: 'from' if string == 'from_' else string


@router.post("/", response_model=ChatResponse)
async def send_message(request: ChatRequest, db: Session = Depends(get_db)):
    """Send a message to the AI agent and get a response with tool call details."""
    messages = [m.model_dump() for m in request.messages]
    result = await chat(db, messages, provider=request.provider)
    return ChatResponse(**result)


import re
from app.models import Customer

# In-memory storage for hackathon MVP
whatsapp_conversations = {}

@router.post("/whatsapp")
async def whatsapp_webhook(request: WhatsAppRequest, db: Session = Depends(get_db)):
    """Handle incoming WhatsApp messages from the Node.js microservice."""
    global whatsapp_conversations
    sender = request.from_ or "Unknown"
    
    # Extract phone number digits from sender ID
    sender_id = sender.split('@')[0].split('-')[0]
    sender_digits = re.sub(r'\D', '', sender_id)
    
    # Verify if the number exists in the database
    all_customers = db.query(Customer).all()
    number_exists = False
    for customer in all_customers:
        if customer.phone:
            db_digits = re.sub(r'\D', '', customer.phone)
            # Compare the last 10 digits to avoid country code mismatches
            if len(sender_digits) >= 10 and db_digits[-10:] == sender_digits[-10:]:
                number_exists = True
                break
                
    if not number_exists:
        # Do not respond or store the message if the number is not in the database
        return {"reply": None, "ignored": True}
    
    if sender not in whatsapp_conversations:
        whatsapp_conversations[sender] = []
        
    user_message = {"role": "user", "content": request.body}
    whatsapp_conversations[sender].append(user_message)

    # Process with local LLM agent
    result = await chat(db, [user_message])
    
    assistant_message = {"role": "assistant", "content": result["response"]}
    whatsapp_conversations[sender].append(assistant_message)
    
    # Return the text reply to the Node.js service
    return {"reply": result["response"]}


@router.get("/whatsapp/history")
async def get_whatsapp_history():
    """Return all WhatsApp conversations for the frontend UI."""
    return {"conversations": whatsapp_conversations}
