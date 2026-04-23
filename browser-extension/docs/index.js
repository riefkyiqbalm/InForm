// ─────────────────────────────────────────
//  STATE
// ─────────────────────────────────────────
let msgCount    = 0;
let currentMode = 'nutri';
let chatHistory = [];        // [{role, content}]
let isWaiting   = false;

// ─────────────────────────────────────────
//  TOAST NOTIFIKASI
// ─────────────────────────────────────────
function showToast(msg, type = 'info') {
  let t = document.getElementById('__toast__');
  if (!t) {
    t = document.createElement('div');
    t.id = '__toast__';
    t.style.cssText = `position:fixed;bottom:24px;right:24px;z-index:9999;
      padding:12px 18px;border-radius:12px;font-size:13px;font-family:'DM Sans',sans-serif;
      max-width:320px;line-height:1.5;transition:opacity .3s;box-shadow:0 4px 20px rgba(0,0,0,.4)`;
    document.body.appendChild(t);
  }
  const styles = {
    info: 'background:#0f2035;border:1px solid #00897f;color:#00d4c8',
    warn: 'background:#1a1500;border:1px solid #f5c842;color:#f5c842',
    err:  'background:#1a0008;border:1px solid #ff4d6d;color:#ff4d6d',
  };
  t.style.cssText += ';' + styles[type] || styles.info;
  t.textContent = msg;
  t.style.opacity = '1';
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.style.opacity = '0', 3500);
}

// ─────────────────────────────────────────
//  CEK STATUS LM STUDIO
// ─────────────────────────────────────────
async function checkStatus() {
  try {
    const r = await fetch('/api/status');
    const d = await r.json();
    const dot   = document.getElementById('statusDot');
    const label = document.getElementById('statusLabel');
    if (dot && label) {
      if (d.status === 'online') {
        dot.className     = 'dot-green';
        label.textContent = 'Online';
      } else {
        dot.className     = 'dot-red';
        label.textContent = 'Offline';
      }
    }
  } catch(e) { /* silent fail */ }
}
window.addEventListener('DOMContentLoaded', () => {
  checkStatus();
  setInterval(checkStatus, 30000);
});

// ─────────────────────────────────────────
//  UTILITAS UI
// ─────────────────────────────────────────
function autoResize(el) {
  el.style.height = 'auto';
  el.style.height = Math.min(el.scrollHeight, 140) + 'px';
}

function handleKey(e) {
  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
}

