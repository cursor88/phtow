let quizListData = [];
let wrongQuestionsData = [];

function initQuizPages() {
  if (document.getElementById('page-quiz-list')) return;

  const html = `
<div class="page" id="page-quiz-list">
  <div class="nav-bar">
    <span class="back" onclick="showPage('page-quiz')">←</span>
    <span class="title">题库列表</span>
    <span class="spacer"></span>
  </div>
  <div class="search-bar" style="margin:16px;">
    <span class="search-icon">🔍</span>
    <input type="text" placeholder="搜索题目" id="quiz-search-input" oninput="handleQuizSearch()">
  </div>
  <div class="category-tabs" id="quiz-category-tabs"></div>
  <div id="quiz-list-content"></div>
</div>

<div class="page" id="page-wrong-questions">
  <div class="nav-bar">
    <span class="back" onclick="showPage('page-quiz')">←</span>
    <span class="title">错题本</span>
    <span class="spacer"></span>
  </div>
  <div id="wrong-questions-content"></div>
</div>

<div class="modal-overlay" id="quiz-detail-modal" onclick="closeQuizDetailModal()">
  <div class="modal-content" style="max-width:90%;max-height:80vh;overflow-y:auto;" onclick="event.stopPropagation()">
    <div class="modal-header" style="padding:20px;">
      <div class="modal-close" onclick="closeQuizDetailModal()">×</div>
      <div id="quiz-detail-category" style="font-size:12px;color:#2d8b5e;margin-bottom:8px;"></div>
      <div id="quiz-detail-difficulty" style="font-size:12px;color:#666;margin-bottom:8px;"></div>
    </div>
    <div class="modal-body" style="padding:20px;">
      <div id="quiz-detail-question" style="font-size:16px;font-weight:600;color:#333;margin-bottom:20px;"></div>
      <div id="quiz-detail-options" style="margin-bottom:20px;"></div>
      <div id="quiz-detail-answer" style="display:none;margin-bottom:16px;padding:12px;background:#f0f9f4;border-radius:8px;">
        <div style="font-weight:600;color:#2d8b5e;margin-bottom:8px;">✓ 正确答案</div>
        <div id="quiz-detail-answer-text" style="color:#333;"></div>
      </div>
      <div id="quiz-detail-explanation" style="display:none;padding:12px;background:#fffbeb;border-radius:8px;">
        <div style="font-weight:600;color:#b45309;margin-bottom:8px;">💡 答案解析</div>
        <div style="color:#666;line-height:1.6;"></div>
      </div>
      <div id="quiz-detail-wrong" style="display:none;margin-bottom:16px;padding:12px;background:#fef2f2;border-radius:8px;">
        <div style="font-weight:600;color:#dc2626;margin-bottom:8px;">✗ 你的答案</div>
        <div id="quiz-detail-wrong-text" style="color:#333;"></div>
      </div>
    </div>
    <div class="modal-footer" style="padding:16px 20px;border-top:1px solid #eee;">
      <button class="btn-auth btn-auth-primary" style="width:100%;" id="quiz-detail-show-answer-btn" onclick="showQuizDetailAnswer()">查看答案解析</button>
      <button class="btn-auth btn-auth-secondary" style="width:100%;margin-top:10px;display:none;" id="quiz-detail-close-btn" onclick="closeQuizDetailModal()">关闭</button>
    </div>
  </div>
</div>
`;

  const container = document.createElement('div');
  container.innerHTML = html;
  const body = document.body;
  while (container.children.length > 0) {
    body.insertBefore(container.children[0], body.querySelector('.modal-overlay') || body.lastChild);
  }

  loadQuizCategories();
}

const QUIZ_CATEGORIES = ['全部', '功效主治', '性味归经', '用法用量', '禁忌配伍', '鉴别特征'];
const QUIZ_DIFFICULTIES = ['全部', '简单', '中等', '困难'];

let currentQuizCategory = '全部';
let currentQuizDifficulty = '全部';

