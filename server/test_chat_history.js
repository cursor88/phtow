const axios = require('axios');

const BASE_URL = 'http://localhost:8080/api/chat';

async function createSession() {
  try {
    const res = await axios.post(`${BASE_URL}/create`);
    return res.data.data.sessionId;
  } catch (error) {
    console.error('创建会话失败:', error.message);
    return null;
  }
}

async function sendMessage(sessionId, message) {
  try {
    const res = await axios.post(`${BASE_URL}/message`, {
      sessionId: sessionId,
      message: message
    });
    return res.data;
  } catch (error) {
    console.error('发送消息失败:', error.message);
    return null;
  }
}

async function endSession(sessionId) {
  try {
    await axios.post(`${BASE_URL}/end/${sessionId}`);
  } catch (error) {
    console.error('结束会话失败:', error.message);
  }
}

async function getHistory() {
  try {
    const res = await axios.get(`${BASE_URL}/history`);
    return res.data;
  } catch (error) {
    console.error('获取历史失败:', error.message);
    return null;
  }
}

async function runTest() {
  console.log('=== 问诊历史功能测试 ===\n');

  // 先获取当前历史（应该是空的或之前的）
  console.log('1. 获取当前历史记录');
  var historyBefore = await getHistory();
  console.log('当前历史条数:', historyBefore && historyBefore.data ? historyBefore.data.length : 0);
  console.log('');

  // 创建会话并发送消息
  console.log('2. 创建会话并问诊');
  const sessionId = await createSession();
  if (!sessionId) {
    console.log('❌ 无法创建会话');
    return;
  }
  console.log('会话ID:', sessionId);

  await sendMessage(sessionId, '肚子阵痛两天');
  await new Promise(resolve => setTimeout(resolve, 500));
  await sendMessage(sessionId, '这个病是什么原因引起的？');
  await new Promise(resolve => setTimeout(resolve, 500));

  // 结束会话
  console.log('3. 结束会话（触发保存历史）');
  await endSession(sessionId);
  await new Promise(resolve => setTimeout(resolve, 500));

  // 获取历史
  console.log('4. 获取历史记录');
  var historyAfter = await getHistory();
  if (historyAfter && historyAfter.code === 0 && historyAfter.data) {
    console.log('历史条数:', historyAfter.data.length);
    if (historyAfter.data.length > 0) {
      var record = historyAfter.data[0];
      console.log('最新记录:');
      console.log('  - 症状摘要:', record.summary);
      console.log('  - 辨证:', record.diagnosis);
      console.log('  - 处方:', record.prescription);
      console.log('  - 对话数:', record.messageCount);
      console.log('  - 时间:', new Date(record.endedAt).toLocaleString());
    }
  }

  console.log('\n测试完成！');
}

runTest();