/**
 * 忘记密码回归测试
 */
const http = require('http');

function req(method, path, body) {
  return new Promise((resolve, reject) => {
    const opts = { hostname: 'localhost', port: 8080, path, method, headers: { 'Content-Type': 'application/json' } };
    const r = http.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(d) }); }
        catch (e) { resolve({ status: res.statusCode, data: d }); }
      });
    });
    r.on('error', reject);
    if (body) r.write(JSON.stringify(body));
    r.end();
  });
}

(async () => {
  const log = (label, r) => {
    console.log(`\n=== ${label} ===`);
    console.log('Body:', JSON.stringify(r.data, null, 2));
  };

  // 1. 检查不存在的用户
  log('1. 不存在的用户', await req('POST', '/api/auth/forgot-check', { username: 'notexist123' }));

  // 2. demo 用户的安全问题
  log('2. demo 用户安全问题', await req('POST', '/api/auth/forgot-check', { username: 'demo' }));

  // 3. 答案错误
  log('3. 答案错误', await req('POST', '/api/auth/forgot-reset', { username: 'demo', answer: 'wrong', newPassword: 'newpass123' }));

  // 4. 答案正确，重置密码
  log('4. 答案正确重置密码 (答案=demo)', await req('POST', '/api/auth/forgot-reset', { username: 'demo', answer: 'demo', newPassword: 'newpass123' }));

  // 5. 用新密码登录
  log('5. 用新密码登录', await req('POST', '/api/auth/login', { username: 'demo', password: 'newpass123' }));

  // 6. 旧密码登录失败
  log('6. 旧密码登录失败', await req('POST', '/api/auth/login', { username: 'demo', password: 'demo123' }));

  // 7. 重置回原来密码方便后续测试
  log('7. 重置回 demo123', await req('POST', '/api/auth/forgot-reset', { username: 'demo', answer: 'demo', newPassword: 'demo123' }));

  // 8. 确认旧密码可用
  log('8. 确认 demo123 可用', await req('POST', '/api/auth/login', { username: 'demo', password: 'demo123' }));

  console.log('\n=== 忘记密码测试完成 ===');
})();
