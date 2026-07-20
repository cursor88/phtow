const fs = require('fs');
const path = require('path');
const paths = require('../config/paths');

class NihaixiaService {
  constructor() {
    this.skillContent = '';
    this.index = [];
    this.moduleContent = {};
    this.loadSkill();
    this.loadModules();
    this.buildIndex();
  }

  loadSkill() {
    try {
      this.skillContent = fs.readFileSync(paths.SKILL_MD, 'utf-8');
      console.log(`[倪海厦Skill] 已加载SKILL.md，约 ${(this.skillContent.length / 1024).toFixed(1)} KB`);
    } catch (e) {
      console.error('[倪海厦Skill] SKILL.md加载失败:', e.message);
    }
  }

  loadModules() {
    try {
      const files = fs.readdirSync(paths.MODULES_DIR);
      files.forEach(file => {
        if (file.endsWith('.md')) {
          const filePath = path.join(paths.MODULES_DIR, file);
          const content = fs.readFileSync(filePath, 'utf-8');
          this.moduleContent[file] = content;
          console.log(`[倪海厦Skill] 已加载 ${file}，约 ${(content.length / 1024).toFixed(1)} KB`);
        }
      });
    } catch (e) {
      console.error('[倪海厦Skill] modules目录加载失败:', e.message);
    }
  }

  buildIndex() {
    this.index = [];
    
    const allContent = {
      'SKILL.md': this.skillContent,
      ...this.moduleContent
    };
    
    Object.keys(allContent).forEach(fileName => {
      const content = allContent[fileName];
      if (!content) return;
      
      const lines = content.split('\n');
      let currentSection = '';
      let currentContent = [];
      
      lines.forEach(line => {
        if (line.startsWith('# ')) {
          if (currentSection && currentContent.length > 0) {
            this.index.push({
              title: currentSection,
              content: currentContent.join('\n'),
              fileName: fileName,
              keywords: this.extractKeywords(currentSection + ' ' + currentContent.join('\n'))
            });
          }
          currentSection = line.replace(/^#+\s*/, '').trim();
          currentContent = [];
        } else if (line.startsWith('## ') || line.startsWith('### ')) {
          if (currentSection && currentContent.length > 0) {
            this.index.push({
              title: currentSection,
              content: currentContent.join('\n'),
              fileName: fileName,
              keywords: this.extractKeywords(currentSection + ' ' + currentContent.join('\n'))
            });
          }
          currentSection = line.replace(/^#+\s*/, '').trim();
          currentContent = [];
        } else if (line.startsWith('### Q: ')) {
          if (currentSection && currentContent.length > 0) {
            this.index.push({
              title: currentSection,
              content: currentContent.join('\n'),
              fileName: fileName,
              keywords: this.extractKeywords(currentSection + ' ' + currentContent.join('\n'))
            });
          }
          currentSection = line.replace(/^### Q:\s*/, '').trim();
          currentContent = [];
        } else {
          currentContent.push(line);
        }
      });
      
      if (currentSection && currentContent.length > 0) {
        this.index.push({
          title: currentSection,
          content: currentContent.join('\n'),
          fileName: fileName,
          keywords: this.extractKeywords(currentSection + ' ' + currentContent.join('\n'))
        });
      }
    });
    
    console.log(`[倪海厦Skill] 已构建索引 ${this.index.length} 条`);
  }

  extractKeywords(text) {
    const keywords = [];
    const patterns = [
      /麻黄|附子|细辛|桂枝|干姜|甘草|人参|白术|茯苓|当归|芍药|柴胡|黄芩|半夏|生姜|大枣|石膏|知母|黄连|黄柏|大黄/g,
      /太阳病|阳明病|少阳病|太阴病|少阴病|厥阴病/g,
      /伤寒论|金匮要略|黄帝内经/g,
      /咳嗽|发热|头痛|腹痛|腹泻|呕吐|便秘|水肿|黄疸|胸闷|气短|盗汗|失眠|眩晕|心悸|腰痛|关节痛/g,
      /气虚|阳虚|阴虚|痰湿|湿热|血瘀|气郁|特禀/g,
      /下利|腹满|自利|咽痛|口渴|烦躁|谵语|发狂|痉病|湿病|暍病/g,
      /肚子|阵痛|胃痛|胃胀|嗳气|反酸|烧心|吐血|咯血|血痰|衄血|便血|尿血/g,
      /肺痿|肺痈|胸痹|奔豚|消渴|淋病|疮痈|肠痈|痰饮/g
    ];
    
    patterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        matches.forEach(m => {
          if (!keywords.includes(m)) keywords.push(m);
        });
      }
    });
    
    return keywords;
  }

