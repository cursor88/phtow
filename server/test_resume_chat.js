const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/chat';

async function test() {
  console.log('=== 测试恢复会话后继续对话 ===\n');
  
  // 1. 创建会话并问诊
  console.log('1. 创建会话并发送消息');
  var createRes = await axios.post(`${BASE_URL}/create`);
  var sessionId = createRes.data.data.sessionId;
  console.log('   会话ID:', sessionId);
  
  var msg1 = await axios.post(`${BASE_URL}/message`, {
    sessionId: sessionId,
    message: '肚子阵痛两天'
  });
  console.log('   用户: 肚子阵痛两天');
  console.log('   AI回复:', msg1.data.data.text.substring(0, 40) + '...');
  console.log('');
  
  // 2. 结束会话
  console.log('2. 结束会话（保存到历史）');
  await axios.post(`${BASE_URL}/end/${sessionId}`);
  console.log('   会话已结束');
  console.log('');
  
  // 3. 获取历史详情（这会恢复会话）
  console.log('3. 获取历史详情（恢复会话）');
  var detail = await axios.get(`${BASE_URL}/history/${sessionId}`);
  console.log('   code:', detail.data.code);
  console.log('   历史消息数:', detail.data.data.history.length);
  console.log('');
  
  // 4. 在恢复的会话上发送新消息
  console.log('4. 在恢复的会话上发送新消息');
  var msg2 = await axios.post(`${BASE_URL}/message`, {
    sessionId: sessionId,
    message: '这个病是什么原因引起的？'
  });
  
  if (msg2.data.code === 0) {
    console.log('   ✅ 成功！');
    console.log('   用户: 这个病是什么原因引起的？');
    console.log('   AI回复:', msg2.data.data.text.substring(0, 60) + '...');
  } else {
    console.log('   ❌ 失败:', msg2.data.message);
  }
  
  console.log('\n测试完成！');
}

test();
