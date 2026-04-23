

# +++ log/main.py
"""
InForm — Flask Backend (LangGraph Powered)
==========================================
Install:
  pip install flask flask-cors requests python-dotenv \
              langchain-openai langgraph langgraph-checkpoint-postgres \
              psycopg psycopg-pool pypdf python-docx openpyxl

Run: python main.py
Port: 5000 (default)

Endpoints registered:
  POST /api/chat    — Chat with LangGraph memory (thread_id = session ID)
  GET  /api/status  — Check LM Studio connection
  POST /analyze     — Form-fill AI analysis (from analyze.py)
  POST /extract     — File text extraction  (from analyze.py)

FIX vs original:
  - register_analyze_routes now receives app_graph so /analyze uses
    LangGraph Postgres checkpointer (memory persists per session).
  - System prompt updated to include file scanning capabilities.
  - Better error handling and startup logging.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import requests, os, sys
from dotenv import load_dotenv

# FIX: pass app_graph to register_analyze_routes
from analyze import register_analyze_routes

from typing import Annotated, TypedDict
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langgraph.graph import StateGraph, START, END
from langgraph.graph.message import add_messages
from langgraph.checkpoint.postgres import PostgresSaver
from psycopg_pool import ConnectionPool

load_dotenv()

# ── Config ─────────────────────────────────────────────────────────────────────
LM_STUDIO_BASE = os.getenv("LM_STUDIO_BASE", "http://localhost:1234/v1")
MODEL_NAME     = os.getenv("MODEL_NAME",     "qwen3-4b")
MAX_TOKENS     = int(os.getenv("MAX_TOKENS", "4096"))     # increased for large documents
TEMPERATURE    = float(os.getenv("TEMPERATURE", "0.7"))
FLASK_PORT     = int(os.getenv("FLASK_PORT", "5000"))
FLASK_DEBUG    = os.getenv("FLASK_DEBUG", "true").lower() == "true"
DATABASE_URL   = os.getenv("DATABASE_URL")
REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", "120"))  # Timeout in seconds for LLM requests

if not DATABASE_URL:
    print("[ERROR] DATABASE_URL tidak ditemukan di .env!")
    sys.exit(1)

MODELS_URL = LM_STUDIO_BASE.replace("/v1", "") + "/v1/models"

SYSTEM_PROMPT = """Anda adalah InForm, asisten AI multimodal multibahasa dengan keahlian:

1. Integrasi dengan browser extension (Chrome, Firefox, Opera, Edge).
2. Deteksi dan pembacaan form input dari berbagai website administrasi.
3. Pengisian form otomatis: laporan harian/bulanan/tahunan, perjanjian, keuangan.
4. Analisis keuangan untuk deteksi fraud dalam proses administrasi.
5. Identifikasi tipe field form: text, password, email, number, date, file, checkbox, radio, hidden, select.
6. Scanning dan analisis file multimodal:
   - Dokumen: PDF, DOCX, DOC, XLSX, XLS, PPTX, PPT
   - Teks/Kode: TXT, MD, JSON, CSV, JS, TS, TSX, JSX, PY, JAVA, C, CPP, GO, RS, PHP, HTML, CSS, YAML, SH
   - Media: MP4, MP3, MOV, JPG, PNG, SVG, WEBP

