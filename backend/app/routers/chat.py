import re
import logging
from datetime import date

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models import Customer
from app.agents.orchestrator import chat

logger = logging.getLogger(__name__)

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


# In-memory storage for hackathon MVP
whatsapp_conversations: dict[str, list[dict]] = {}
whatsapp_conversation_dates: dict[str, date] = {}

@router.post("/whatsapp")
async def whatsapp_webhook(request: WhatsAppRequest, db: Session = Depends(get_db)):
    """Handle incoming WhatsApp messages from the Node.js microservice."""
    global whatsapp_conversations, whatsapp_conversation_dates
    sender = request.from_ or "Unknown"

    # Extract phone number digits from sender ID
    sender_id = sender.split('@')[0].split('-')[0]
    sender_digits = re.sub(r'\D', '', sender_id)

    # Verify if the number or LID exists in the database
    all_customers = db.query(Customer).all()
    matched_customer = None
    for customer in all_customers:
        if customer.phone:
            db_digits = re.sub(r'\D', '', customer.phone)
            # Exact match (handles WhatsApp LIDs stored directly in DB)
            if db_digits == sender_digits:
                matched_customer = customer
                break
            # Last-10-digits match (handles country code mismatches for real phone numbers)
            if len(sender_digits) >= 10 and len(db_digits) >= 10 and db_digits[-10:] == sender_digits[-10:]:
                matched_customer = customer
                break

    if not matched_customer:
        return {"reply": None, "ignored": True}

    today = date.today()
    last_date = whatsapp_conversation_dates.get(sender)
    if last_date != today:
        # Inject customer context as the first message each day
        whatsapp_conversations[sender] = [
            {"role": "system", "content": f"Bu müşterinin adı: {matched_customer.name}, Şehir: {matched_customer.city or 'bilinmiyor'}, Müşteri ID: {matched_customer.id}"}
        ]
        whatsapp_conversation_dates[sender] = today

    user_message = {"role": "user", "content": request.body}
    whatsapp_conversations[sender].append(user_message)

    # Keep only the last 20 messages to avoid exceeding the model context window
    if len(whatsapp_conversations[sender]) > 20:
        whatsapp_conversations[sender] = whatsapp_conversations[sender][-20:]

    try:
        result = await chat(db, whatsapp_conversations[sender])
    except Exception as e:
        logger.error(f"WhatsApp AI error for {sender}: {e}")
        whatsapp_conversations[sender].pop()
        return {"reply": "Şu anda bir teknik sorun yaşıyoruz. Lütfen biraz sonra tekrar deneyin."}

    assistant_message = {"role": "assistant", "content": result["response"]}
    whatsapp_conversations[sender].append(assistant_message)

    return {"reply": result["response"]}


@router.get("/whatsapp/history")
async def get_whatsapp_history():
    """Return all WhatsApp conversations for the frontend UI."""
    return {"conversations": whatsapp_conversations}
