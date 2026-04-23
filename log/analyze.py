from flask import request, jsonify
from langchain_core.messages import HumanMessage, SystemMessage
import json, re

ANALYZE_SYSTEM_PROMPT = """Anda adalah InForm, AI form-filler yang sangat akurat.
Tugas Anda: membaca dokumen dan mengekstrak nilai yang tepat untuk setiap field form.
Aturan:
- Hanya isi field yang memiliki data jelas di dokumen.
- Jangan mengarang data pribadi (NIK, password, nomor kartu kredit).
- Untuk field tanggal gunakan format ISO (YYYY-MM-DD).
- Untuk field select, nilai harus persis sama dengan salah satu opsi yang tersedia.
- Confidence: 0.0-1.0 (seberapa yakin Anda).
- Source: singkat, dari mana nilai ini berasal di dokumen.
- KEAMANAN DATA SENSITIF:
  * JANGAN PERNAH membaca, menampilkan, atau menyimpan: password, one-time token (OTP), kode verifikasi, CVV kartu kredit, PIN, secret key, API key.
  * Jika field meminta data sensitif tersebut, lewati (skip) dan beri catatan bahwa data tidak boleh diproses demi keamanan.
  * Jika user bertanya tentang data sensitif, tolak dengan sopan dan jelaskan alasan keamanan."""

def register_analyze_routes(app, app_graph, llm, SYSTEM_PROMPT):
    """
    Register /analyze and /extract routes.

    Parameters:
        app        — Flask app instance
        app_graph  — compiled LangGraph agent (with Postgres checkpointer)
        llm        — ChatOpenAI instance
        SYSTEM_PROMPT — main system prompt string
    """

    @app.route("/analyze", methods=["POST"])
    def analyze():
        body          = request.get_json(silent=True) or {}
        schema        = body.get("schema", [])
        document_text = body.get("document_text", "")
        document_name = body.get("document_name", "")
        # Optional: session_id for LangGraph memory continuity
        session_id    = body.get("session_id", "analyze-global")

        if not schema and not document_text:
            return jsonify({"error": "schema or document_text is required"}), 400

        # Build field summary
        field_lines = []
        for f in schema:
            key     = f.get("name") or f.get("id") or ""
            typ     = f.get("type", "text")
            lbl     = f.get("label") or f.get("placeholder") or key
            opts    = f.get("options", [])
            req_str = " [required]" if f.get("required") else ""
            opt_str = f" options: {opts}" if opts else ""
            if key:  # skip fields with no identifier
                field_lines.append(f'  - key="{key}" type={typ} label="{lbl}"{opt_str}{req_str}')

        fields_prompt = "\n".join(field_lines) if field_lines else "  (no specific schema provided)"

        doc_section = (
            f"\n\nDOKUMEN REFERENSI ({document_name or 'uploaded'}):\n"
            f"{document_text[:8000]}"  # Increased from 6000
            if document_text
            else "\n\nTidak ada dokumen — gunakan pengetahuan umum jika relevan."
        )

        prompt = f"""{ANALYZE_SYSTEM_PROMPT}

FORM FIELDS YANG HARUS DIISI:
{fields_prompt}
{doc_section}

Respond ONLY with a valid JSON object (no markdown, no explanation):
{{
  "filled": {{
    "field_key": {{
      "value": "extracted value",
      "confidence": 0.95,
      "source": "from document section X"
    }}
  }},
  "summary": "Brief summary of what was found and filled (in Indonesian)"
}}"""

        try:
            # Use LangGraph for memory-aware analyze (ties to session)
            config   = {"configurable": {"thread_id": f"analyze-{session_id}"}}
            input_data = {"messages": [HumanMessage(content=prompt)]}
            result   = app_graph.invoke(input_data, config)
            raw      = result["messages"][-1].content.strip()

            # Robust JSON extraction — handles markdown code fences
            # Try direct parse first
            try:
                data = json.loads(raw)
            except json.JSONDecodeError:
                # Strip markdown fences
                cleaned = re.sub(r"```(?:json)?\s*", "", raw).strip().rstrip("`").strip()
                try:
                    data = json.loads(cleaned)
                except json.JSONDecodeError:
                    # Extract outermost JSON object
                    match = re.search(r'\{[\s\S]*\}', cleaned)
                    if not match:
                        print(f"[analyze] AI did not return valid JSON. Raw:\n{raw[:500]}")
                        return jsonify({"error": "AI did not return valid JSON", "filled": {}}), 502
                    data = json.loads(match.group())

            # Ensure filled key exists
            if "filled" not in data:
                data["filled"] = {}

            return jsonify(data)

        except Exception as e:
            import traceback; traceback.print_exc()
            return jsonify({"error": str(e), "filled": {}}), 500


    @app.route("/extract", methods=["POST"])
    def extract_text():
        """Extract plain text from uploaded file."""
        if "file" not in request.files:
            return jsonify({"error": "No file"}), 400

        file     = request.files["file"]
        filename = file.filename or ""
        ext      = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""

        text = ""
        try:
            # ── Plain text formats ─────────────────────────────────────────
            if ext in ("txt", "md", "json", "csv", "yaml", "yml", "toml",
                       "py", "js", "ts", "tsx", "jsx", "java", "c", "cpp",
                       "cs", "go", "rs", "rb", "php", "html", "css", "sh",
                       "sql", "xml", "log"):
                text = file.read().decode("utf-8", errors="ignore")

            # ── PDF ────────────────────────────────────────────────────────
            elif ext == "pdf":
                import io
                try:
                    import pypdf
                    reader = pypdf.PdfReader(io.BytesIO(file.read()))
                    pages  = [p.extract_text() or "" for p in reader.pages]
                    text   = "\n\n".join(pages)
                except ImportError:
                    text = "[Error: pypdf not installed. Run: pip install pypdf]"

            # ── DOCX ───────────────────────────────────────────────────────
            elif ext in ("docx", "doc"):
                import io
                try:
                    import docx as python_docx
                    doc  = python_docx.Document(io.BytesIO(file.read()))
                    text = "\n".join(p.text for p in doc.paragraphs if p.text.strip())
                except ImportError:
                    text = "[Error: python-docx not installed. Run: pip install python-docx]"

            # ── Excel ──────────────────────────────────────────────────────
            elif ext in ("xlsx", "xls"):
                import io
                try:
                    import openpyxl
                    wb    = openpyxl.load_workbook(io.BytesIO(file.read()), data_only=True)
                    lines = []
                    for sheet in wb.worksheets:
                        lines.append(f"[Sheet: {sheet.title}]")
                        for row in sheet.iter_rows(values_only=True):
                            cells = [str(c) for c in row if c is not None]
                            if cells: lines.append("\t".join(cells))
                    text = "\n".join(lines)
                except ImportError:
                    text = "[Error: openpyxl not installed. Run: pip install openpyxl]"

            # ── Images / video / audio — return empty (no text extraction) ─
            elif ext in ("jpg", "jpeg", "png", "svg", "webp", "mp4", "mp3", "mov"):
                text = f"[Binary file: {filename} — no text extraction available]"

            # ── Fallback ───────────────────────────────────────────────────
            else:
                text = file.read().decode("utf-8", errors="ignore")

        except Exception as e:
            text = f"[Extraction error: {e}]"

        return jsonify({"text": text, "chars": len(text), "ext": ext})