Aturan respons:
- Jawab dalam bahasa yang sama dengan bahasa prompt user.
- Jika ada dokumen terlampir dalam pesan, analisis dan gunakan isinya untuk menjawab.
- Sertakan format dan tipe form yang dibaca jika relevan.
- Jangan berikan diagnosis medis definitif.
- Untuk auto-fill: hanya isi field dengan data yang ada di dokumen, jangan mengarang. Kecuali data tidak tersedia berikan suggestion berdasarkan label.
- KEAMANAN DATA: JANGAN pernah membaca, menampilkan, atau menyimpan data sensitif seperti:
  * Password atau kata sandi
  * One-time token (OTP), kode verifikasi
  * Nomor kartu kredit lengkap (CVV, expiry date)
  * PIN, security code
  * Kunci API, secret key
  Jika user meminta data tersebut, tolak dengan sopan dan jelaskan alasan keamanan."""

# ── LangGraph setup ────────────────────────────────────────────────────────────
class State(TypedDict):
    messages: Annotated[list, add_messages]

llm = ChatOpenAI(
    base_url=LM_STUDIO_BASE,
    api_key="lm-studio",
    model=MODEL_NAME,
    temperature=TEMPERATURE,
    max_tokens=MAX_TOKENS,
    # Increase timeout for large document processing
    request_timeout=REQUEST_TIMEOUT,
)

def chatbot(state: State):
    system_msg       = SystemMessage(content=SYSTEM_PROMPT)
    messages_to_send = [system_msg] + state["messages"]
    response         = llm.invoke(messages_to_send)
    return {"messages": [response]}

workflow = StateGraph(State)
workflow.add_node("chatbot", chatbot)
workflow.add_edge(START, "chatbot")
workflow.add_edge("chatbot", END)

# Postgres checkpointer for persistent memory
connection_kwargs = {"autocommit": True}
pool = ConnectionPool(conninfo=DATABASE_URL, kwargs=connection_kwargs, max_size=10)
checkpointer = PostgresSaver(pool)

try:
    checkpointer.setup()
    print("[INFO] LangGraph Postgres checkpointer initialized.")
except Exception as e:
    print(f"[INFO] Checkpointer setup notice: {e}")

app_graph = workflow.compile(checkpointer=checkpointer)

# ── Flask app ──────────────────────────────────────────────────────────────────
app = Flask(__name__)
CORS(app)

# FIX: pass app_graph so /analyze uses LangGraph memory
try:
    register_analyze_routes(app, app_graph, llm, SYSTEM_PROMPT)
    print("[INFO] Routes /analyze dan /extract berhasil didaftarkan.")
except Exception as e:
    print(f"[ERROR] Gagal mendaftarkan analyze routes: {e}")

# ── Routes ─────────────────────────────────────────────────────────────────────

@app.route("/", methods=["GET"])
def index():
    return jsonify({"status": "online", "backend": "InForm LangGraph Backend", "model": MODEL_NAME})

@app.route("/api/chat", methods=["POST"])
def api_chat():
    try:
        body     = request.get_json(silent=True) or {}
        messages = body.get("messages", [])

        # thread_id ties LangGraph memory to a specific chat session
        thread_id = body.get("thread_id") or body.get("session_id")
        if not thread_id:
            return jsonify({"error": "thread_id or session_id is required"}), 400

        if not messages or not isinstance(messages, list):
            return jsonify({"error": "messages must be a non-empty array"}), 400

        # Use the latest user message (LangGraph handles full history via Postgres)
        latest_message = messages[-1].get("content", "").strip()
        if not latest_message:
            return jsonify({"error": "Latest message content is missing"}), 400

        print(f"[DEBUG] Thread: {thread_id} | Msg: {latest_message[:60]}...")

        config     = {"configurable": {"thread_id": thread_id}}
        input_data = {"messages": [HumanMessage(content=latest_message)]}
        result     = app_graph.invoke(input_data, config)
        final_reply = result["messages"][-1].content

        return jsonify({
            "reply":     final_reply,
            "model":     MODEL_NAME,
            "tokens":    {},
            "error":     None,
            "thread_id": thread_id,
        })

    except Exception as e:
        import traceback; traceback.print_exc()
        return jsonify({"reply": f"Server error: {str(e)}", "model":"error", "tokens":{}, "error":"server_error"}), 500

@app.route("/api/status", methods=["GET"])
def api_status():
    try:
        r      = requests.get(MODELS_URL, timeout=5)
        r.raise_for_status()
        models = [m["id"] for m in r.json().get("data", [])]
        return jsonify({"status": "online", "models": models})
    except Exception as e:
        return jsonify({"status": "offline", "models": [], "error": str(e)})

if __name__ == "__main__":
    print(f"""
=================================================================
  InForm — LangGraph Backend
=================================================================
  Port      : {FLASK_PORT}
  LM Studio : {LM_STUDIO_BASE}
  Model     : {MODEL_NAME}
  Max Tokens: {MAX_TOKENS}
  Database  : PostgreSQL (LangGraph checkpointer)
  Routes    : /api/chat, /api/status, /analyze, /extract
=================================================================
""")
    app.run(host="0.0.0.0", port=FLASK_PORT, debug=FLASK_DEBUG)