  cleanContent(content) {
    if (!content) return '';
    return content
      .replace(/\r/g, '')
      .replace(/\|/g, '')
      .replace(/>/g, '')
      .replace(/^\s*-\s*/gm, '')
      .replace(/^\s*\*\s*/gm, '')
      .replace(/\*\*/g, '')
      .replace(/`/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/^条文\d+[:：]\s*/gm, '')
      .replace(/^条文\d+续[:：]\s*/gm, '')
      .replace(/^\s*\*\s*倪海厦解读[:：]\s*/gm, '')
      .replace(/^\s*\*\s*[【\[]\w+[】\]]\s*曰[:：]\s*/gm, '')
      .replace(/^\s*\*\s*/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  }

  search(query, topK = 5) {
    if (!query || !this.skillContent) return [];
    
    const queryLower = query.toLowerCase();
    const results = [];
    
    const expandedTerms = new Set();
    const symptomKeywords = ['肚子', '腹痛', '阵痛', '胃痛', '呕吐', '腹泻', '下利', '腹满', '咳嗽', '咯血', '血痰', '胸闷', '气短', '盗汗', '失眠', '眩晕', '心悸', '腰痛', '关节痛', '水肿', '黄疸', '便秘', '头痛', '发热'];
    
    symptomKeywords.forEach(kw => {
      if (query.includes(kw)) {
        expandedTerms.add(kw);
      }
    });
    
    const symptomSynonyms = {
      '肚子': ['腹', '腹部', '腹痛', '腹满', '腹中', '太阴'],
      '阵痛': ['腹痛', '绞痛', '时痛', '大实痛'],
      '腹痛': ['腹满', '下利', '太阴', '腹中痛', '妇人腹中痛'],
      '咳嗽': ['咳', '嗽', '肺痿', '肺痈', '上气'],
      '咯血': ['吐血', '血痰', '咳血', '衄血', '吐衄'],
      '血痰': ['咯血', '吐血'],
      '腹满': ['腹痛', '下利', '太阴', '腹胀'],
      '下利': ['腹泻', '腹痛', '自利'],
      '胃痛': ['胃脘痛', '心下痛', '中焦痛', '胃脘'],
      '失眠': ['不得眠', '不得卧', '不寐', '卧不安'],
      '头痛': ['头项强痛', '头疼', '头眩', '头重'],
      '腰痛': ['腰背痛', '腰酸', '腰膝酸软'],
      '关节痛': ['历节', '痹症', '风湿', '关节肿痛'],
      '水肿': ['水气', '水饮', '浮肿', '肿胀'],
      '黄疸': ['黄瘅', '发黄', '身黄'],
      '便秘': ['大便难', '大便不通', '燥屎', '便难'],
      '发热': ['发烧', '身热', '但热', '潮热'],
      '心悸': ['心动悸', '心下悸', '怔忡', '心慌'],
      '眩晕': ['头眩', '目眩', '头晕'],
      '胸闷': ['胸满', '胸中窒', '胸痹'],
      '气短': ['短气', '少气', '气不足'],
      '盗汗': ['寝汗', '汗出', '自汗'],
      '月经不调': ['月经', '经期', '经血', '经闭', '经方', '经水', '妇人'],
      '月经推迟': ['经闭', '闭经', '经期错后', '月事不来'],
      '月经量少': ['经血少', '经量少', '经水少'],
      '痛经': ['经痛', '经期腹痛', '经期疼痛'],
      '不孕': ['妇人', '求子', '怀孕', '妊娠', '妇人杂病'],
      '糖尿病': ['消渴', '三消'],
      '高血压': ['肝阳上亢', '眩晕', '中风'],
      '心脏病': ['胸痹', '心痛', '心悸', '怔忡'],
      '中风': ['脑卒中', '偏瘫'],
      '湿疹': ['浸淫疮', '湿疮', '皮肤'],
      '荨麻疹': ['瘾疹', '风疹', '皮肤瘙痒'],
      '鼻炎': ['鼻渊', '鼻塞', '鼻鼽'],
      '哮喘': ['喘', '哮', '上气', '短气'],
      '肺炎': ['肺热', '肺痈', '喘咳'],
      '胃炎': ['胃脘痛', '心下痛', '胃病'],
      '肝炎': ['黄疸', '胁痛', '肝胆湿热'],
      '阳痿': ['阳萎', '肾阳虚', '命门火衰'],
      '前列腺炎': ['淋', '小便不利', '癃闭']
    };
    
    Object.keys(symptomSynonyms).forEach(key => {
      if (query.includes(key)) {
        symptomSynonyms[key].forEach(syn => expandedTerms.add(syn));
      }
    });
    
    const diagnosisKeywords = {
      '肚子': ['太阴', '腹满', '下利', '理中', '大建中'],
      '阵痛': ['太阴', '腹满', '桂枝加芍药', '大建中', '腹满寒疝'],
      '腹痛': ['太阴', '腹满', '芍药', '理中', '大建中', '腹满寒疝', '妇人腹中痛'],
      '咳嗽': ['肺痿', '肺痈', '桔梗', '麦门冬', '咳嗽上气'],
      '咯血': ['肺痿', '肺痈', '吐衄', '泻心', '惊悸吐衄'],
      '血': ['吐衄', '下血', '泻心', '黄连阿胶', '咳血'],
      '腹满': ['太阴', '腹满寒疝', '厚朴', '大建中'],
      '月经不调': ['妇人', '经方', '妊娠', '金匮'],
      '月经推迟': ['妇人', '经闭', '闭经', '金匮'],
      '不孕': ['妇人', '求子', '金匮'],
      '痛经': ['妇人', '腹痛', '当归芍药'],
      '糖尿病': ['消渴', '金匮'],
      '高血压': ['中风', '肝阳', '眩晕'],
      '心脏病': ['胸痹', '心痛', '怔忡'],
      '中风': ['中风', '历节', '金匮'],
      '湿疹': ['浸淫疮', '金匮', '黄连粉'],
      '荨麻疹': ['瘾疹', '金匮', '风湿'],
      '鼻炎': ['鼻渊', '鼻塞', '金匮'],
      '哮喘': ['上气', '短气', '肺胀', '金匮'],
      '肺炎': ['肺热', '肺痈', '喘咳', '金匮'],
      '胃炎': ['胃脘痛', '心下痛'],
      '肝炎': ['黄疸', '胁痛', '金匮'],
      '阳痿': ['肾阳虚', '命门火衰'],
      '前列腺炎': ['淋', '小便不利', '癃闭']
    };
    
    this.index.forEach(item => {
      let score = 0;
      const titleLower = item.title.toLowerCase();
      const contentLower = item.content.toLowerCase();
      
      if (titleLower.includes(queryLower)) score += 10;
      if (contentLower.includes(queryLower)) score += 6;
      
      item.keywords.forEach(kw => {
        if (query.includes(kw)) score += 3;
      });
      
      expandedTerms.forEach(term => {
        if (item.title.includes(term)) score += 3;
        if (item.content.includes(term)) score += 2;
      });
      
      Object.keys(diagnosisKeywords).forEach(key => {
        if (query.includes(key)) {
          diagnosisKeywords[key].forEach(dkw => {
            if (item.title.includes(dkw) || item.content.includes(dkw)) score += 5;
          });
        }
      });
      
      if (query.includes('血')) {
        const bloodTerms = ['血', '咯血', '吐血', '衄血', '下血', '血痰', '咳血', '吐衄'];
        bloodTerms.forEach(bt => {
          if (item.title.includes(bt) || item.content.includes(bt)) score += 2;
        });
      }
      
      if (query.includes('肚子') || query.includes('阵痛') || query.includes('腹痛')) {
        const abdominalTerms = ['腹满寒疝', '大建中', '理中', '桂枝加芍药', '太阴病', '小建中'];
        abdominalTerms.forEach(at => {
          if (item.title.includes(at) || item.content.includes(at)) score += 5;
        });
      }
      
      if (score > 0) {
        results.push({
          title: item.title,
          content: this.cleanContent(item.content),
          score: score,
          fileName: item.fileName,
          keywords: item.keywords.filter(kw => query.includes(kw))
        });
      }
    });
    
    const uniqueResults = [];
    const seenTitles = new Set();
    results.forEach(r => {
      if (!seenTitles.has(r.title)) {
        seenTitles.add(r.title);
        uniqueResults.push(r);
      }
    });
    
    return uniqueResults.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  async consult(symptoms, context = {}, mode = 'diagnosis') {
    const localResults = this.search(symptoms, 5);
    
    if (localResults.length === 0) {
      return {
        diagnosis: '未找到相关辨证信息',
        analysis: '在知识库中未检索到与您描述症状相关的内容，建议详细描述症状或咨询专业中医师',
        prescription: null,
        tips: ['建议详细描述症状', '注意饮食调理', '及时就医'],
        reference: '',
        source: 'local'
      };
    }
    
    const contextStr = Object.keys(context)
      .filter(k => context[k])
      .map(k => `${k}: ${context[k]}`)
      .join('；');
    
    const knowledge = localResults.map((r, i) => `${i + 1}. ${r.title}\n${r.content.substring(0, 300)}`).join('\n\n');
    
    const result = {
      diagnosis: this.extractDiagnosis(symptoms, localResults),
      analysis: `根据经方思维，结合您的症状描述，初步判断为${this.extractDiagnosis(symptoms, localResults)}。相关知识点已检索到${localResults.length}条参考内容。`,
      prescription: this.extractPrescription(localResults, symptoms),
      tips: this.extractTips(localResults),
      reference: localResults.map(r => r.title).join('；'),
      source: 'local',
      matches: localResults.map(r => ({
        title: r.title,
        content: this.cleanContent(r.content),
        score: r.score
      }))
    };
    
    return result;
  }

  extractDiagnosis(symptoms, results) {
    if (symptoms.includes('肚子') || symptoms.includes('腹痛') || symptoms.includes('阵痛')) {
      if (symptoms.includes('冷') || symptoms.includes('喜温')) {
        return '太阴病（寒证）';
      } else if (symptoms.includes('热') || symptoms.includes('大便干')) {
        return '阳明病（热证）';
      } else {
        return '太阴病（腹痛下利）';
      }
    }
    
    if (symptoms.includes('咳嗽') && symptoms.includes('血')) {
      return '肺痿/肺痈（咯血）';
    }
    
    const diagnosisMap = {
      '太阴': '太阴病', '腹满': '太阴病', '下利': '太阴病',
      '肺痿': '肺痿/肺痈', '肺痈': '肺痿/肺痈', '咯血': '肺痿/肺痈',
      '太阳': '太阳病', '阳明': '阳明病', '少阳': '少阳病',
      '少阴': '少阴病', '厥阴': '厥阴病',
      '咳嗽': '肺病', '发热': '表证', '头痛': '少阳证',
      '腹痛': '太阴证', '腹泻': '太阴病', '呕吐': '少阳证',
      '便秘': '阳明病', '水肿': '少阴病', '黄疸': '阳明病',
      '胸闷': '胸痹', '气短': '气虚', '盗汗': '阴虚', '失眠': '少阴/厥阴'
    };
    
    for (const r of results) {
      for (const kw of Object.keys(diagnosisMap)) {
        if (r.title.includes(kw) || r.content.includes(kw)) {
          return diagnosisMap[kw];
        }
      }
    }
    
    return '六经辨证待查';
  }

  extractPrescription(results, symptoms = '') {
    const prescriptionMap = {
      '麻黄汤': { ingredients: ['麻黄', '桂枝', '杏仁', '甘草'], indication: '太阳伤寒，无汗而喘' },
      '桂枝汤': { ingredients: ['桂枝', '芍药', '生姜', '大枣', '甘草'], indication: '太阳中风，汗出恶风' },
      '麻黄附子细辛汤': { ingredients: ['麻黄', '附子', '细辛'], indication: '少阴病，脉沉，反发热' },
      '小柴胡汤': { ingredients: ['柴胡', '黄芩', '人参', '半夏', '生姜', '大枣', '甘草'], indication: '少阳证，往来寒热' },
      '理中汤': { ingredients: ['人参', '白术', '干姜', '甘草'], indication: '太阴病，自利不渴' },
      '四逆汤': { ingredients: ['附子', '干姜', '甘草'], indication: '少阴病，四肢厥逆' },
      '桂枝加芍药汤': { ingredients: ['桂枝', '芍药', '生姜', '大枣', '甘草'], indication: '太阳病误下，腹满时痛' },
      '大建中汤': { ingredients: ['蜀椒', '干姜', '人参'], indication: '心胸中大寒痛，呕不能食' },
      '厚朴生姜半夏甘草人参汤': { ingredients: ['厚朴', '生姜', '半夏', '甘草', '人参'], indication: '发汗后，腹胀满' },
      '黄连阿胶汤': { ingredients: ['黄连', '黄芩', '芍药', '鸡子黄', '阿胶'], indication: '少阴病，心烦不得卧' },
      '桔梗汤': { ingredients: ['桔梗', '甘草'], indication: '肺痈，吐脓' },
      '泻心汤': { ingredients: ['大黄', '黄连', '黄芩'], indication: '心气不足，吐血衄血' },
      '麦门冬汤': { ingredients: ['麦门冬', '人参', '半夏', '甘草', '粳米', '大枣'], indication: '肺痿，大逆上气' }
    };
    
    if (symptoms.includes('肚子') || symptoms.includes('腹痛') || symptoms.includes('阵痛')) {
      for (const r of results) {
        if (r.title.includes('大建中') || r.content.includes('大建中')) {
          return {
            name: '大建中汤',
            ingredients: prescriptionMap['大建中汤'].ingredients,
            dosage: '请遵医嘱',
            explanation: '心胸中大寒痛，呕不能食'
          };
        }
        if (r.title.includes('理中') || r.content.includes('理中')) {
          return {
            name: '理中汤',
            ingredients: prescriptionMap['理中汤'].ingredients,
            dosage: '请遵医嘱',
            explanation: '太阴病，腹满吐利'
          };
        }
      }
      if (symptoms.includes('冷') || symptoms.includes('喜温')) {
        return {
          name: '大建中汤',
          ingredients: prescriptionMap['大建中汤'].ingredients,
          dosage: '请遵医嘱',
          explanation: '心胸中大寒痛，呕不能食'
        };
      }
      return {
        name: '理中汤',
        ingredients: prescriptionMap['理中汤'].ingredients,
        dosage: '请遵医嘱',
        explanation: '太阴病，腹满吐利'
      };
    }
    
    if (symptoms.includes('咳嗽') && symptoms.includes('血')) {
      for (const r of results) {
        if (r.title.includes('桔梗') || r.content.includes('桔梗')) {
          return {
            name: '桔梗汤',
            ingredients: prescriptionMap['桔梗汤'].ingredients,
            dosage: '请遵医嘱',
            explanation: '肺痈，咳而胸满，振寒脉数'
          };
        }
        if (r.title.includes('麦门冬') || r.content.includes('麦门冬')) {
          return {
            name: '麦门冬汤',
            ingredients: prescriptionMap['麦门冬汤'].ingredients,
            dosage: '请遵医嘱',
            explanation: '肺痿，大逆上气'
          };
        }
      }
      return {
        name: '桔梗汤',
        ingredients: prescriptionMap['桔梗汤'].ingredients,
        dosage: '请遵医嘱',
        explanation: '肺痈，咳而胸满，振寒脉数'
      };
    }
    
    for (const r of results) {
      for (const name of Object.keys(prescriptionMap)) {
        if (r.title.includes(name) || r.content.includes(name)) {
          return {
            name: name,
            ingredients: prescriptionMap[name].ingredients,
            dosage: '请遵医嘱',
            explanation: prescriptionMap[name].indication
          };
        }
      }
    }
    
    return null;
  }

  extractTips(results) {
    const tips = [];
    const tipMap = {
      '麻黄': ['忌生冷油腻', '服药后盖被取汗'],
      '附子': ['必须久煎', '忌与半夏同用'],
      '桂枝': ['忌生冷', '孕妇慎用'],
      '干姜': ['阴虚火旺者忌用'],
      '人参': ['实证热证忌用', '不宜与藜芦同用'],
      '白术': ['阴虚内热者慎用'],
      '黄连': ['脾胃虚寒者慎用'],
      '黄芩': ['脾胃虚寒者慎用']
    };
    
    results.forEach(r => {
      Object.keys(tipMap).forEach(herb => {
        if ((r.title.includes(herb) || r.content.includes(herb)) && !tips.includes(tipMap[herb][0])) {
          tips.push(...tipMap[herb]);
        }
      });
    });
    
    if (tips.length === 0) {
      tips.push('注意保暖，避免风寒');
      tips.push('饮食清淡，忌生冷油腻');
      tips.push('适度运动，增强体质');
    }
    
    return tips.slice(0, 3);
  }

  getConstitutionAdvice(constitution) {
    const adviceMap = {
      qixu: {
        yangqiAnalysis: '气虚质本质是阳气不足，脾胃气虚，卫气不固。倪师认为气虚者当以黄芪、人参、白术等补气药为主，辅以桂枝汤调和营卫。',
        prescriptions: [
          { name: '补中益气汤', ingredients: ['黄芪', '人参', '白术', '炙甘草', '当归', '陈皮', '升麻', '柴胡'], indication: '脾虚气陷，气虚发热' },
          { name: '玉屏风散', ingredients: ['黄芪', '白术', '防风'], indication: '表虚自汗，易感风邪' }
        ],
        diet: ['黄芪炖鸡', '人参粥', '山药莲子粥'],
        acupoints: ['足三里', '气海', '关元'],
        lifestyle: ['适度运动如散步', '早睡早起', '避免过度劳累']
      },
      yangxu: {
        yangqiAnalysis: '阳虚质是阳气极度虚弱，命门火衰。倪师强调扶阳的重要性，善用附子、干姜、桂枝等温阳药。',
        prescriptions: [
          { name: '四逆汤', ingredients: ['附子', '干姜', '炙甘草'], indication: '少阴病，四肢厥逆' },
          { name: '真武汤', ingredients: ['附子', '白术', '茯苓', '芍药', '生姜'], indication: '阳虚水泛，腹痛下利' }
        ],
        diet: ['附子羊肉汤', '干姜红枣茶', '桂圆枸杞粥'],
        acupoints: ['关元', '命门', '肾俞'],
        lifestyle: ['注意保暖', '避免生冷饮食', '温水泡脚']
      },
      yinxu: {
        yangqiAnalysis: '阴虚质是阴液不足，虚火内生。倪师认为阴虚者当滋阴降火，但反对滥用寒凉药。',
        prescriptions: [
          { name: '六味地黄丸', ingredients: ['熟地', '山茱萸', '山药', '泽泻', '茯苓', '丹皮'], indication: '肾阴不足，腰膝酸软' },
          { name: '知柏地黄丸', ingredients: ['熟地', '山茱萸', '山药', '泽泻', '茯苓', '丹皮', '知母', '黄柏'], indication: '阴虚火旺，潮热盗汗' }
        ],
        diet: ['百合莲子粥', '银耳百合汤', '枸杞菊花茶'],
        acupoints: ['三阴交', '太溪', '涌泉'],
        lifestyle: ['避免熬夜', '忌食辛辣', '保持心情舒畅']
      },
      tanshi: {
        yangqiAnalysis: '痰湿质是体内水湿运化失常，聚而成痰。倪师常用麻黄、桂枝、白术等药化痰祛湿。',
        prescriptions: [
          { name: '苓桂术甘汤', ingredients: ['茯苓', '桂枝', '白术', '甘草'], indication: '痰饮内停，胸胁支满' },
          { name: '半夏白术天麻汤', ingredients: ['半夏', '白术', '天麻', '茯苓', '橘红', '甘草'], indication: '风痰上扰，眩晕头痛' }
        ],
        diet: ['薏米红豆粥', '冬瓜海带汤', '陈皮茶'],
        acupoints: ['丰隆', '足三里', '阴陵泉'],
        lifestyle: ['清淡饮食', '加强运动', '避免潮湿环境']
      },
      shire: {
        yangqiAnalysis: '湿热质是体内湿热交蒸，倪师善用黄连、黄芩、黄柏等清热燥湿药。',
        prescriptions: [
          { name: '黄连解毒汤', ingredients: ['黄连', '黄芩', '黄柏', '栀子'], indication: '三焦火毒，高热烦躁' },
          { name: '龙胆泻肝汤', ingredients: ['龙胆草', '黄芩', '栀子', '泽泻', '木通', '车前子', '当归', '生地', '柴胡', '甘草'], indication: '肝胆湿热，胁痛口苦' }
        ],
        diet: ['绿豆汤', '冬瓜汤', '苦瓜炒蛋'],
        acupoints: ['阴陵泉', '足三里', '曲池'],
        lifestyle: ['忌食辛辣油腻', '保持大便通畅', '避免闷热环境']
      },
      xueyu: {
        yangqiAnalysis: '血瘀质是血液运行不畅，瘀血内阻。倪师常用桃仁、红花、川芎等活血化瘀药。',
        prescriptions: [
          { name: '血府逐瘀汤', ingredients: ['桃仁', '红花', '当归', '生地', '川芎', '赤芍', '牛膝', '桔梗', '柴胡', '枳壳', '甘草'], indication: '胸中血瘀，头痛胸痛' },
          { name: '桃红四物汤', ingredients: ['桃仁', '红花', '当归', '熟地', '川芎', '赤芍'], indication: '血虚血瘀，月经不调' }
        ],
        diet: ['山楂红糖水', '当归生姜羊肉汤', '黑木耳'],
        acupoints: ['血海', '膈俞', '太冲'],
        lifestyle: ['适当运动', '保持心情舒畅', '避免久坐']
      },
      qiyu: {
        yangqiAnalysis: '气郁质是气机郁滞，情志不畅。倪师常用柴胡疏肝散等疏肝理气。',
        prescriptions: [
          { name: '柴胡疏肝散', ingredients: ['柴胡', '陈皮', '川芎', '香附', '枳壳', '芍药', '甘草'], indication: '肝气郁结，胁肋胀痛' },
          { name: '逍遥散', ingredients: ['柴胡', '当归', '白芍', '白术', '茯苓', '甘草', '薄荷'], indication: '肝郁脾虚，月经不调' }
        ],
        diet: ['玫瑰花茶', '佛手茶', '陈皮粥'],
        acupoints: ['太冲', '行间', '期门'],
        lifestyle: ['保持心情舒畅', '适当运动', '多与人交流']
      },
      tebing: {
        yangqiAnalysis: '特禀质是先天禀赋异常，容易过敏。倪师认为当调理体质，增强正气。',
        prescriptions: [
          { name: '玉屏风散', ingredients: ['黄芪', '白术', '防风'], indication: '表虚自汗，易感风邪' },
          { name: '消风散', ingredients: ['荆芥', '防风', '蝉蜕', '牛蒡子', '苦参', '苍术', '石膏', '知母', '当归', '生地', '胡麻仁', '甘草'], indication: '风疹湿疹，皮肤瘙痒' }
        ],
        diet: ['清淡饮食', '避免过敏原', '山药莲子粥'],
        acupoints: ['足三里', '气海', '肺俞'],
        lifestyle: ['避免接触过敏原', '适度运动', '增强体质']
      },
      pinghe: {
        yangqiAnalysis: '平和质是健康体质，气血调和。倪师强调治未病，保持良好生活习惯。',
        prescriptions: [],
        diet: ['均衡饮食', '五谷杂粮', '新鲜蔬果'],
        acupoints: ['足三里', '关元'],
        lifestyle: ['规律作息', '适度运动', '心情舒畅']
      }
    };
    
    return adviceMap[constitution] || adviceMap.pinghe;
  }

  getHerbPrescriptions(herbName) {
    const prescriptions = {
      '麻黄': [
        { name: '麻黄汤', ingredients: ['麻黄', '桂枝', '杏仁', '甘草'], indication: '太阳伤寒，无汗而喘' },
        { name: '麻黄附子细辛汤', ingredients: ['麻黄', '附子', '细辛'], indication: '少阴病，脉沉发热' },
        { name: '大青龙汤', ingredients: ['麻黄', '桂枝', '杏仁', '甘草', '石膏', '生姜', '大枣'], indication: '太阳中风，脉浮紧' }
      ],
      '桂枝': [
        { name: '桂枝汤', ingredients: ['桂枝', '芍药', '生姜', '大枣', '甘草'], indication: '太阳中风，汗出恶风' },
        { name: '桂枝加葛根汤', ingredients: ['桂枝', '芍药', '生姜', '大枣', '甘草', '葛根'], indication: '太阳病，项背强几几' },
        { name: '桂枝麻黄各半汤', ingredients: ['桂枝', '芍药', '生姜', '大枣', '甘草', '麻黄', '杏仁'], indication: '太阳病，得之八九日' }
      ],
      '附子': [
        { name: '四逆汤', ingredients: ['附子', '干姜', '甘草'], indication: '少阴病，四肢厥逆' },
        { name: '真武汤', ingredients: ['附子', '白术', '茯苓', '芍药', '生姜'], indication: '阳虚水泛' },
        { name: '麻黄附子细辛汤', ingredients: ['麻黄', '附子', '细辛'], indication: '少阴病，脉沉发热' }
      ],
      '干姜': [
        { name: '理中汤', ingredients: ['人参', '白术', '干姜', '甘草'], indication: '太阴病，自利不渴' },
        { name: '四逆汤', ingredients: ['附子', '干姜', '甘草'], indication: '少阴病，四肢厥逆' },
        { name: '干姜黄芩黄连人参汤', ingredients: ['干姜', '黄芩', '黄连', '人参'], indication: '上热下寒，格拒呕吐' }
      ],
      '人参': [
        { name: '补中益气汤', ingredients: ['黄芪', '人参', '白术', '甘草', '当归', '陈皮', '升麻', '柴胡'], indication: '脾虚气陷' },
        { name: '四君子汤', ingredients: ['人参', '白术', '茯苓', '甘草'], indication: '脾胃气虚' },
        { name: '白虎加人参汤', ingredients: ['石膏', '知母', '甘草', '粳米', '人参'], indication: '白虎汤证兼气虚' }
      ],
      '当归': [
        { name: '当归补血汤', ingredients: ['当归', '黄芪'], indication: '血虚发热' },
        { name: '四物汤', ingredients: ['当归', '熟地', '川芎', '芍药'], indication: '血虚诸证' },
        { name: '当归生姜羊肉汤', ingredients: ['当归', '生姜', '羊肉'], indication: '寒疝腹痛' }
      ],
      '黄芩': [
        { name: '小柴胡汤', ingredients: ['柴胡', '黄芩', '人参', '半夏', '生姜', '大枣', '甘草'], indication: '少阳证' },
        { name: '黄芩汤', ingredients: ['黄芩', '芍药', '甘草', '大枣'], indication: '太阳与少阳合病' },
        { name: '黄连解毒汤', ingredients: ['黄连', '黄芩', '黄柏', '栀子'], indication: '三焦火毒' }
      ],
      '半夏': [
        { name: '小柴胡汤', ingredients: ['柴胡', '黄芩', '人参', '半夏', '生姜', '大枣', '甘草'], indication: '少阳证' },
        { name: '半夏泻心汤', ingredients: ['半夏', '黄芩', '黄连', '人参', '干姜', '甘草', '大枣'], indication: '寒热错杂' },
        { name: '二陈汤', ingredients: ['半夏', '陈皮', '茯苓', '甘草'], indication: '痰湿咳嗽' }
      ],
      '黄连': [
        { name: '黄连解毒汤', ingredients: ['黄连', '黄芩', '黄柏', '栀子'], indication: '三焦火毒' },
        { name: '半夏泻心汤', ingredients: ['半夏', '黄芩', '黄连', '人参', '干姜', '甘草', '大枣'], indication: '寒热错杂' },
        { name: '黄连阿胶汤', ingredients: ['黄连', '黄芩', '芍药', '鸡子黄', '阿胶'], indication: '少阴病，心烦不得卧' }
      ],
      '大黄': [
        { name: '大承气汤', ingredients: ['大黄', '厚朴', '枳实', '芒硝'], indication: '阳明腑实' },
        { name: '小承气汤', ingredients: ['大黄', '厚朴', '枳实'], indication: '阳明腑实轻证' },
        { name: '调胃承气汤', ingredients: ['大黄', '甘草', '芒硝'], indication: '阳明燥热' }
      ]
    };
    
    const herbMap = {
      '黄芪': '人参', '甘草': '人参', '白术': '人参', '茯苓': '人参',
      '芍药': '当归', '川芎': '当归', '熟地': '当归',
      '柴胡': '黄芩', '生姜': '干姜', '大枣': '人参',
      '细辛': '附子', '杏仁': '麻黄', '石膏': '黄芩',
      '黄柏': '黄芩', '栀子': '黄芩', '知母': '黄芩',
      '陈皮': '半夏', '枳实': '大黄', '厚朴': '大黄'
    };
    
    const key = prescriptions[herbName] ? herbName : (herbMap[herbName] || null);
    
    return {
      herbName: herbName,
      prescriptions: key ? prescriptions[key] : [],
      compatibility: key ? prescriptions[key][0]?.ingredients || [] : [],
      contraindications: this.getContraindications(herbName)
    };
  }

  getContraindications(herbName) {
    const contraMap = {
      '麻黄': '表虚有汗者忌用；阴虚火旺者慎用',
      '桂枝': '孕妇慎用；月经过多者慎用',
      '附子': '阴虚阳亢者忌用；孕妇慎用',
      '干姜': '阴虚火旺者忌用',
      '人参': '实证热证忌用；不宜与藜芦同用',
      '黄芪': '表实邪盛者忌用',
      '白术': '阴虚内热者慎用',
      '茯苓': '阴虚火旺者慎用',
      '当归': '湿盛中满者忌用',
      '芍药': '虚寒腹痛者慎用',
      '川芎': '阴虚火旺者慎用',
      '柴胡': '阴虚火旺者慎用',
      '黄芩': '脾胃虚寒者慎用',
      '黄连': '脾胃虚寒者慎用',
      '半夏': '孕妇慎用；阴虚燥咳者忌用',
      '甘草': '湿盛胀满者忌用',
      '大黄': '孕妇慎用；脾胃虚弱者慎用',
      '石膏': '脾胃虚寒者忌用',
      '知母': '脾胃虚寒者慎用',
      '细辛': '阴虚阳亢者忌用；反藜芦'
    };
    
    return contraMap[herbName] || '暂无明确禁忌记载';
  }
}

module.exports = new NihaixiaService();