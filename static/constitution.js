let _constitutionQuestions = [];
let _constitutionMode = 'standard';
let _constitutionAnswers = {};
let _constitutionCurrentIndex = 0;

async function openConstitutionTest(mode) {
  _constitutionMode = mode || 'standard';
  _constitutionAnswers = {};
  _constitutionCurrentIndex = 0;
  const res = await api('/constitution/questions?mode=' + _constitutionMode);
  _constitutionQuestions = (res && res.questions) ? res.questions : [];
  if (_constitutionQuestions.length === 0) { showToast('加载问卷失败'); return; }
  document.getElementById('constitution-modal').style.display = 'flex';
  renderConstitutionQuestion();
}

function closeConstitutionTest() {
  document.getElementById('constitution-modal').style.display = 'none';
  _constitutionQuestions = []; _constitutionAnswers = {};
}

function renderConstitutionQuestion() {
  const q = _constitutionQuestions[_constitutionCurrentIndex];
  const total = _constitutionQuestions.length;
  const progress = ((_constitutionCurrentIndex + 1) / total * 100).toFixed(0);
  document.getElementById('constitution-progress-bar').style.width = progress + '%';
  document.getElementById('constitution-progress-text').textContent = (_constitutionCurrentIndex + 1) + ' / ' + total;
  
  const options = ['从不','很少','有时','经常','总是'];
  document.getElementById('constitution-question').innerHTML = '<div style="font-size:16px;font-weight:600;margin-bottom:20px;">' + q.text + '</div><div style="display:flex;flex-direction:column;gap:10px;">' + options.map(function(opt, idx) {
    var style = _constitutionAnswers[q.id] === idx + 1 ? 'background:#10B981;color:#fff;' : 'background:#fff;color:#064E3B;border:1px solid #D1FAE5;';
    return '<button class="constitution-option" data-value="' + (idx + 1) + '" onclick="selectConstitutionOption(' + (idx + 1) + ')" style="padding:14px;border-radius:12px;font-size:14px;text-align:left;' + style + '">' + opt + '</button>';
  }).join('') + '</div>';
  
  var prevBtn = document.getElementById('constitution-prev');
  var nextBtn = document.getElementById('constitution-next');
  var submitBtn = document.getElementById('constitution-submit');
  prevBtn.style.display = _constitutionCurrentIndex > 0 ? 'block' : 'none';
  if (_constitutionCurrentIndex === total - 1) { nextBtn.style.display = 'none'; submitBtn.style.display = 'block'; }
  else { nextBtn.style.display = 'block'; submitBtn.style.display = 'none'; }
}

function selectConstitutionOption(value) {
  var q = _constitutionQuestions[_constitutionCurrentIndex];
  _constitutionAnswers[q.id] = value;
  document.querySelectorAll('.constitution-option').forEach(function(opt) {
    if (parseInt(opt.dataset.value) === value) { opt.style.background='#10B981'; opt.style.color='#fff'; opt.style.border='none'; }
    else { opt.style.background='#fff'; opt.style.color='#064E3B'; opt.style.border='1px solid #D1FAE5'; }
  });
}

function constitutionPrev() { if (_constitutionCurrentIndex > 0) { _constitutionCurrentIndex--; renderConstitutionQuestion(); } }
function constitutionNext() {
  var q = _constitutionQuestions[_constitutionCurrentIndex];
  if (!_constitutionAnswers[q.id]) { showToast('请选择答案'); return; }
  if (_constitutionCurrentIndex < _constitutionQuestions.length - 1) { _constitutionCurrentIndex++; renderConstitutionQuestion(); }
}

async function constitutionSubmit() {
  var unanswered = _constitutionQuestions.filter(function(q) { return !_constitutionAnswers[q.id]; });
  if (unanswered.length > 0) { showToast('还有 ' + unanswered.length + ' 题未作答'); return; }
  var answers = Object.keys(_constitutionAnswers).map(function(qid) { return { qid: parseInt(qid), value: _constitutionAnswers[qid] }; });
  var res = await apiPost('/constitution/submit', { answers: answers, mode: _constitutionMode });
  if (res) { renderConstitutionResult(res); } else { showToast('测评失败'); }
}

