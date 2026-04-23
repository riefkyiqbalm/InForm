function showPanel(name, btn) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  document.getElementById('panel-' + name).classList.add('active');
}
 
function togglePwd(id, icon) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  icon.textContent = inp.type === 'password' ? '👁' : '🙈';
}
 
function checkStrength(val) {
  const fill = document.getElementById('strengthFill');
  const label = document.getElementById('strengthLabel');
  let score = 0;
  if (val.length >= 8) score++;
  if (/[A-Z]/.test(val)) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;
  const levels = [
    {w:'0%', c:'transparent', t:''},
    {w:'25%', c:'#ff4d6d', t:'Lemah'},
    {w:'50%', c:'#f5c842', t:'Cukup'},
    {w:'75%', c:'#00d4c8', t:'Kuat'},
    {w:'100%',c:'#3dffa0', t:'Sangat Kuat'},
  ];
  fill.style.width  = levels[score].w;
  fill.style.background = levels[score].c;
  label.textContent = levels[score].t;
  label.style.color = levels[score].c;
}
 
function doLogin() {
  const email = document.getElementById('loginEmail').value;
  const pass  = document.getElementById('loginPass').value;
  if (!email || !pass) {
    document.getElementById('loginError').style.display = 'block'; return;
  }
  document.getElementById('loginError').style.display = 'none';
  // Simulate login
  const btn = document.querySelector('#panel-login .btn-primary');
  btn.textContent = '⏳ Memverifikasi…';
  btn.disabled = true;
  setTimeout(() => { window.location.href = '/'; }, 1200);
}
 
function doRegister() {
  const btn = document.querySelector('#panel-register .btn-primary');
  btn.textContent = '⏳ Mendaftar…';
  btn.disabled = true;
  setTimeout(() => { window.location.href = '/'; }, 1400);
}