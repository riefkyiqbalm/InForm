User types in browser
      ↓
  main.py  (Flask web server, port 5000) 
      ↓  POST /chat
  main.py  (LLM connector + param extractor)
      ↓  requests.post to LLM
Ollama / LM Studio / llama.cpp  (local model)
      ↓  JSON response
  main.py  parses params, validates, builds mission dict
      ↓  if user says "run"
POST_TRAIN.run(mission)
      ↓
Return the requests (Perizinan, Nutri, Pengawasan dll)

**Catatan main.py akan di deprecated dan akan diganti denga fungsi masing2 (contoh:route.py, app.py,...)