"""
Orchestrator Agent — Central AI brain powered by Gemma 4.

Uses Gemma 4's native function calling via OpenAI-compatible API (Ollama).
Routes incoming messages to the right tools and synthesizes responses.
"""

import json
from openai import OpenAI
from sqlalchemy.orm import Session

from app.config import settings
from app.tools.order_tools import query_order_status, list_todays_orders, create_order
from app.tools.stock_tools import check_stock, list_low_stock, get_all_products
from app.tools.workflow_tools import get_morning_briefing, list_pending_tasks

# OpenAI-compatible client pointing to Ollama
client = OpenAI(
    base_url=f"{settings.ollama_base_url}/v1",
    api_key="ollama",  # Ollama doesn't need a real key
)

groq_client = None
if settings.groq_api_key:
    groq_client = OpenAI(
        base_url="https://api.groq.com/openai/v1",
        api_key=settings.groq_api_key,
    )

# ── Tool Definitions (JSON Schema for Gemma 4) ──────────────────────
TOOLS = [
    {
        "type": "function",
        "function": {
            "name": "query_order_status",
            "description": "Belirli bir siparişin durumunu, ürünlerini ve kargo bilgilerini getirir. Sipariş numarası gereklidir.",
            "parameters": {
                "type": "object",
                "properties": {
                    "order_id": {
                        "type": "integer",
                        "description": "Sipariş numarası (örn: 128)",
                    }
                },
                "required": ["order_id"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_todays_orders",
            "description": "Bugünkü siparişlerin özetini getirir: toplam sipariş sayısı, ciro, durumlara göre dağılım.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "check_stock",
            "description": "Bir ürünün stok durumunu kontrol eder. Ürün adı ile arama yapar.",
            "parameters": {
                "type": "object",
                "properties": {
                    "product_name": {
                        "type": "string",
                        "description": "Ürün adı veya kısmen adı (örn: 'lavanta', 'zeytinyağı')",
                    }
                },
                "required": ["product_name"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_low_stock",
            "description": "Stok seviyesi kritik eşiğin altındaki tüm ürünleri listeler.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_all_products",
            "description": "Tüm ürün kataloğunu stok seviyeleri ile birlikte getirir.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "create_order",
            "description": "Yeni sipariş oluşturur. Müşteri ID ve ürün listesi gereklidir.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {
                        "type": "integer",
                        "description": "Müşteri ID numarası",
                    },
                    "items": {
                        "type": "array",
                        "description": "Sipariş kalemleri",
                        "items": {
                            "type": "object",
                            "properties": {
                                "product_id": {"type": "integer"},
                                "quantity": {"type": "integer"},
                            },
                            "required": ["product_id", "quantity"],
                        },
                    },
                },
                "required": ["customer_id", "items"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "get_morning_briefing",
            "description": "Sabah brifingini oluşturur: bugünkü siparişler, stok uyarıları, aktif teslimatlar, yapılacaklar.",
            "parameters": {"type": "object", "properties": {}},
        },
    },
    {
        "type": "function",
        "function": {
            "name": "list_pending_tasks",
            "description": "Bugün yapılması gereken görevleri listeler (paketleme, kargo, vb.).",
            "parameters": {"type": "object", "properties": {}},
        },
    },
]

# ── Tool Dispatcher ──────────────────────────────────────────────────
TOOL_FUNCTIONS = {
    "query_order_status": lambda db, **kw: query_order_status(db, **kw),
    "list_todays_orders": lambda db, **kw: list_todays_orders(db),
    "check_stock": lambda db, **kw: check_stock(db, **kw),
    "list_low_stock": lambda db, **kw: list_low_stock(db),
    "get_all_products": lambda db, **kw: get_all_products(db),
    "create_order": lambda db, **kw: create_order(db, **kw),
    "get_morning_briefing": lambda db, **kw: get_morning_briefing(db),
    "list_pending_tasks": lambda db, **kw: list_pending_tasks(db),
}

SYSTEM_PROMPT = """Sen bir KOBİ (küçük ve orta ölçekli işletme) operasyon asistanısın.
Bir Türk kooperatifinin (gıda, kozmetik, el sanatları) yapay zeka destekli operasyon yöneticisisin.

Görevlerin:
- Müşteri sorularını yanıtla (sipariş durumu, stok bilgisi, ürün detayları)
- Siparişleri yönet (yeni sipariş oluştur, mevcut siparişleri takip et)
- Stok durumunu izle ve uyarılar oluştur
- Günlük operasyonel brifingleri hazırla
- İş akışı görevlerini organize et

Kurallar:
- Her zaman Türkçe yanıt ver
- Fiyatları ₺ (TL) ile göster
- Somut verilerle yanıt ver, tahmin yapma — araçları kullan
- Kibar ve profesyonel ol
- Müşteri adıyla hitap et (Hanım/Bey)
"""


async def chat(db: Session, messages: list[dict], provider: str = None) -> dict:
    """
    Process a chat message through the specified AI agent with tool calling.
    Returns the final response and any tool calls made.
    """
    if provider is None:
        provider = settings.default_ai_provider

    full_messages = [{"role": "system", "content": SYSTEM_PROMPT}] + messages
    tool_calls_log = []

    # Choose correct client and model
    active_client = groq_client if provider == "groq" and groq_client else client
    active_model = "llama-3.1-8b-instant" if active_client == groq_client else settings.ollama_model

    # Agent loop: keep calling until we get a final text response
    max_iterations = 5
    for _ in range(max_iterations):
        response = active_client.chat.completions.create(
            model=active_model,
            messages=full_messages,
            tools=TOOLS,
            temperature=0.3,
        )

        choice = response.choices[0]

        # If no tool calls, we have the final response
        if not choice.message.tool_calls:
            return {
                "response": choice.message.content or "",
                "tool_calls": tool_calls_log,
            }

        # Process tool calls
        assistant_message = choice.message.model_dump(exclude_unset=True)
        # Remove keys that might cause validation errors on Groq/OpenAI APIs
        for key in ["function_call", "audio", "annotations"]:
            assistant_message.pop(key, None)
        full_messages.append(assistant_message)

        for tool_call in choice.message.tool_calls:
            fn_name = tool_call.function.name
            try:
                fn_args = json.loads(tool_call.function.arguments) if tool_call.function.arguments else {}
                if not isinstance(fn_args, dict):
                    fn_args = {}
            except Exception:
                fn_args = {}

            # Execute the tool
            if fn_name in TOOL_FUNCTIONS:
                result = TOOL_FUNCTIONS[fn_name](db, **fn_args)
            else:
                result = {"error": f"Bilinmeyen araç: {fn_name}"}

            tool_calls_log.append({
                "tool": fn_name,
                "args": fn_args,
                "result": result,
            })

            # Append tool result for next iteration
            full_messages.append({
                "role": "tool",
                "tool_call_id": tool_call.id,
                "content": json.dumps(result, ensure_ascii=False),
            })

    # Fallback if max iterations reached
    return {
        "response": "İşlem zaman aşımına uğradı. Lütfen tekrar deneyin.",
        "tool_calls": tool_calls_log,
    }
