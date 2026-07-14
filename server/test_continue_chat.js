const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/chat';

async function test() {
  console.log('=== 测试继续对话功能 ===\n');
  
  // 1. 获取历史列表
  var history = await axios.get(`${BASE_URL}/history`);
  if (!history.data.data || history.data.data.length === 0) {
    console.log('暂无历史记录');
    return;
  }
  
  var sessionId = history.data.data[0].sessionId;
  console.log('1. 历史记录sessionId:', sessionId);
  console.log('   对话数:', history.data.data[0].messageCount);
  console.log('');
  
  // 2. 获取详情（模拟前端点击记录）
  console.log('2. 获取详情（模拟点击记录）');
  var detail = await axios.get(`${BASE_URL}/history/${sessionId}`);
  console.log('   code:', detail.data.code);
  
  if (detail.data.data && detail.data.data.history) {
    console.log('   历史消息数:', detail.data.data.history.length);
    console.log('');
    console.log('   对话内容:');
    detail.data.data.history.forEach(function(msg, i) {
      var role = msg.role === 'user' ? '用户' : 'AI';
      var content = msg.content.substring(0, 60).replace(/\n/g, ' ');
      if (msg.content.length > 60) content += '...';
      console.log(`   ${i + 1}. [${role}] ${content}`);
    });
  } else {
    console.log('   ❌ 没有历史消息');
    console.log('   data:', JSON.stringify(detail.data.data, null, 2));
  }
  
  console.log('\n测试完成！');
}

test();