function loadQuizCategories() {
  const tabsEl = document.getElementById('quiz-category-tabs');
  if (!tabsEl) return;
  
  tabsEl.innerHTML = QUIZ_CATEGORIES.map(cat => `
    <span class="category-tab ${cat === currentQuizCategory ? 'active' : ''}" onclick="setQuizCategory('${cat}')">${cat}</span>
  `).join('');
}

function setQuizCategory(cat) {
  currentQuizCategory = cat;
  loadQuizCategories();
  renderQuizList();
}

async function loadQuizList() {
  try {
    const res = await fetch(API_BASE + '/quiz/list?page=1&pageSize=100');
    const data = await res.json();
    if (data.code === 0 && data.data) {
      quizListData = data.data.list;
      renderQuizList();
    }
  } catch (e) {
    console.error('loadQuizList error:', e);
  }
}

function handleQuizSearch() {
  renderQuizList();
}

function renderQuizList() {
  const container = document.getElementById('quiz-list-content');
  if (!container) return;

  const search = document.getElementById('quiz-search-input')?.value || '';
  
  let filtered = quizListData;
  if (currentQuizCategory !== '全部') {
    filtered = filtered.filter(q => q.category === currentQuizCategory);
  }
  if (search) {
    filtered = filtered.filter(q => q.question.includes(search));
  }

  if (!filtered.length) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-text">暂无题目</div>
      </div>
    `;
    return;
  }

  container.innerHTML = filtered.map(item => `
    <div class="card" style="margin:16px;cursor:pointer;" onclick="showQuizDetail(${item.id})">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div style="font-size:13px;color:#2d8b5e;background:#f0f9f4;padding:4px 10px;border-radius:12px;">${item.category}</div>
        <div style="font-size:12px;color:#999;">${item.difficulty}</div>
      </div>
      <div style="font-size:15px;color:#333;line-height:1.5;">${item.question}</div>
      <div style="font-size:13px;color:#999;margin-top:8px;">点击查看详情和答案解析</div>
    </div>
  `).join('');
}

let currentQuizDetailId = null;
let currentQuizDetailIsWrong = false;

function showQuizDetail(id) {
  currentQuizDetailId = id;
  currentQuizDetailIsWrong = false;
  
  const modal = document.getElementById('quiz-detail-modal');
  const showBtn = document.getElementById('quiz-detail-show-answer-btn');
  const closeBtn = document.getElementById('quiz-detail-close-btn');
  const answerDiv = document.getElementById('quiz-detail-answer');
  const explDiv = document.getElementById('quiz-detail-explanation');
  const wrongDiv = document.getElementById('quiz-detail-wrong');

  showBtn.style.display = 'block';
  closeBtn.style.display = 'none';
  answerDiv.style.display = 'none';
  explDiv.style.display = 'none';
  wrongDiv.style.display = 'none';

  modal.style.display = 'flex';

  fetchQuizDetail(id);
}

async function fetchQuizDetail(id) {
  try {
    const res = await fetch(API_BASE + '/quiz/detail/' + id);
    const data = await res.json();
    if (data.code === 0 && data.data) {
      const q = data.data;
      document.getElementById('quiz-detail-category').textContent = q.category;
      document.getElementById('quiz-detail-difficulty').textContent = '难度：' + q.difficulty;
      document.getElementById('quiz-detail-question').textContent = q.question;
      document.getElementById('quiz-detail-answer-text').textContent = q.answer;
      document.getElementById('quiz-detail-explanation').querySelector('div:nth-child(2)').textContent = q.explanation || '暂无解析';
      
      document.getElementById('quiz-detail-options').innerHTML = q.options.map(opt => `
        <div style="padding:12px;border:1px solid #eee;border-radius:8px;margin-bottom:8px;color:#333;">${opt}</div>
      `).join('');
    }
  } catch (e) {
    console.error('fetchQuizDetail error:', e);
  }
}

function showQuizDetailAnswer() {
  document.getElementById('quiz-detail-show-answer-btn').style.display = 'none';
  document.getElementById('quiz-detail-close-btn').style.display = 'block';
  document.getElementById('quiz-detail-answer').style.display = 'block';
  document.getElementById('quiz-detail-explanation').style.display = 'block';
  if (currentQuizDetailIsWrong) {
    document.getElementById('quiz-detail-wrong').style.display = 'block';
  }
}

function closeQuizDetailModal() {
  document.getElementById('quiz-detail-modal').style.display = 'none';
}

async function loadWrongQuestions() {
  if (!isLoggedIn()) {
    const container = document.getElementById('wrong-questions-content');
    if (container) {
      container.innerHTML = `
        <div class="empty-state" style="padding:60px 20px;">
          <div class="empty-icon">🔒</div>
          <div class="empty-text">请先登录查看错题本</div>
          <button class="btn-auth btn-auth-primary" style="margin-top:20px;" onclick="showPage('page-login')">去登录</button>
        </div>
      `;
    }
    return;
  }

  try {
    const res = await fetch(API_BASE + '/wrong-questions/list', {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.code === 0 && data.data) {
      wrongQuestionsData = data.data.list;
      renderWrongQuestions();
    }
  } catch (e) {
    console.error('loadWrongQuestions error:', e);
  }
}

function renderWrongQuestions() {
  const container = document.getElementById('wrong-questions-content');
  if (!container) return;

  if (!wrongQuestionsData.length) {
    container.innerHTML = `
      <div class="empty-state" style="padding:60px 20px;">
        <div class="empty-icon">🎉</div>
        <div class="empty-text">暂无错题</div>
        <div class="empty-desc">继续加油，保持全对！</div>
      </div>
    `;
    return;
  }

  container.innerHTML = wrongQuestionsData.map(item => `
    <div class="card" style="margin:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
        <div style="font-size:13px;color:#2d8b5e;background:#f0f9f4;padding:4px 10px;border-radius:12px;">${item.category}</div>
        <div style="font-size:12px;color:#999;">${item.difficulty}</div>
      </div>
      <div style="font-size:15px;color:#333;line-height:1.5;margin-bottom:12px;">${item.question}</div>
      <div style="margin-bottom:12px;">
        ${item.options.map(opt => {
          const isCorrect = opt.startsWith(item.correctAnswer);
          const isWrong = opt.startsWith(item.userAnswer);
          let bg = '#fff';
          let border = '#eee';
          let color = '#333';
          if (isCorrect) { bg = '#f0f9f4'; border = '#2d8b5e'; color = '#2d8b5e'; }
          else if (isWrong && item.userAnswer !== item.correctAnswer) { bg = '#fef2f2'; border = '#dc2626'; color = '#dc2626'; }
          return `<div style="padding:10px;border:1px solid ${border};border-radius:6px;margin-bottom:6px;background:${bg};color:${color};">${opt}</div>`;
        }).join('')}
      </div>
      <div style="padding:12px;background:#fffbeb;border-radius:8px;margin-bottom:12px;">
        <div style="font-weight:600;color:#b45309;margin-bottom:8px;">💡 答案解析</div>
        <div style="color:#666;line-height:1.6;font-size:14px;">${item.explanation || '暂无解析'}</div>
      </div>
      <div style="display:flex;justify-content:flex-end;">
        <button style="padding:8px 16px;border:none;background:#f3f4f6;color:#666;border-radius:6px;font-size:13px;cursor:pointer;" onclick="removeWrongQuestion(${item.id})">移除错题</button>
      </div>
    </div>
  `).join('');
}

async function removeWrongQuestion(id) {
  if (!confirm('确定要移除这道错题吗？')) return;
  
  try {
    const res = await fetch(API_BASE + '/wrong-questions/remove/' + id, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (data.code === 0) {
      showToast('移除成功');
      wrongQuestionsData = wrongQuestionsData.filter(item => item.id !== id);
      renderWrongQuestions();
    } else {
      showToast(data.message || '移除失败');
    }
  } catch (e) {
    showToast('网络错误');
  }
}

function goToQuizList() {
  showPage('page-quiz-list');
  loadQuizList();
}

function goToWrongQuestions() {
  showPage('page-wrong-questions');
  loadWrongQuestions();
}

document.addEventListener('DOMContentLoaded', function() {
  initQuizPages();
});

if (document.readyState !== 'loading') {
  initQuizPages();
}
