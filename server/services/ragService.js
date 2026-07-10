/**
 * RAG (Retrieval-Augmented Generation) 知识库检索服务
 * 将多模型投票结果与本地中药材知识库融合，增强识别结果
 */

const herbs = require('../data/herbs')

function normalizeName(name) {
  if (!name) return ''
  return name.trim().replace(/[\s\t\n]+/g, '')
}

function searchHerbByName(name) {
  if (!name) return null
  
  const normalized = normalizeName(name)
  
  // 1. 精确匹配名称
  let match = herbs.find(h => normalizeName(h.name) === normalized)
  if (match) return match
  
  // 2. 精确匹配别名
  match = herbs.find(h => h.alias.some(a => normalizeName(a) === normalized))
  if (match) return match
  
  // 3. 包含匹配（名称包含查询词）
  match = herbs.find(h => normalizeName(h.name).includes(normalized))
  if (match) return match
  
  // 4. 包含匹配（查询词包含名称）
  match = herbs.find(h => normalized.includes(normalizeName(h.name)))
  if (match) return match
  
  // 5. 别名包含匹配
  match = herbs.find(h => h.alias.some(a => normalizeName(a).includes(normalized) || normalized.includes(normalizeName(a))))
  if (match) return match
  
  return null
}

function getBestModelResult(modelResults, herbName) {
  if (!herbName || !modelResults || modelResults.length === 0) return null
  
  const normalizedTarget = normalizeName(herbName)
  
  // 找到识别为该药材且置信度最高的模型结果
  const matching = modelResults
    .filter(r => r.success && r.data && normalizeName(r.data.name) === normalizedTarget)
    .sort((a, b) => (b.data.confidence || 0) - (a.data.confidence || 0))
  
  return matching.length > 0 ? matching[0].data : null
}

function enhanceResult(voteResult, modelResults) {
  console.log('\n========== RAG知识库增强开始 ==========')
  
  if (!voteResult || !voteResult.winner) {
    console.log('无投票结果，跳过RAG增强')
    console.log('========== RAG知识库增强结束 ==========\n')
    return null
  }
  
  const winnerName = voteResult.winner.name
  console.log(`投票胜出名: ${winnerName}`)
  
  if (winnerName === '非中药材') {
    console.log('识别为非中药材，跳过知识库检索')
    const bestModelData = getBestModelResult(modelResults, winnerName)
    
    const result = {
      name: '非中药材',
      id: Date.now(),
      pinyin: '',
      category: '',
      nature: '',
      taste: '',
      meridian: '',
      effect: '',
      indication: '',
      dosage: '',
      taboo: '',
      identify_points: bestModelData?.description || '图片内容不是中药材',
      alias: [],
      classics: [],
      food_match: [],
      accuracy: voteResult.winner.avgConfidence,
      confidenceLevel: '高',
      voteInfo: voteResult.winner,
      source: 'ai',
      ragEnhanced: false,
      model: 'multi-model-vote',
      isFallback: false
    }
    
    console.log('========== RAG知识库增强结束 ==========\n')
    return result
  }
  
  const localHerb = searchHerbByName(winnerName)
  const bestModelData = getBestModelResult(modelResults, winnerName)
  
  if (localHerb) {
    console.log(`✅ 本地知识库匹配成功: ${localHerb.name} (ID: ${localHerb.id})`)
    console.log(`   类别: ${localHerb.category}`)
    console.log(`   功效: ${localHerb.effect.substring(0, 30)}...`)
    console.log(`   典籍数量: ${localHerb.classics?.length || 0}条`)
  } else {
    console.log(`⚠️ 本地知识库未找到: ${winnerName}，将使用AI模型原始数据`)
  }
  
  // 融合策略
  const enhanced = {
    // 名称：以投票结果为准（不可覆盖）
    name: winnerName,
    
    // ID：本地有则用本地的，否则用时间戳
    id: localHerb ? localHerb.id : Date.now(),
    
    // 拼音：本地有则用本地（更规范），否则用模型结果
    pinyin: localHerb?.pinyin || bestModelData?.pinyin || '',
    
    // 类别：本地有则用本地（更专业分类），否则用模型结果
    category: localHerb?.category || bestModelData?.category || '',
    
    // 性味归经：只有本地有
    nature: localHerb?.nature || '',
    taste: localHerb?.taste || '',
    meridian: localHerb?.meridian || '',
    
    // 功效：优先本地（更详细专业），其次模型
    effect: localHerb?.effect || bestModelData?.effect || '',
    
    // 主治：只有本地有
    indication: localHerb?.indication || '',
    
    // 用法用量：只有本地有
    dosage: localHerb?.dosage || '',
    
    // 禁忌：只有本地有
    taboo: localHerb?.taboo || '',
    
    // 鉴别要点：合并本地专业鉴别 + AI模型描述
    identify_points: localHerb?.identify_points 
      ? `${localHerb.identify_points}\n\n【AI辅助鉴别】${bestModelData?.description || ''}` 
      : (bestModelData?.description || ''),
    
    // 别名：只有本地有
    alias: localHerb?.alias || [],
    
    // 典籍溯源：只有本地有
    classics: localHerb?.classics || [],
    
    // 药食同源搭配ID：只有本地有
    food_match: localHerb?.food_match || [],
    
    // 置信度：使用投票平均置信度
    accuracy: voteResult.winner.avgConfidence,
    
    // 置信度等级
    confidenceLevel: voteResult.winner.avgConfidence >= 0.8 ? '高' : 
                     (voteResult.winner.avgConfidence >= 0.6 ? '中' : '低'),
    
    // 投票信息
    voteInfo: {
      voteCount: voteResult.winner.voteCount,
      totalModels: voteResult.totalModels,
      supportingModels: voteResult.winner.supportingModels,
      allCandidates: voteResult.winner.allCandidates
    },
    
    // 来源标记
    source: 'ai',
    ragEnhanced: !!localHerb,
    model: bestModelData ? 'multi-model-vote' : null,
    isFallback: false
  }
  
  console.log('\n--- 增强后数据摘要 ---')
  console.log(`名称: ${enhanced.name}`)
  console.log(`RAG增强: ${enhanced.ragEnhanced ? '是' : '否'}`)
  console.log(`功效来源: ${localHerb?.effect ? '本地知识库' : 'AI模型'}`)
  console.log(`典籍记载: ${enhanced.classics.length > 0 ? enhanced.classics.length + '条' : '无'}`)
  console.log('========== RAG知识库增强结束 ==========\n')
  
  return enhanced
}

module.exports = {
  searchHerbByName,
  enhanceResult,
  getBestModelResult
}