function renderConstitutionResult(data) {
  var types = {
    pinghe:{name:'平和质',color:'#10b981',desc:'精力充沛，适应力强'},
    qixu:{name:'气虚质',color:'#f59e0b',desc:'容易疲劳，活动气短'},
    yangxu:{name:'阳虚质',color:'#3b82f6',desc:'手脚冰凉，尤其怕冷'},
    yinxu:{name:'阴虚质',color:'#ef4444',desc:'手心发热，口干舌燥'},
    tanshi:{name:'痰湿质',color:'#84cc16',desc:'身体沉重，腹部肥软'},
    shire:{name:'湿热质',color:'#a855f7',desc:'面部油腻，易长痘痘'},
    xueyu:{name:'血瘀质',color:'#7c3aed',desc:'皮肤暗沉，容易淤青'},
    qiyu:{name:'气郁质',color:'#06b6d4',desc:'情绪抑郁，经常叹气'},
    tebing:{name:'特禀质',color:'#ec4899',desc:'容易过敏'}
  };

  var matchMap = {
    pinghe: [
      {name:'山药枸杞粥',type:'粥类',desc:'健脾养胃，滋补肝肾，适合日常养生',herbs:['山药','枸杞','大米']},
      {name:'大枣桂圆茶',type:'茶饮',desc:'补气养血，安神健脾，增强体质',herbs:['大枣','桂圆','枸杞']},
      {name:'百合莲子汤',type:'汤品',desc:'滋阴润肺，养心安神，平和调养',herbs:['百合','莲子','冰糖']}
    ],
    qixu: [
      {name:'人参粥',type:'粥类',desc:'大补元气，健脾养胃，适合气虚乏力',herbs:['人参','大米','大枣']},
      {name:'黄芪炖鸡',type:'汤品',desc:'补气升阳，固表止汗，增强免疫力',herbs:['黄芪','鸡肉','生姜']},
      {name:'党参山药炖排骨',type:'汤品',desc:'益气健脾，滋阴润燥，适合气虚体质',herbs:['党参','山药','排骨']}
    ],
    yangxu: [
      {name:'肉桂粥',type:'粥类',desc:'温中散寒，补肾助阳，适合阳虚畏寒',herbs:['肉桂','大米','红糖']},
      {name:'生姜羊肉汤',type:'汤品',desc:'温中补虚，散寒止痛，暖身驱寒',herbs:['生姜','羊肉','当归']},
      {name:'附子炖狗肉',type:'汤品',desc:'温肾助阳，散寒止痛，适合严重阳虚',herbs:['附子','狗肉','生姜']}
    ],
    yinxu: [
      {name:'麦冬百合粥',type:'粥类',desc:'滋阴润肺，清心安神，适合阴虚燥热',herbs:['麦冬','百合','大米']},
      {name:'沙参玉竹炖鸡汤',type:'汤品',desc:'滋阴清热，润肺生津，适合阴虚口干',herbs:['沙参','玉竹','鸡肉']},
      {name:'银耳莲子羹',type:'甜品',desc:'滋阴润燥，养心安神，适合阴虚体质',herbs:['银耳','莲子','冰糖']}
    ],
    tanshi: [
      {name:'薏苡仁冬瓜汤',type:'汤品',desc:'利水渗湿，清热化痰，适合痰湿肥胖',herbs:['薏苡仁','冬瓜','排骨']},
      {name:'荷叶茶',type:'茶饮',desc:'清热利湿，消水肿，帮助减肥',herbs:['荷叶','山楂','陈皮']},
      {name:'茯苓粥',type:'粥类',desc:'利水渗湿，健脾和胃，消除体内湿气',herbs:['茯苓','大米','山药']}
    ],
    shire: [
      {name:'绿豆粥',type:'粥类',desc:'清热解毒，消暑利水，适合湿热体质',herbs:['绿豆','大米','荷叶']},
      {name:'苦瓜炒蛋',type:'菜品',desc:'清热解毒，明目解毒，降火祛湿',herbs:['苦瓜','鸡蛋']},
      {name:'茵陈茶',type:'茶饮',desc:'清热利湿，利胆退黄，适合湿热黄疸',herbs:['茵陈','栀子','大黄']}
    ],
    xueyu: [
      {name:'山楂粥',type:'粥类',desc:'活血化瘀，消食化积，适合血瘀体质',herbs:['山楂','大米','红糖']},
      {name:'丹参酒',type:'饮品',desc:'活血化瘀，通经止痛，改善血液循环',herbs:['丹参','白酒']},
      {name:'玫瑰花茶',type:'茶饮',desc:'疏肝理气，活血化瘀，美容养颜',herbs:['玫瑰花','枸杞','大枣']}
    ],
    qiyu: [
      {name:'陈皮粥',type:'粥类',desc:'理气健脾，燥湿化痰，适合气郁体质',herbs:['陈皮','大米','生姜']},
      {name:'佛手茶',type:'茶饮',desc:'疏肝理气，和胃止痛，缓解情绪抑郁',herbs:['佛手','玫瑰花','香附']},
      {name:'香附炖鸡',type:'汤品',desc:'疏肝解郁，理气止痛，调节情志',herbs:['香附','鸡肉','生姜']}
    ],
    tebing: [
      {name:'黄芪粥',type:'粥类',desc:'补气固表，增强体质，预防过敏',herbs:['黄芪','大米','大枣']},
      {name:'灵芝茶',type:'茶饮',desc:'补气安神，增强免疫力，抗过敏',herbs:['灵芝','蜂蜜']},
      {name:'防风粥',type:'粥类',desc:'祛风解表，胜湿止痛，预防过敏反应',herbs:['防风','大米','生姜']}
    ]
  };

  var scoreList = Object.keys(data.convertedScores).map(function(k){return {type:k,name:types[k].name,score:data.convertedScores[k],color:types[k].color};}).sort(function(a,b){return b.score-a.score;});
  var scoreHtml = scoreList.map(function(s){return '<div style="margin-bottom:10px;"><div style="display:flex;justify-content:space-between;margin-bottom:4px;"><span style="font-size:13px;color:#064E3B;">'+s.name+'</span><span style="font-size:13px;color:'+s.color+';">'+s.score+'%</span></div><div style="height:8px;background:#ECFDF5;border-radius:4px;overflow:hidden;"><div style="height:100%;width:'+s.score+'%;background:'+s.color+';border-radius:4px;"></div></div></div>';}).join('');

  var mixedHtml = data.mixedTypes && data.mixedTypes.length>0 ? '<div style="margin-top:16px;"><div style="font-size:14px;font-weight:600;margin-bottom:8px;color:#064E3B;">兼夹体质</div><div style="display:flex;flex-wrap:wrap;gap:8px;">'+data.mixedTypes.map(function(t){return '<span style="font-size:12px;color:#374151;background:#F8FAFC;padding:4px 12px;border-radius:20px;">'+t.name+' '+t.score+'%</span>';}).join('')+'</div></div>' : '';

  var matches = matchMap[data.mainType] || [];
  var matchHtml = matches.map(function(m){
    var herbTags = m.herbs.map(function(h){return '<span style="font-size:11px;color:#10B981;background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);padding:3px 10px;border-radius:12px;cursor:pointer;" onclick="goToHerbDetail(\''+h+'\')">'+h+'</span>';}).join('');
    return '<div style="background:#F8FAFC;border-left:3px solid #059669;border-radius:0 8px 8px 0;padding:14px;margin-bottom:12px;text-align:left;"><div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;"><span style="font-size:14px;font-weight:600;color:#064E3B;">'+m.name+'</span><span style="font-size:11px;color:#F59E0B;background:rgba(245,158,11,0.1);padding:2px 10px;border-radius:20px;">'+m.type+'</span></div><div style="font-size:12px;color:#374151;margin-bottom:10px;">'+m.desc+'</div><div style="font-size:11px;color:#6B7280;margin-bottom:6px;">涉及药材：</div><div style="display:flex;flex-wrap:wrap;gap:6px;">'+herbTags+'</div></div>';
  }).join('');

  document.getElementById('constitution-question').innerHTML = '<div style="text-align:center;padding-bottom:20px;"><div style="width:100px;height:100px;border-radius:50%;background:'+types[data.mainType].color+';display:flex;align-items:center;justify-content:center;font-size:48px;margin:0 auto 20px;">🧬</div><div style="font-size:24px;font-weight:700;color:'+types[data.mainType].color+';margin-bottom:8px;">'+data.mainTypeName+'</div><div style="font-size:14px;color:#374151;margin-bottom:20px;">'+types[data.mainType].desc+'</div><div style="background:#F8FAFC;padding:16px;border-radius:12px;margin-bottom:16px;text-align:left;"><div style="font-size:14px;font-weight:600;margin-bottom:12px;color:#064E3B;">各体质得分</div>'+scoreHtml+'</div>'+mixedHtml+'<div style="background:#fff;border:1px solid #D1FAE5;border-radius:12px;padding:16px;margin-top:16px;text-align:left;"><div style="font-size:14px;font-weight:600;margin-bottom:12px;color:#064E3B;">🍲 药食同源搭配建议</div>'+matchHtml+'</div><div style="font-size:12px;color:#6B7280;margin-top:16px;">测评时间：'+data.date+'</div></div>';

  document.getElementById('constitution-progress-bar').style.width='100%';
  document.getElementById('constitution-progress-text').textContent='测评完成';
  document.getElementById('constitution-prev').style.display='none';
  document.getElementById('constitution-next').style.display='none';
  document.getElementById('constitution-submit').style.display='none';
}

