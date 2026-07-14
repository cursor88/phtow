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

async function runTest() {
  console.log('=== 问答效果测试 ===\n');

  const sessionId = await createSession();
  if (!sessionId) {
    console.log('❌ 无法创建会话');
    return;
  }

  console.log(`会话ID: ${sessionId}\n`);

  const testCases = [
    { name: '症状报告 - 肚子阵痛两天', message: '肚子阵痛两天' },
    { name: '追问 - 这个病是什么原因引起的？', message: '这个病是什么原因引起的？' },
    { name: '症状报告 - 咳嗽有血', message: '咳嗽有血' },
    { name: '追问 - 这个方子的原理是什么？', message: '这个方子的原理是什么？' }
  ];

  for (const testCase of testCases) {
    console.log(`📋 ${testCase.name}`);
    console.log(`用户: ${testCase.message}`);
    
    const result = await sendMessage(sessionId, testCase.message);
    
    if (result && result.code === 0 && result.data) {
      console.log(`AI回复:`);
      console.log(result.data.text);
      if (result.data.diagnosis) {
        console.log(`\n🏥 辨证: ${result.data.diagnosis}`);
      }
      if (result.data.prescription) {
        console.log(`📜 处方: ${result.data.prescription.name}`);
      }
      if (result.data.suggestedQuestions && result.data.suggestedQuestions.length > 0) {
        console.log(`💡 建议问题: ${result.data.suggestedQuestions.join(' | ')}`);
      }
    } else {
      console.log('❌ 无回复或出错');
      console.log(result);
    }
    console.log('\n' + '='.repeat(60) + '\n');
    
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  await endSession(sessionId);
  console.log('测试完成！');
}

runTest();