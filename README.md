# SME Orchestrator

AI-powered operations platform for Turkish SMEs and cooperatives. Manages orders, inventory, customers, and WhatsApp communication through a single dashboard with an integrated AI assistant.

---

## Quick Start (3 Terminals)

### Prerequisites

| Tool | Version | Check |
|------|---------|-------|
| Python | 3.11+ | `python --version` |
| Node.js | 18+ | `node --version` |
| Ollama | latest | `ollama --version` |

### 1. Backend (FastAPI + SQLite)

```bash
cd backend
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS / Linux
pip install -r requirements.txt
```

Create `backend/.env` (optional — enables cloud AI):
```env
GROQ_API_KEY=gsk_your_key_here
DEFAULT_AI_PROVIDER=ollama
```

Pull the AI model and start:
```bash
ollama pull gemma2:2b
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

The database seeds automatically on first run (50 products, 80 customers, ~400 orders across 90 days).

### 2. Frontend (Next.js)

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:3000** — login or create an account to enter the dashboard.

### 3. WhatsApp Bot (Optional)

```bash
cd whatsapp-bot
npm install
node index.js
```

Scan the QR code with your phone (WhatsApp > Linked Devices). The bot only responds to phone numbers that exist in the database.

---

## What to Test

| Feature | Where | What to Do |
|---------|-------|------------|
| **Dashboard** | `/` (home) | See today's orders, revenue, stock alerts, weekly chart |
| **AI Chat** | `/customers` | Ask the AI: "Bugünkü siparişleri göster" or "Lavanta sabunu stok durumu" |
| **Inventory** | `/inventory` | Use +/- buttons to adjust stock, click "Tahmin Gor" for AI demand prediction |
| **Add Product** | `/inventory` | Click "Urun Ekle", fill form, submit |
| **CSV Import** | `/inventory` | Click "Ice Aktar", upload a CSV file |
| **Orders** | `/orders` | Filter by status, view order details |
| **Provider Toggle** | `/customers` | Switch between Ollama (local) and Groq (cloud) AI |
| **WhatsApp** | `/customers` | See live WhatsApp conversations (requires bot running) |

### Sample AI Prompts (Turkish)

```
Bugunku siparisleri ozetle
Lavanta sabunu stok durumu nedir?
128 numarali siparisin durumu ne?
Dusuk stoklu urunleri listele
Sabah brifingini hazirla
```

---

## Architecture

```
Frontend (Next.js :3000)
    |
    |--- REST API --->  Backend (FastAPI :8000)
    |                       |
    |                       |--- SQLite (auto-seeded)
    |                       |--- Ollama (local LLM :11434)
    |                       |--- Groq API (cloud LLM, optional)
    |
    |--- WebSocket --->  WhatsApp Bot (Node.js :3001)
                            |
                            |--- whatsapp-web.js
                            |--- forwards messages to Backend
```

### AI Tool Calling

The AI assistant has direct access to database tools:

- `check_stock` — query product stock levels
- `query_order_status` — track orders by ID
- `list_todays_orders` — daily order summary
- `list_low_stock` — critical stock alerts
- `get_all_products` — full product catalog
- `create_order` — create new orders
- `get_morning_briefing` — daily operational briefing
- `list_pending_tasks` — pending packaging/shipping tasks

---

## Tech Stack

- **Frontend**: Next.js 15, React 19, TailwindCSS 4, TypeScript
- **Backend**: Python, FastAPI, SQLAlchemy 2, SQLite
- **AI**: OpenAI SDK (Ollama-compatible), Gemma 2 (local) / Llama 3.3 70B (Groq)
- **WhatsApp**: whatsapp-web.js, Express

---

## Project Structure

```
repo/
  backend/
    app/
      agents/         # AI orchestrator with tool calling
      routers/        # FastAPI route handlers
      tools/          # Database tool functions for AI
      models.py       # SQLAlchemy ORM models
      seed.py         # Demo data generator
      config.py       # Environment settings
      main.py         # FastAPI app entry point
  frontend/
    src/
      app/            # Next.js pages (dashboard, inventory, orders, customers)
      components/     # Shared UI components
      lib/            # API client, global state
  whatsapp-bot/
    index.js          # WhatsApp bridge microservice
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Ollama connection refused" | Run `ollama serve` in a separate terminal |
| "Model not found" | Run `ollama pull gemma2:2b` |
| Frontend can't reach backend | Check backend is running on port 8000 |
| WhatsApp QR not showing | Check Node.js version >= 18, reinstall `whatsapp-web.js` |
| AI responses are slow | Switch to Groq provider in the Customer Hub page |
| Want fresh data | Delete `backend/data/sme.db` and restart backend |

---

Created for YZTA Hackathon 2026.
