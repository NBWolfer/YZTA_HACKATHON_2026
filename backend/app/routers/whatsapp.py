from fastapi import APIRouter
import httpx

router = APIRouter(prefix="/api/whatsapp", tags=["whatsapp"])

WHATSAPP_BOT_URL = "http://localhost:3001"


@router.get("/status")
async def get_whatsapp_status():
    """Proxy to the Node.js WhatsApp bot to get connection status and QR code."""
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            res = await client.get(f"{WHATSAPP_BOT_URL}/api/status")
            return res.json()
    except Exception:
        return {"status": "disconnected", "qr": None, "error": "WhatsApp bot servisi çalışmıyor."}
