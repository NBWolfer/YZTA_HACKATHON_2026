from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import init_db
from app.routers import chat, dashboard, inventory, orders, auth, agents, predictions, notifications, search, profile, whatsapp


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="SME Orchestrator API",
    description="AI-powered operations platform for SMEs — powered by Gemma 4",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(dashboard.router)
app.include_router(inventory.router)
app.include_router(orders.router)
app.include_router(auth.router)
app.include_router(agents.router)
app.include_router(predictions.router)
app.include_router(notifications.router)
app.include_router(search.router)
app.include_router(profile.router)
app.include_router(whatsapp.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "sme-orchestrator"}
