const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/chat';

async function test() {
  console.log('=== 测试问诊历史管理功能 ===\n');
  
  // 1. 查看历史列表
  console.log('1. 获取历史列表');
  var history = await axios.get(`${BASE_URL}/history`);
  console.log('历史条数:', history.data.data ? history.data.data.length : 0);
  console.log('内容:', JSON.stringify(history.data.data, null, 2));
  console.log('');

  if (history.data.data && history.data.data.length > 0) {
    var firstId = history.data.data[0].sessionId;
    
    // 2. 获取详情
    console.log('2. 获取详情:', firstId);
    var detail = await axios.get(`${BASE_URL}/history/${firstId}`);
    console.log('详情code:', detail.data.code);
    if (detail.data.data) {
      console.log('  - 症状:', detail.data.data.summary);
      console.log('  - 辨证:', detail.data.data.diagnosis);
    }
    console.log('');

    // 3. 删除该条
    console.log('3. 删除该条记录');
    var delRes = await axios.delete(`${BASE_URL}/history/${firstId}`);
    console.log('删除结果:', delRes.data);
    console.log('');

    // 4. 再次查看历史
    console.log('4. 再次查看历史');
    var history2 = await axios.get(`${BASE_URL}/history`);
    console.log('剩余条数:', history2.data.data ? history2.data.data.length : 0);
  } else {
    console.log('暂无历史记录可测试');
  }
  
  console.log('\n测试完成！');
}

test();