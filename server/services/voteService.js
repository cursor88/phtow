/**
 * 多模型投票聚合服务
 * 收集多个模型的识别结果，通过投票机制选出最可信的药材名称
 */

function normalizeHerbName(name) {
  if (!name || typeof name !== 'string') return null
  const normalized = name.trim().replace(/[\s\t\n]+/g, '')
  if (normalized === '') return null
  return normalized
}

function extractHerbName(modelResult) {
  if (!modelResult || !modelResult.success || !modelResult.data) {
    return null
  }
  return normalizeHerbName(modelResult.data.name)
}

function aggregateVotes(modelResults) {
  const votes = {}
  const details = []

  modelResults.forEach(result => {
    const herbName = extractHerbName(result)
    
    details.push({
      model: result.model,
      modelName: result.modelName,
      identified: herbName,
      confidence: result.data?.confidence || 0,
      success: result.success,
      error: result.error || null
    })

    if (herbName) {
      if (!votes[herbName]) {
        votes[herbName] = {
          name: herbName,
          count: 0,
          totalConfidence: 0,
          models: []
        }
      }
      votes[herbName].count += 1
      votes[herbName].totalConfidence += (result.data?.confidence || 0)
      votes[herbName].models.push({
        model: result.model,
        modelName: result.modelName,
        confidence: result.data?.confidence || 0
      })
    }
  })

  return { votes, details }
}

function selectWinner(votes) {
  const entries = Object.values(votes)
  if (entries.length === 0) {
    return null
  }

  // 分离中药材和非中药材
  const herbEntries = entries.filter(e => e.name !== '非中药材')
  const nonHerbEntries = entries.filter(e => e.name === '非中药材')

  // 如果有中药材识别结果，优先在中药材中选择
  let candidates = herbEntries.length > 0 ? herbEntries : entries

  // 按票数降序，票数相同则按平均置信度降序
  candidates.sort((a, b) => {
    if (b.count !== a.count) {
      return b.count - a.count
    }
    const avgA = a.totalConfidence / a.count
    const avgB = b.totalConfidence / b.count
    return avgB - avgA
  })

  const winner = candidates[0]
  const avgConfidence = winner.totalConfidence / winner.count

  return {
    name: winner.name,
    voteCount: winner.count,
    avgConfidence: parseFloat(avgConfidence.toFixed(3)),
    supportingModels: winner.models,
    allCandidates: entries.map(e => ({
      name: e.name,
      voteCount: e.count,
      avgConfidence: parseFloat((e.totalConfidence / e.count).toFixed(3))
    })),
    isHerb: winner.name !== '非中药材'
  }
}

function vote(modelResults) {
  console.log('\n========== 多模型投票聚合开始 ==========')
  
  const { votes, details } = aggregateVotes(modelResults)
  
  console.log('\n--- 各模型识别结果 ---')
  details.forEach(d => {
    const status = d.success ? (d.identified || '未识别') : `失败(${d.error})`
    console.log(`${d.modelName}: ${status} (置信度: ${d.confidence})`)
  })

  const winner = selectWinner(votes)
  
  if (winner) {
    console.log('\n--- 投票结果 ---')
    console.log(`胜出药材: ${winner.name}`)
    console.log(`得票数: ${winner.voteCount}/${modelResults.length}`)
    console.log(`平均置信度: ${winner.avgConfidence}`)
    console.log(`支持模型: ${winner.supportingModels.map(m => m.modelName).join(', ')}`)
    
    if (winner.allCandidates.length > 1) {
      console.log('\n--- 所有候选 ---')
      winner.allCandidates.forEach((c, i) => {
        console.log(`  ${i + 1}. ${c.name}: ${c.voteCount}票, 平均置信度${c.avgConfidence}`)
      })
    }
  } else {
    console.log('\n--- 投票结果 ---')
    console.log('无有效识别结果')
  }
  
  console.log('========== 多模型投票聚合结束 ==========\n')
  
  return {
    winner,
    details,
    totalModels: modelResults.length,
    validVotes: Object.keys(votes).length
  }
}

module.exports = {
  vote,
  extractHerbName,
  aggregateVotes,
  selectWinner
}