function loadConstitutionRecords() {
  api('/constitution/records').then(function(res) {
    var listEl = document.getElementById('constitution-records-list');
    if (!listEl) return;
    var records = (res && res.list) ? res.list : [];
    if (records.length===0) { listEl.innerHTML='<div class="card" style="text-align:center;color:#6B7280;padding:20px;margin:0 16px 12px;"><div style="font-size:32px;margin-bottom:8px;">🧬</div><div>暂无测评记录</div><div style="font-size:12px;margin-top:4px;">去首页进行体质测评</div></div>'; return; }
    
    var types = {pinghe:{name:'平和质',color:'#10b981'},qixu:{name:'气虚质',color:'#f59e0b'},yangxu:{name:'阳虚质',color:'#3b82f6'},yinxu:{name:'阴虚质',color:'#ef4444'},tanshi:{name:'痰湿质',color:'#84cc16'},shire:{name:'湿热质',color:'#a855f7'},xueyu:{name:'血瘀质',color:'#7c3aed'},qiyu:{name:'气郁质',color:'#06b6d4'},tebing:{name:'特禀质',color:'#ec4899'}};
    var showAll = records.length>3;
    
    listEl.innerHTML = (showAll?'<div style="margin:0 16px 8px;font-size:13px;color:#6B7280;">'+records.length+'次测评（滑动查看更多）</div>':'') + '<div style="'+(showAll?'max-height:420px;overflow-y:auto;-webkit-overflow-scrolling:touch;':'')+'">'+records.map(function(r){
      var mixedHtml = r.mixedTypes&&r.mixedTypes.length>0?'<div style="display:flex;flex-wrap:wrap;gap:4px;max-width:80px;">'+r.mixedTypes.slice(0,2).map(function(t){return '<span style="font-size:10px;color:#374151;background:#F8FAFC;padding:2px 6px;border-radius:8px;">'+t.name+'</span>';}).join('')+'</div>':'';
      return '<div class="card" style="padding:14px;display:flex;align-items:center;margin:'+(showAll?'0 4px':'0 16px')+' 12px;cursor:pointer;" onclick="viewConstitutionDetail('+JSON.stringify(r).replace(/"/g,'&quot;')+')"><div style="width:50px;height:50px;border-radius:50%;background:'+types[r.mainType].color+';display:flex;align-items:center;justify-content:center;font-size:24px;margin-right:14px;">🧬</div><div style="flex:1;min-width:0;"><div style="font-size:15px;font-weight:600;color:'+types[r.mainType].color+';">'+r.mainTypeName+'</div><div style="font-size:12px;color:#374151;">'+(r.mode==='quick'?'快速测评':'标准测评')+' · 得分 '+r.mainScore+'%</div><div style="font-size:11px;color:#6B7280;margin-top:4px;">'+r.date+'</div></div>'+mixedHtml+'<button style="font-size:12px;color:#EF4444;background:rgba(239,68,68,0.08);padding:6px 12px;border-radius:12px;border:1px solid rgba(239,68,68,0.2);margin-left:8px;flex-shrink:0;" onclick="event.stopPropagation();deleteConstitutionRecord('+r.id+')">删除</button></div>';
    }).join('')+'</div>';
  });
}

function viewConstitutionDetail(record) {
  _constitutionResult = record;
  renderConstitutionResult(record);
  document.getElementById('constitution-modal').style.display='flex';
}

function goToHerbDetail(herbName) {
  closeConstitutionTest();
  showPage('page-herb-list', false);
  loadHerbList();
  setTimeout(function() {
    var herb = herbsData.find(function(h) {
      return h.name === herbName || (h.alias && h.alias.indexOf(herbName) >= 0);
    });
    if (herb) {
      if (typeof showHerbDetail === 'function') {
        showHerbDetail(herb.id);
      }
    } else {
      fetch(API_BASE + '/herb/detail/' + encodeURIComponent(herbName))
        .then(function(r) { return r.json(); })
        .then(function(res) {
          if (res.code === 0 && res.data && res.data.id) {
            if (typeof showHerbDetail === 'function') {
              showHerbDetail(res.data.id);
            }
          } else {
            showToast('暂无药材详情：' + herbName);
          }
        })
        .catch(function() {
          showToast('暂无药材详情：' + herbName);
        });
    }
  }, 500);
}

function deleteConstitutionRecord(id) {
  if (!confirm('确定要删除这条测评记录吗？')) return;
  apiDelete('/constitution/record/'+id).then(function(res) {
    if (res && res.code === 0) {
      showToast('删除成功');
      loadConstitutionRecords();
    } else {
      showToast('删除失败');
    }
  }).catch(function() {
    showToast('删除失败');
  });
}
