function initAuthPages() {
  if (document.getElementById('page-login')) return;

  const loginHtml = `
<div class="page" id="page-login">
  <div class="auth-page">
    <div class="auth-logo">
      <div class="icon">🌿</div>
      <div class="title">本草智识</div>
      <div class="subtitle">AI中药药材识别与学习平台</div>
    </div>
    <div class="auth-card">
      <div class="auth-title">登录</div>
      <div class="form-group">
        <label>用户名</label>
        <input type="text" class="form-input" id="login-username" placeholder="请输入用户名" maxlength="20">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input type="password" class="form-input" id="login-password" placeholder="请输入密码" maxlength="32">
      </div>
      <div class="form-error" id="login-error" style="display:none;"></div>
      <button class="btn-auth btn-auth-primary" id="login-btn" onclick="handleLogin()">登录</button>
      <div class="auth-switch">
        还没有账号？<span onclick="showPage('page-register')">立即注册</span>
      </div>
    </div>
  </div>
</div>

<div class="page" id="page-register">
  <div class="auth-page">
    <div class="auth-logo">
      <div class="icon">🌿</div>
      <div class="title">本草智识</div>
      <div class="subtitle">AI中药药材识别与学习平台</div>
    </div>
    <div class="auth-card">
      <div class="auth-title">注册</div>
      <div class="form-group">
        <label>用户名</label>
        <input type="text" class="form-input" id="reg-username" placeholder="3-20位，支持中英文、数字、下划线" maxlength="20">
      </div>
      <div class="form-group">
        <label>昵称</label>
        <input type="text" class="form-input" id="reg-nickname" placeholder="显示的昵称（选填）" maxlength="20">
      </div>
      <div class="form-group">
        <label>密码</label>
        <input type="password" class="form-input" id="reg-password" placeholder="6-32位" maxlength="32">
      </div>
      <div class="form-group">
        <label>确认密码</label>
        <input type="password" class="form-input" id="reg-password2" placeholder="请再次输入密码" maxlength="32">
      </div>
      <div class="form-error" id="reg-error" style="display:none;"></div>
      <button class="btn-auth btn-auth-primary" id="reg-btn" onclick="handleRegister()">注册</button>
      <div class="auth-switch">
        已有账号？<span onclick="showPage('page-login')">去登录</span>
      </div>
    </div>
  </div>
</div>`;

  const styleHtml = `
    .auth-page { min-height: 100vh; background: linear-gradient(135deg, #2d8b5e, #3da878); padding: 60px 24px 24px; }
    .auth-logo { text-align: center; margin-bottom: 40px; }
    .auth-logo .icon { font-size: 64px; margin-bottom: 12px; }
    .auth-logo .title { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 6px; }
    .auth-logo .subtitle { font-size: 14px; color: rgba(255,255,255,0.85); }
    .auth-card { background: #fff; border-radius: 20px; padding: 32px 24px 24px; box-shadow: 0 8px 32px rgba(0,0,0,0.1); }
    .auth-card .auth-title { font-size: 22px; font-weight: 600; color: #333; margin-bottom: 24px; }
    .form-group { margin-bottom: 18px; }
    .form-group label { display: block; font-size: 13px; color: #666; margin-bottom: 8px; font-weight: 500; }
    .form-input { width: 100%; padding: 12px 16px; border: 1.5px solid #e5e7eb; border-radius: 10px; font-size: 15px; outline: none; transition: border-color 0.2s; box-sizing: border-box; }
    .form-input:focus { border-color: #2d8b5e; }
    .form-error { font-size: 12px; color: #ef4444; margin-top: 6px; }
    .btn-auth { width: 100%; padding: 14px; border-radius: 50px; font-size: 16px; font-weight: 600; border: none; cursor: pointer; margin-top: 12px; }
    .btn-auth-primary { background: linear-gradient(135deg, #2d8b5e, #3da878); color: #fff; }
    .btn-auth-primary:disabled { opacity: 0.6; cursor: not-allowed; }
    .auth-switch { text-align: center; margin-top: 20px; font-size: 14px; color: #666; }
    .auth-switch span { color: #2d8b5e; cursor: pointer; font-weight: 500; }
    .profile-menu-item { display: flex; align-items: center; padding: 16px 20px; background: #fff; border-bottom: 1px solid #f5f5f5; cursor: pointer; }
    .profile-menu-item .menu-icon { width: 36px; height: 36px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: #f0f9f4; font-size: 18px; margin-right: 14px; }
    .profile-menu-item .menu-text { flex: 1; font-size: 15px; color: #333; }
    .profile-menu-item .menu-arrow { color: #ccc; font-size: 16px; }
    .profile-menu { margin: 0 16px; border-radius: 12px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.04); }
  `;

  const styleEl = document.createElement('style');
  styleEl.textContent = styleHtml;
  document.head.appendChild(styleEl);

  const container = document.createElement('div');
  container.innerHTML = loginHtml;
  const body = document.body;
  while (container.children.length > 0) {
    body.insertBefore(container.children[0], body.querySelector('.modal-overlay') || body.lastChild);
  }
}

function updateProfileHeader() {
  const headerInfo = document.querySelector('#page-profile .profile-text');
  const avatar = document.querySelector('#page-profile .profile-avatar');

  let menuLogged = document.getElementById('profile-menu-logged');
  let menuGuest = document.getElementById('profile-menu-guest');

  if (!menuLogged || !menuGuest) {
    const profilePage = document.getElementById('page-profile');
    if (profilePage) {
      const menuHtml = `
        <div class="profile-menu" style="margin-top:20px;" id="profile-menu-logged">
          <div class="profile-menu-item" onclick="showLogoutConfirm()">
            <div class="menu-icon">🚪</div>
            <div class="menu-text">退出登录</div>
            <div class="menu-arrow">›</div>
          </div>
        </div>
        <div class="profile-menu" style="margin-top:20px;display:none;" id="profile-menu-guest">
          <div class="profile-menu-item" onclick="showPage('page-login')">
            <div class="menu-icon">🔑</div>
            <div class="menu-text">登录 / 注册</div>
            <div class="menu-arrow">›</div>
          </div>
        </div>`;
      profilePage.insertAdjacentHTML('beforeend', menuHtml);
      menuLogged = document.getElementById('profile-menu-logged');
      menuGuest = document.getElementById('profile-menu-guest');
    }
  }

  if (currentUser) {
    if (headerInfo) {
      headerInfo.querySelector('.name').textContent = currentUser.nickname || currentUser.username;
      headerInfo.querySelector('.desc').textContent = '@' + currentUser.username;
    }
    if (menuLogged) menuLogged.style.display = 'block';
    if (menuGuest) menuGuest.style.display = 'none';
  } else {
    if (headerInfo) {
      headerInfo.querySelector('.name').textContent = '未登录';
      headerInfo.querySelector('.desc').textContent = '点击登录享受更多功能';
    }
    if (menuLogged) menuLogged.style.display = 'none';
    if (menuGuest) menuGuest.style.display = 'block';
  }
}

document.addEventListener('DOMContentLoaded', function() {
  initAuthPages();
  loadCurrentUser().then(function() {
    updateProfileHeader();
  });
});

if (document.readyState !== 'loading') {
  initAuthPages();
  loadCurrentUser().then(function() {
    updateProfileHeader();
  });
}
