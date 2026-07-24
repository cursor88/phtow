// 用户系统回归测试
const http = require('http');

function req(method, path, body, token) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: 'localhost',
      port: 8080,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
    };
    if (token) opts.headers.Authorization = 'Bearer ' + token;
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
    console.log('Status:', r.status);
    console.log('Body:', JSON.stringify(r.data, null, 2));
  };

  // 1. 健康检查
  log('1. 健康检查', await req('GET', '/api/health'));

  // 2. 登录 demo
  const login = await req('POST', '/api/auth/login', { username: 'demo', password: 'demo123' });
  log('2. 登录 demo/demo123', login);
  const token = login.data.data?.token;
  if (!token) { console.log('登录失败,中止'); return; }

  // 3. profile
  log('3. 获取个人信息', await req('GET', '/api/auth/profile', null, token));

  // 4. 错题列表
  log('4. 错题列表 (应为空,demo 没答过题)', await req('GET', '/api/wrong-questions/list', null, token));

  // 5. 收藏列表
  log('5. 收藏列表 herb (应为空)', await req('GET', '/api/favorite/list/herb', null, token));

  // 6. 切换收藏
  log('6. 切换收藏 herb 5', await req('POST', '/api/favorite/toggle', { targetType: 'herb', targetId: 5 }, token));

  // 7. 再次查询
  log('7. 收藏列表 herb (应有 5)', await req('GET', '/api/favorite/list/herb', null, token));

  // 8. 收藏的 herbs 详情
  log('8. 收藏的 herb 详情列表', await req('GET', '/api/favorite/herbs', null, token));

  // 9. 提交错题 (答错)
  log('9. 答错题 q=1', await req('POST', '/api/wrong-questions/submit', { questionId: 1, answer: 'A' }, token));

  // 10. 错题列表
  log('10. 错题列表 (应有 q1)', await req('GET', '/api/wrong-questions/list', null, token));

  // 11. 删除错题
  log('11. 删除错题 q=1', await req('POST', '/api/wrong-questions/remove', { id: 1 }, token));

  // 12. 错题列表 (应为空)
  log('12. 错题列表 (应为空)', await req('GET', '/api/wrong-questions/list', null, token));

  // 13. 取消收藏
  log('13. 取消收藏 herb 5', await req('POST', '/api/favorite/toggle', { targetType: 'herb', targetId: 5 }, token));

  // 14. 登录 zhangsan (应能看到迁移的收藏)
  const login2 = await req('POST', '/api/auth/login', { username: 'zhangsan', password: 'demo123' });
  log('14. zhangsan 登录 (密码可能不是 demo123,可能失败)', login2);
  if (login2.data.data?.token) {
    log('15. zhangsan 收藏列表', await req('GET', '/api/favorite/list/herb', null, login2.data.data.token));
    log('16. zhangsan 错题列表', await req('GET', '/api/wrong-questions/list', null, login2.data.data.token));
  }

  // 17. 错误密码登录
  log('17. 错误密码登录', await req('POST', '/api/auth/login', { username: 'demo', password: 'wrong' }));

  // 18. 注册新用户
  log('18. 注册新用户', await req('POST', '/api/auth/register', { username: 'testmig', password: 'test1234', nickname: '迁移测试' }));

  console.log('\n=== 全部测试完成 ===');
})();