function setInputMode(mode, btn) {
  document.querySelectorAll('.input-mode-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const dz = document.getElementById('dropZone');
  dz.classList.toggle('visible', mode !== 'text');
}

function switchMode(mode, btn) {
  document.querySelectorAll('.mode-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  currentMode = mode;
}

function fillPrompt(text) {
  const inp = document.getElementById('msgInput');
  inp.value = text;
  autoResize(inp);
  inp.focus();
  const ws = document.getElementById('welcomeState');
  if (ws) ws.style.display = 'none';
}

function startNewChat() {
  chatHistory = [];
  msgCount    = 0;
  const area  = document.getElementById('chatArea');
  area.innerHTML = `
    <div class="welcome" id="welcomeState">
      <div class="welcome-icon">🥗</div>
      <h2>Selamat datang di <span>NutriGuard</span></h2>
      <p>Kirimkan foto, video, atau deskripsi teks menu makanan untuk analisis kandungan gizi otomatis. Atau unggah dokumen vendor MBG untuk verifikasi perizinan.</p>
      <div class="suggestion-grid">
        <div class="suggestion-card" onclick="fillPrompt('Analisis kandungan gizi: nasi goreng dengan telur dan sayuran')">
          <div class="sc-icon">📸</div>
          <div class="sc-title">Foto Makanan</div>
          <div class="sc-desc">Upload foto piring untuk estimasi gizi otomatis</div>
        </div>
        <div class="suggestion-card" onclick="fillPrompt('Hitung gizi menu: nasi 200g, ayam goreng 100g, tumis kangkung 80g, jeruk')">
          <div class="sc-icon">📝</div>
          <div class="sc-title">Deskripsi Menu</div>
          <div class="sc-desc">Ketik nama bahan dan porsi untuk analisis</div>
        </div>
        <div class="suggestion-card" onclick="fillPrompt('Apakah menu nasi, ayam, sayur, buah memenuhi standar AKG Kemenkes untuk anak SD usia 7-9 tahun?')">
          <div class="sc-icon">📊</div>
          <div class="sc-title">Standar AKG</div>
          <div class="sc-desc">Bandingkan menu dengan standar Kemenkes RI</div>
        </div>
        <div class="suggestion-card" onclick="fillPrompt('Verifikasi dokumen perizinan vendor MBG, cek kelengkapan dan deteksi anomali')">
          <div class="sc-icon">🏢</div>
          <div class="sc-title">Verifikasi Vendor</div>
          <div class="sc-desc">Upload dokumen untuk cek fraud & izin MBG</div>
        </div>
      </div>
    </div>`;
  document.getElementById('msgCount').textContent = 0;
}

// ─────────────────────────────────────────
//  RENDER PESAN
// ─────────────────────────────────────────
function appendMsg(role, html, meta = '') {
  const area = document.getElementById('chatArea');
  const now  = new Date().toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit'});
  const cls  = role === 'user' ? 'user' : 'bot';
  const av   = role === 'user' ? '👤' : '🌿';
  const div  = document.createElement('div');
  div.className = `msg ${cls}`;
  div.innerHTML = `
    <div class="msg-avatar">${av}</div>
    <div class="msg-body">
      <div class="msg-bubble">${html}</div>
      <div class="msg-time">${now}${meta ? ' · ' + meta : ''}</div>
    </div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
  return div;
}

function showTyping() {
  const area = document.getElementById('chatArea');
  const div  = document.createElement('div');
  div.className = 'msg bot';
  div.id        = '__typing__';
  div.innerHTML = `
    <div class="msg-avatar">🌿</div>
    <div class="msg-body">
      <div class="msg-bubble" style="padding:14px 16px">
        <div class="typing-dots"><span></span><span></span><span></span></div>
      </div>
    </div>`;
  area.appendChild(div);
  area.scrollTop = area.scrollHeight;
}

function removeTyping() {
  document.getElementById('__typing__')?.remove();
}

// ─────────────────────────────────────────
//  SEND MESSAGE  →  /api/chat
// ─────────────────────────────────────────
async function sendMessage() {
  if (isWaiting) return;
  const inp  = document.getElementById('msgInput');
  const text = inp.value.trim();
  if (!text) return;

  // Sembunyikan welcome screen
  const ws = document.getElementById('welcomeState');
  if (ws) ws.style.display = 'none';

  // Render pesan user
  const safeText = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  appendMsg('user', safeText);
  chatHistory.push({ role: 'user', content: text });

  // Reset input
  inp.value = '';
  inp.style.height = 'auto';
  msgCount++;
  document.getElementById('msgCount').textContent = msgCount;

  // Tombol send → loading state
  isWaiting = true;
  const sendBtn = document.querySelector('.send-btn');
  if (sendBtn) { sendBtn.disabled = true; sendBtn.style.opacity = '.5'; }

  showTyping();

  try {
    // ── Kirim ke Python backend → LM Studio ──
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory }),
    });

    removeTyping();

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || `HTTP ${response.status}`);
    }

    const data   = await response.json();
    const reply  = data.reply  || '(Respons kosong)';
    const model  = data.model  || 'qwen3-4b';
    const tokens = data.tokens || {};
    const meta   = `${model}${tokens.total_tokens ? ' · ' + tokens.total_tokens + ' tok' : ''}`;

    // Render respons AI (newline → <br>, **bold**)
    const formatted = reply
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\n/g, '<br>');

    appendMsg('assistant', formatted, meta);
    chatHistory.push({ role: 'assistant', content: reply });
    msgCount++;
    document.getElementById('msgCount').textContent = msgCount;

    // Update token counter di right panel
    const tokEl = document.getElementById('tokenCount');
    if (tokEl && tokens.total_tokens) tokEl.textContent = '~' + tokens.total_tokens;

  } catch (err) {
    removeTyping();
    const errMsg = `⚠ <strong>Gagal terhubung ke AI:</strong><br>${err.message}<br><br>
      <small>Pastikan:<br>
      1. Server Python sudah berjalan (<code>python3 server.py</code>)<br>
      2. LM Studio aktif di port 1234<br>
      3. Model Qwen3-4B sudah dimuat di LM Studio</small>`;
    appendMsg('assistant', errMsg, 'error');
    showToast('Gagal: ' + err.message, 'err');
  } finally {
    isWaiting = false;
    if (sendBtn) { sendBtn.disabled = false; sendBtn.style.opacity = '1'; }
  }
}

// ─────────────────────────────────────────
//  FILE HANDLER
// ─────────────────────────────────────────
function handleFile(input) {
  if (input.files[0]) {
    const f    = input.files[0];
    const name = f.name;
    const size = (f.size / 1024).toFixed(1);
    document.getElementById('msgInput').value =
      `[File diunggah: ${name} (${size} KB)] Tolong analisis konten file ini.`;
    autoResize(document.getElementById('msgInput'));
  }
}

document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('dropZone')?.addEventListener('click', () => {
    document.getElementById('fileInput').click();
  });
});

// ─────────────────────────────────────────
//  ROUTING  —  gunakan path server, bukan .html
// ─────────────────────────────────────────
function navigate(path) {
  window.location.href = path;
}