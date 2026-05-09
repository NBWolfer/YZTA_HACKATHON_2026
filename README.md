# SME Orchestrator - YZTA Hackathon

An AI-driven operational efficiency platform designed for SMEs and cooperatives. This project streamlines customer communication, order tracking, and inventory management using a powerful local-first AI orchestrator that integrates directly with WhatsApp.

## 🚀 Key Features

*   **Local-First AI Orchestrator**: Powered by Gemma 2 (via Ollama) with fallback support for Groq API (`llama3-8b-8192`).
*   **WhatsApp Integration**: A host-free Node.js microservice that acts as a bridge between your physical WhatsApp device and the AI backend. It can read customer messages, filter non-registered users/groups, and reply automatically using AI tools.
*   **Customer Hub (Next.js)**: A sleek, modern dashboard to view WhatsApp conversations in real-time, switch AI providers, and manually message customers.
*   **Agentic Tool Calling**: The AI has direct access to SQLite database tools to check stock, query order statuses, create new orders, and generate morning briefings.

---

## 🏗️ Architecture & Stack

The project is split into three main microservices:

1.  **Frontend (`/frontend`)**: Next.js 15, React, TailwindCSS, TypeScript
2.  **Backend (`/backend`)**: Python, FastAPI, SQLAlchemy, SQLite, OpenAI SDK (for Ollama/Groq)
3.  **WhatsApp Bot (`/whatsapp-bot`)**: Node.js, `whatsapp-web.js`, Express

---

## ⚙️ Setup & Installation

### 1. Python FastAPI Backend
The backend serves as the brain, hosting the AI Orchestrator and the SQLite database.

```bash
cd backend
python -m venv venv
# Activate venv: `venv\Scripts\activate` (Windows) or `source venv/bin/activate` (Mac/Linux)
pip install -r requirements.txt
```

**Configuration**: 
Create a `.env` file in the `backend/` directory:
```env
# Optional: Set this if you want to use Groq API instead of local Ollama
GROQ_API_KEY=gsk_your_groq_api_key_here
```

**Run the Backend**:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```
*Note: The database (`sme.db`) will be automatically seeded with mock cooperative data on the first run.*

### 2. Next.js Frontend
The frontend provides the UI for the Customer Hub and Inventory dashboards.

```bash
cd frontend
npm install
npm run dev
```
Access the dashboard at `http://localhost:3000`.

### 3. Node.js WhatsApp Bot
The WhatsApp bot intercepts messages and forwards them to the Python backend.

```bash
cd whatsapp-bot
npm install
node index.js
```
*   When you start the bot, a **QR code** will appear in the terminal.
*   Open WhatsApp on your phone, go to **Linked Devices**, and scan the QR code.
*   Once authenticated, the bot will listen for incoming direct messages (group chats are ignored). 
*   If the sender's phone number exists in the backend SQLite database, the AI will process the message and reply automatically!

---

## 🧠 AI Integration

The system uses an **Agentic Workflow**. The AI Orchestrator (`backend/app/agents/orchestrator.py`) is equipped with the following JSON schema tools:

*   `check_stock`: Query stock levels for products (e.g., Lavanta Sabunu).
*   `query_order_status`: Track customer orders by ID.
*   `create_order`: Programmatically generate a new order in the SQLite DB.
*   `get_morning_briefing`: Generate a daily operational briefing for the seller.

**Provider Toggle**: From the Next.js **Customer Hub** page, sellers can instantly toggle the AI provider between **Local (Ollama)** and **Groq API**.

---

## 📝 License
Created for the YZTA Hackathon 2026.
