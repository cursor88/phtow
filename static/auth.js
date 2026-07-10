let currentUser = null;

function getToken() {
  return localStorage.getItem('auth_token') || '';
}

function setToken(token) {
  if (token) {
    localStorage.setItem('auth_token', token);
  } else {
    localStorage.removeItem('auth_token');
  }
}

function isLoggedIn() {
  return !!getToken();
}

function getAuthHeaders() {
  const token = getToken();
  const headers = { 'Accept': 'application/json' };
  if (token) {
    headers['Authorization'] = 'Bearer ' + token;
  }
  return headers;
}

function showToast(msg) {
  if (window.showToast) {
    window.showToast(msg);
  } else {
    alert(msg);
  }
}

function showLoginPage() {
  if (typeof showPage === 'function') {
    showPage('page-login');
  }
}

async function loadCurrentUser() {
  if (!getToken()) {
    currentUser = null;
    return null;
  }
  try {
    const res = await fetch(API_BASE + '/auth/profile', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.code === 0 && data.data) {
      currentUser = data.data;
      return data.data;
    } else {
      setToken('');
      currentUser = null;
      return null;
    }
  } catch (e) {
    console.error('loadCurrentUser error:', e);
    return null;
  }
}

async function handleLogin() {
  const username = document.getElementById('login-username').value.trim();
  const password = document.getElementById('login-password').value;
  const errorEl = document.getElementById('login-error');
  const btn = document.getElementById('login-btn');

  errorEl.style.display = 'none';
  if (!username) {
    showLoginError('请输入用户名');
    return;
  }
  if (!password) {
    showLoginError('请输入密码');
    return;
  }

  btn.disabled = true;
  btn.textContent = '登录中...';

  try {
    const res = await fetch(API_BASE + '/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.code === 0 && data.data) {
      setToken(data.data.token);
      currentUser = data.data.user;
      showToast('登录成功');
      if (typeof showPage === 'function') showPage('page-profile');
      if (typeof updateProfileHeader === 'function') updateProfileHeader();
    } else {
      showLoginError(data.message || '登录失败');
    }
  } catch (e) {
    showLoginError('网络错误，请稍后重试');
  } finally {
    btn.disabled = false;
    btn.textContent = '登录';
  }
}

function showLoginError(msg) {
  const el = document.getElementById('login-error');
  el.textContent = msg;
  el.style.display = 'block';
}

async function handleRegister() {
  const username = document.getElementById('reg-username').value.trim();
  const nickname = document.getElementById('reg-nickname').value.trim();
  const password = document.getElementById('reg-password').value;
  const password2 = document.getElementById('reg-password2').value;
  const errorEl = document.getElementById('reg-error');
  const btn = document.getElementById('reg-btn');

  errorEl.style.display = 'none';
  if (username.length < 3) {
    showRegError('用户名至少3位');
    return;
  }
  if (password.length < 6) {
    showRegError('密码至少6位');
    return;
  }
  if (password !== password2) {
    showRegError('两次输入的密码不一致');
    return;
  }

  btn.disabled = true;
  btn.textContent = '注册中...';

  try {
    const res = await fetch(API_BASE + '/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify({ username, password, nickname })
    });
    const data = await res.json();

    if (data.code === 0 && data.data) {
      setToken(data.data.token);
      currentUser = data.data.user;
      showToast('注册成功');
      if (typeof showPage === 'function') showPage('page-profile');
      if (typeof updateProfileHeader === 'function') updateProfileHeader();
    } else {
      showRegError(data.message || '注册失败');
    }
  } catch (e) {
    showRegError('网络错误，请稍后重试');
  } finally {
    btn.disabled = false;
    btn.textContent = '注册';
  }
}

function showRegError(msg) {
  const el = document.getElementById('reg-error');
  el.textContent = msg;
  el.style.display = 'block';
}

function showLogoutConfirm() {
  if (confirm('确定要退出登录吗？')) {
    setToken('');
    currentUser = null;
    showToast('已退出登录');
    if (typeof updateProfileHeader === 'function') updateProfileHeader();
    if (typeof updateProfileHeader === 'function') updateProfileHeader();
  }
}

function requireLogin() {
  if (!isLoggedIn()) {
    showToast('请先登录');
    if (typeof showPage === 'function') showPage('page-login');
    return false;
  }
  return true;
}

loadCurrentUser();
