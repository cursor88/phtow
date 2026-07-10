const axios = require('axios')
const crypto = require('crypto')
const { models, activeModels, fallbackToLocal } = require('../config/model')

const SHARED_SYSTEM_PROMPT = `你是一位严谨的中药材鉴定专家。请客观、中立地鉴定图片中的物质，遵循以下原则：

【核心原则】
1. **以图为准**：完全根据图片中实际显示的特征进行判断，不要被常见药材的"先验印象"误导
2. **客观中立**：不要倾向于识别为任何特定药材，避免锚定效应
3. **宁缺毋滥**：如果图片特征不清晰或无法确定，请如实说明，不要硬猜
4. **置信度诚实**：高置信度(>0.8)只在特征非常明确时给出；不确定时应给出较低置信度(<0.6)

【鉴定维度】
- **形态**：根/茎/叶/花/果实/菌类的整体形状
- **颜色**：表面、断面、纹理的具体颜色
- **纹理**：横/纵切面的纹理、纤维走向、有无特殊纹路
- **特殊标识**：气味、味道、产地特征（如有）

【常见中药材特征库】（仅供参考，不要强制匹配）
- 根类：黄芪(淡棕黄、纤维强、菊花心)、党参(根头有狮子盘头)、人参(有芦头珍珠点)、当归(黄棕色、支根多)、五指毛桃(切面有同心环纹、有椰奶香)
- 花类：金银花(棒状、上粗下细、黄白色)、菊花(球形)、玫瑰花
- 果实类：枸杞(红色、纺锤形)、红枣(暗红)
- 菌类：茯苓(类球形、白色)、灵芝(肾形、有漆样光泽)
- 叶类：桑叶、艾叶、薄荷

【重要】如果图片不是中药材（如食物、风景、人物等），请明确指出"非中药材"，不要强行识别为某种药材。

【返回JSON格式】
请返回 Top-3 最可能的药材，按置信度从高到低排序。如果是中药材，返回3个候选；如果明显不是中药材，top1为"非中药材"。
{
  "name": "最可能的药材名称（或'非中药材'）",
  "pinyin": "拼音",
  "category": "类别",
  "effect": "主要功效",
  "confidence": 0.75,
  "description": "客观描述图片中显示的特征",
  "top3": [
    {
      "name": "第1名药材名称",
      "pinyin": "拼音",
      "confidence": 0.75,
      "key_points": {
        "smell": "气味鉴别点",
        "texture": "质地鉴别点",
        "cross_section": "断面鉴别点",
        "outer_skin": "外皮/表面鉴别点",
        "other": "其他鉴别点"
      },
      "reason": "判断理由"
    },
    {
      "name": "第2名药材名称",
      "confidence": 0.55,
      "key_points": {
        "smell": "",
        "texture": "",
        "cross_section": "",
        "outer_skin": "",
        "other": ""
      },
      "reason": "为什么排第二"
    },
    {
      "name": "第3名药材名称",
      "confidence": 0.35,
      "key_points": {
        "smell": "",
        "texture": "",
        "cross_section": "",
        "outer_skin": "",
        "other": ""
      },
      "reason": "为什么排第三"
    }
  ]
}`

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex')
}

function hmacSha1(key, str) {
  return crypto.createHmac('sha1', key).update(str).digest('base64')
}

function getTencentAuthorization(secretId, secretKey, method, endpoint, path, params) {
  const timestamp = Math.floor(Date.now() / 1000)
  const nonce = Math.floor(Math.random() * 1000000000)
  
  const queryParams = {
    SecretId: secretId,
    Timestamp: timestamp,
    Nonce: nonce,
    SignatureMethod: 'HmacSHA1',
    ...params
  }
  
  const sortedKeys = Object.keys(queryParams).sort()
  const signStr = method + endpoint + path + '?' + sortedKeys.map(k => `${k}=${encodeURIComponent(queryParams[k])}`).join('&')
  
  const signature = hmacSha1(secretKey, signStr)
  
  return {
    Authorization: signature,
    timestamp,
    nonce,
    secretId
  }
}

async function callOpenAI(config, imageBase64) {
  try {
    const response = await axios({
      method: 'post',
      url: `${config.apiBase}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: config.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别这张图片中的中药药材。请返回JSON格式，包含以下字段：name(药材名称)、pinyin(拼音)、category(类别，如补虚药、清热药)、effect(功效)、confidence(置信度0-1)、description(简要描述)。如果无法识别，请返回null。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      },
      timeout: config.timeout
    })
    
    const content = response.data.choices[0]?.message?.content || ''
    return parseModelResponse(content)
  } catch (error) {
    console.error('OpenAI API Error:', error.message)
    throw error
  }
}

async function callZhipu(config, imageBase64) {
  try {
    console.log('\n========== 智谱AI API调用开始 ==========')
    console.log(`模型: ${config.model}`)
    console.log(`图片大小: ${imageBase64.length} bytes`)

    const response = await axios({
      method: 'post',
      url: `${config.apiBase}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: SHARED_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              },
              {
                type: 'text',
                text: '请客观鉴定这张图片。严格按照图片实际显示的特征进行判断，不要偏向任何特定药材。如果无法确定，请降低置信度。'
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      },
      timeout: config.timeout
    })
    
    console.log('\n--- 完整响应数据 ---')
    console.log(JSON.stringify(response.data, null, 2))
    
    const content = response.data.choices[0]?.message?.content || ''
    console.log('\n--- 模型返回内容 ---')
    console.log(content)
    
    const parsed = parseModelResponse(content)
    console.log('\n--- 解析结果 ---')
    console.log(JSON.stringify(parsed, null, 2))
    console.log('========== 智谱AI API调用结束 ==========\n')
    
    return parsed
  } catch (error) {
    console.error('\n========== 智谱AI API调用失败 ==========')
    console.error('错误信息:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2))
    }
    console.log('=========================================\n')
    throw error
  }
}

async function callDoubao(config, imageBase64) {
  try {
    console.log('\n========== 豆包API调用开始 ==========')
    console.log(`模型: ${config.model}`)
    console.log(`图片大小: ${imageBase64.length} bytes`)

    const response = await axios({
      method: 'post',
      url: `${config.apiBase}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: SHARED_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              },
              {
                type: 'text',
                text: '请客观鉴定这张图片。严格按照图片实际显示的特征进行判断，不要偏向任何特定药材。如果无法确定，请降低置信度。'
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 600
      },
      timeout: config.timeout
    })
    
    console.log('\n--- 完整响应数据 ---')
    console.log(JSON.stringify(response.data, null, 2))
    
    const content = response.data.choices[0]?.message?.content || ''
    console.log('\n--- 模型返回内容 ---')
    console.log(content)
    
    const parsed = parseModelResponse(content)
    console.log('\n--- 解析结果 ---')
    console.log(JSON.stringify(parsed, null, 2))
    console.log('========== 豆包API调用结束 ==========\n')
    
    return parsed
  } catch (error) {
    console.error('\n========== 豆包API调用失败 ==========')
    console.error('错误信息:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2))
    }
    console.log('=========================================\n')
    throw error
  }
}

async function callHunyuan(config, imageBase64) {
  try {
    const endpoint = 'hunyuan.tencentcloudapi.com'
    const path = '/v1/chat/completions'
    
    const auth = getTencentAuthorization(
      config.secretId,
      config.secretKey,
      'POST',
      endpoint,
      path,
      {}
    )
    
    const response = await axios({
      method: 'post',
      url: `https://${endpoint}${path}`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': auth.Authorization,
        'X-TC-Timestamp': auth.timestamp,
        'X-TC-Nonce': auth.nonce,
        'X-TC-SecretId': auth.secretId
      },
      data: {
        Model: config.model,
        Messages: [
          {
            Role: 'user',
            Content: `请识别这张图片中的中药药材。请返回JSON格式，包含以下字段：name(药材名称)、pinyin(拼音)、category(类别，如补虚药、清热药)、effect(功效)、confidence(置信度0-1)、description(简要描述)。如果无法识别，请返回null。`
          }
        ],
        ImageBase64: imageBase64,
        Temperature: 0.1,
        MaxTokens: 500
      },
      timeout: config.timeout
    })
    
    const content = response.data.Response?.Choices?.[0]?.Message?.Content || ''
    return parseModelResponse(content)
  } catch (error) {
    console.error('Hunyuan API Error:', error.message)
    throw error
  }
}

async function callQwen(config, imageBase64) {
  try {
    console.log('\n========== 通义千问API调用开始 ==========')
    console.log(`模型: ${config.model}`)
    console.log(`图片大小: ${imageBase64.length} bytes`)

    const response = await axios({
      method: 'post',
      url: `${config.apiBase}/compatible-mode/v1/chat/completions`,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: SHARED_SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请客观鉴定这张图片。严格按照图片实际显示的特征进行判断，不要偏向任何特定药材。如果无法确定，请降低置信度。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 1500
      },
      timeout: config.timeout
    })
    
    console.log('\n--- 完整响应数据 ---')
    console.log(JSON.stringify(response.data, null, 2))
    
    const content = response.data.choices?.[0]?.message?.content || ''
    console.log('\n--- 模型返回内容 ---')
    console.log(content)
    
    const parsed = parseModelResponse(content)
    console.log('\n--- 解析结果 ---')
    console.log(JSON.stringify(parsed, null, 2))
    console.log('========== 通义千问API调用结束 ==========\n')
    
    return parsed
  } catch (error) {
    console.error('\n========== 通义千问API调用失败 ==========')
    console.error('错误信息:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2))
    }
    console.log('=========================================\n')
    throw error
  }
}

async function callMoonshot(config, imageBase64) {
  try {
    const response = await axios({
      method: 'post',
      url: `${config.apiBase}/chat/completions`,
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Content-Type': 'application/json'
      },
      data: {
        model: config.model,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: '请识别这张图片中的中药药材。请返回JSON格式，包含以下字段：name(药材名称)、pinyin(拼音)、category(类别，如补虚药、清热药)、effect(功效)、confidence(置信度0-1)、description(简要描述)。如果无法识别，请返回null。'
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 500
      },
      timeout: config.timeout
    })
    
    const content = response.data.choices[0]?.message?.content || ''
    return parseModelResponse(content)
  } catch (error) {
    console.error('Moonshot API Error:', error.message)
    throw error
  }
}

async function callOllama(config, imageBase64) {
  try {
    console.log('\n========== Ollama本地模型调用开始 ==========')
    console.log(`模型: ${config.model}`)
    console.log(`图片大小: ${imageBase64.length} bytes`)

    const isQwen = config.model.includes('qwen')
    const systemPrompt = isQwen ? SHARED_SYSTEM_PROMPT : 'You are a herb identification expert. Identify the Chinese medicinal herb in the image. Respond with ONLY a valid JSON object, no other text.'
    const userText = isQwen 
      ? '请客观鉴定这张图片。严格按照图片实际显示的特征进行判断，不要偏向任何特定药材。如果无法确定，请降低置信度。请以JSON格式返回结果。'
      : 'Identify this image. If it is a Chinese medicinal herb, output JSON with name, confidence (0-1), category, effect, and description. If not a herb, set name to "非中药材". Output ONLY the JSON object:\n{"name":"herb name","pinyin":"","category":"","effect":"","confidence":0.7,"description":"what you see in the image"}'

    const response = await axios({
      method: 'post',
      url: `${config.apiBase}/chat/completions`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: userText
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${imageBase64}`
                }
              }
            ]
          }
        ],
        temperature: 0.2,
        max_tokens: 800,
        stream: false
      },
      timeout: config.timeout
    })
    
    console.log('\n--- 完整响应数据 ---')
    console.log(JSON.stringify(response.data, null, 2))
    
    const content = response.data.choices?.[0]?.message?.content || ''
    console.log('\n--- 模型返回内容 ---')
    console.log(content)
    
    const parsed = isQwen ? parseModelResponse(content) : parseOllamaResponse(content)
    console.log('\n--- 解析结果 ---')
    console.log(JSON.stringify(parsed, null, 2))
    console.log('========== Ollama本地模型调用结束 ==========\n')
    
    return parsed
  } catch (error) {
    console.error('\n========== Ollama本地模型调用失败 ==========')
    console.error('错误信息:', error.message)
    if (error.response) {
      console.error('响应状态:', error.response.status)
      console.error('响应数据:', JSON.stringify(error.response.data, null, 2))
    }
    console.log(`提示: 请确保已安装Ollama并运行 \`ollama run ${config.model}\``)
    console.log('=============================================\n')
    throw error
  }
}

function parseModelResponse(content) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const result = JSON.parse(jsonMatch[0])
      if (result.name) {
        const parsed = {
          name: result.name,
          pinyin: result.pinyin || '',
          category: result.category || '',
          effect: result.effect || '',
          confidence: parseFloat(result.confidence) || 0.8,
          description: result.description || '',
          distinguishFrom: result.distinguishFrom || '',
          habitat: result.habitat || '',
          source: 'ai',
          top3: []
        }

        if (Array.isArray(result.top3) && result.top3.length > 0) {
          parsed.top3 = result.top3.map(item => ({
            name: item.name || '',
            pinyin: item.pinyin || '',
            confidence: parseFloat(item.confidence) || 0,
            key_points: item.key_points || {
              smell: '',
              texture: '',
              cross_section: '',
              outer_skin: '',
              other: ''
            },
            reason: item.reason || ''
          }))
        }

        return parsed
      }
    }
    return null
  } catch (error) {
    console.error('Parse Response Error:', error.message)
    return null
  }
}

function parseOllamaResponse(content) {
  try {
    // 1. 先尝试解析JSON
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0])
        if (result.name) {
          return {
            name: result.name,
            pinyin: result.pinyin || '',
            category: result.category || '',
            effect: result.effect || '',
            confidence: parseFloat(result.confidence) || 0.7,
            description: result.description || '',
            distinguishFrom: result.distinguishFrom || '',
            habitat: result.habitat || '',
            source: 'ai'
          }
        }
      } catch (e) {
        console.log('JSON解析失败，尝试从自然语言中提取')
      }
    }

    // 2. 从英文描述中提取关键词，匹配常见中药材
    const description = content.trim()
    
    const herbKeywords = {
      '枸杞': ['wolfberry', 'goji', 'goji berry', 'gou qi', 'lycium', 'red berry', 'chinese berry'],
      '菊花': ['chrysanthemum', 'chrysanthemum flower', 'ju hua', 'yellow flower'],
      '金银花': ['honeysuckle', 'jin yin hua', 'lonicera'],
      '黄芪': ['astragalus', 'huang qi', 'milk vetch', 'root', 'yellow root'],
      '当归': ['angelica', 'dang gui', 'chinese angelica'],
      '人参': ['ginseng', 'ren shen', 'panax'],
      '党参': ['codonopsis', 'dang shen', 'poor man\'s ginseng'],
      '红枣': ['red date', 'jujube', 'hong zao', 'chinese date', 'date'],
      '茯苓': ['poria', 'fuling', 'tuckahoe', 'cocos', 'white fungus', 'mushroom'],
      '灵芝': ['ganoderma', 'lingzhi', 'reishi', 'glossy ganoderma'],
      '五指毛桃': ['five-finger fig', 'wu zhi mao tao', 'ficus hirta', 'coconut smell'],
      '桑叶': ['mulberry leaf', 'sang ye', 'morus'],
      '薄荷': ['mint', 'peppermint', 'bo he', 'mentha'],
      '艾叶': ['mugwort', 'ai ye', 'artemisia argyi', 'wormwood'],
      '玫瑰花': ['rose', 'rose flower', 'mei gui', 'rosa'],
      '陈皮': ['dried tangerine peel', 'chen pi', 'citrus peel', 'orange peel']
    }

    const lowerContent = description.toLowerCase()
    let bestMatch = null
    let bestScore = 0
    
    for (const [chineseName, keywords] of Object.entries(herbKeywords)) {
      let score = 0
      for (const kw of keywords) {
        if (lowerContent.includes(kw)) {
          score += 1
        }
      }
      if (score > bestScore) {
        bestScore = score
        bestMatch = chineseName
      }
    }

    // 3. 如果有匹配到药材，返回结果
    if (bestMatch && bestScore >= 1) {
      const confidence = Math.min(0.5 + bestScore * 0.15, 0.85)
      return {
        name: bestMatch,
        pinyin: '',
        category: '',
        effect: '',
        confidence: confidence,
        description: description,
        distinguishFrom: '',
        habitat: '',
        source: 'ai',
        _extracted: true
      }
    }

    // 4. 检查是否是非中药材（有flower、food、plant、table等词但未匹配药材）
    if (description.length > 20 && !bestMatch) {
      return {
        name: '非中药材',
        pinyin: '',
        category: '',
        effect: '',
        confidence: 0.6,
        description: description,
        distinguishFrom: '',
        habitat: '',
        source: 'ai',
        _extracted: true
      }
    }

    return null
  } catch (error) {
    console.error('Parse Ollama Response Error:', error.message)
    return null
  }
}

const modelHandlers = {
  openai: callOpenAI,
  zhipu: callZhipu,
  hunyuan: callHunyuan,
  qwen: callQwen,
  doubao: callDoubao,
  moonshot: callMoonshot,
  ollama: callOllama
}

async function callOllamaWithCandidates(config, imageBase64, candidates) {
  try {
    console.log('\n========== Ollama候选验证调用开始 ==========')
    console.log(`模型: ${config.model}`)
    console.log(`候选数量: ${candidates.length}`)
    console.log(`候选药材: ${candidates.map(c => c.herbName).join(', ')}`)

    const candidateList = candidates.map((c, i) => 
      `${i + 1}. ${c.herbName} (相似度: ${(c.bestScore * 100).toFixed(0)}%)`
    ).join('\n')

    const isQwen = config.model.includes('qwen')
    const userText = isQwen
      ? `请仔细观察图片中的中药材。\n\n以下是几种可能的候选药材：\n${candidateList}\n\n请从上述候选中选择最可能的一种。如果都不像，就选你认为最接近的，但置信度要低。\n\n请以JSON格式返回：{"name": "药材名", "confidence": 0.0-1.0, "description": "判断理由"}`
      : `Look carefully at the image. These are candidate herbs:\n${candidateList}\n\nChoose the MOST likely one from the list above. If none match well, pick the closest but with low confidence.\n\nReturn ONLY this JSON format: {"name": "herb name from list", "confidence": 0.0-1.0, "description": "reason"}`

    const response = await axios({
      method: 'post',
      url: `${config.apiBase}/chat/completions`,
      headers: {
        'Content-Type': 'application/json'
      },
      data: {
        model: config.model,
        messages: [
          {
            role: 'system',
            content: isQwen 
              ? '你是中药材鉴定专家。请从给定的候选药材中选择最符合图片的一种。'
              : 'You are a herb identification expert. Choose the best match from the candidate list.'
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: userText },
              {
                type: 'image_url',
                image_url: { url: `data:image/jpeg;base64,${imageBase64}` }
              }
            ]
          }
        ],
        temperature: 0.1,
        max_tokens: 300,
        stream: false
      },
      timeout: config.timeout
    })

    const content = response.data.choices?.[0]?.message?.content || ''
    console.log('\n--- LLM候选验证结果 ---')
    console.log(content)

    const parsed = parseCandidateResponse(content, candidates)
    console.log('\n--- 解析结果 ---')
    console.log(JSON.stringify(parsed, null, 2))
    console.log('========== Ollama候选验证调用结束 ==========\n')

    return parsed
  } catch (error) {
    console.error('\n========== Ollama候选验证调用失败 ==========')
    console.error('错误:', error.message)
    console.log('=============================================\n')
    throw error
  }
}

function parseCandidateResponse(content, candidates) {
  try {
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      try {
        const result = JSON.parse(jsonMatch[0])
        if (result.name) {
          const matched = candidates.find(c => 
            c.herbName === result.name || 
            result.name.includes(c.herbName) ||
            c.herbName.includes(result.name)
          )
          
          if (matched) {
            return {
              name: matched.herbName,
              herbId: matched.herbId,
              confidence: parseFloat(result.confidence) || matched.bestScore,
              description: result.description || '',
              source: 'ai-candidate'
            }
          }
          
          return {
            name: result.name,
            confidence: parseFloat(result.confidence) || 0.5,
            description: result.description || '',
            source: 'ai-candidate'
          }
        }
      } catch (e) {
        console.log('JSON解析失败，尝试关键词匹配')
      }
    }

    let bestMatch = null
    let bestScore = 0
    const lowerContent = content.toLowerCase()

    for (const c of candidates) {
      let score = 0
      if (lowerContent.includes(c.herbName.toLowerCase())) score += 2
      const nameIdx = lowerContent.indexOf(c.herbName.charAt(0))
      if (nameIdx >= 0 && nameIdx < 50) score += 1
      
      if (score > bestScore) {
        bestScore = score
        bestMatch = c
      }
    }

    if (bestMatch && bestScore >= 1) {
      return {
        name: bestMatch.herbName,
        herbId: bestMatch.herbId,
        confidence: bestMatch.bestScore * 0.9,
        description: content.trim().substring(0, 200),
        source: 'ai-candidate-keyword'
      }
    }

    if (candidates.length > 0) {
      return {
        name: candidates[0].herbName,
        herbId: candidates[0].herbId,
        confidence: candidates[0].bestScore * 0.8,
        description: content.trim().substring(0, 200),
        source: 'fallback-top-candidate'
      }
    }

    return null
  } catch (error) {
    console.error('Parse Candidate Error:', error.message)
    if (candidates.length > 0) {
      return {
        name: candidates[0].herbName,
        herbId: candidates[0].herbId,
        confidence: candidates[0].bestScore * 0.7,
        description: '',
        source: 'error-fallback'
      }
    }
    return null
  }
}

async function callModel(imageBuffer, modelKey = null) {
  const imageBase64 = imageBuffer.toString('base64')
  
  const selectedModel = modelKey || activeModels[0]
  if (!selectedModel) {
    console.warn('No active models configured, will use local fallback')
    return { fallback: true, data: null }
  }
  
  const config = models[selectedModel]
  const handler = modelHandlers[selectedModel]
  
  if (!handler) {
    console.warn(`No handler for model: ${selectedModel}`)
    return { fallback: true, data: null }
  }
  
  try {
    console.log(`Calling ${config.name} for herb identification...`)
    const result = await handler(config, imageBase64)
    
    if (result) {
      console.log(`Successfully identified: ${result.name} (confidence: ${result.confidence})`)
      return { fallback: false, data: result }
    } else {
      console.warn('Model returned null result')
      return { fallback: true, data: null }
    }
  } catch (error) {
    console.error(`Model ${selectedModel} failed:`, error.message)
    
    if (fallbackToLocal) {
      return { fallback: true, data: null }
    }
    
    throw error
  }
}

async function callModelWithCandidates(imageBuffer, candidates, modelKey = null) {
  const imageBase64 = imageBuffer.toString('base64')
  
  const selectedModel = modelKey || activeModels[0]
  if (!selectedModel) {
    console.warn('No active models configured')
    return { fallback: true, data: null }
  }
  
  const config = models[selectedModel]
  
  try {
    console.log(`Calling ${config.name} for candidate verification...`)
    
    let result
    if (selectedModel === 'ollama') {
      result = await callOllamaWithCandidates(config, imageBase64, candidates)
    } else {
      result = await modelHandlers[selectedModel](config, imageBase64)
    }
    
    if (result) {
      console.log(`Candidate verification result: ${result.name} (confidence: ${result.confidence})`)
      return { fallback: false, data: result }
    } else {
      console.warn('Candidate verification returned null')
      return { fallback: true, data: null }
    }
  } catch (error) {
    console.error(`Candidate verification with ${selectedModel} failed:`, error.message)
    return { fallback: true, data: null }
  }
}

async function callWithRetry(imageBuffer) {
  for (const modelKey of activeModels) {
    try {
      const result = await callModel(imageBuffer, modelKey)
      if (!result.fallback && result.data) {
        return result
      }
    } catch (error) {
      console.warn(`Failed to call ${modelKey}, trying next...`)
    }
  }
  
  return { fallback: true, data: null }
}

async function callModelsParallel(imageBuffer, targetModels = ['zhipu', 'qwen', 'doubao']) {
  const imageBase64 = imageBuffer.toString('base64')
  
  const enabledModels = targetModels.filter(key => models[key]?.enabled)
  if (enabledModels.length === 0) {
    console.warn('No target models enabled for parallel call')
    return { fallback: true, results: [] }
  }
  
  console.log(`\n========== 多模型并行调用开始 ==========`)
  console.log(`目标模型: ${enabledModels.join(', ')}`)
  
  const promises = enabledModels.map(async (modelKey) => {
    const config = models[modelKey]
    const handler = modelHandlers[modelKey]
    
    if (!handler) {
      return {
        model: modelKey,
        modelName: config.name,
        success: false,
        error: 'No handler found',
        data: null
      }
    }
    
    try {
      const startTime = Date.now()
      const result = await handler(config, imageBase64)
      const duration = Date.now() - startTime
      
      if (result) {
        return {
          model: modelKey,
          modelName: config.name,
          success: true,
          duration,
          data: result
        }
      } else {
        return {
          model: modelKey,
          modelName: config.name,
          success: false,
          error: 'Model returned null',
          data: null
        }
      }
    } catch (error) {
      return {
        model: modelKey,
        modelName: config.name,
        success: false,
        error: error.message,
        data: null
      }
    }
  })
  
  const results = await Promise.allSettled(promises)
  const processedResults = results.map((result, index) => {
    if (result.status === 'fulfilled') {
      return result.value
    } else {
      return {
        model: enabledModels[index],
        modelName: models[enabledModels[index]]?.name || enabledModels[index],
        success: false,
        error: result.reason?.message || 'Unknown error',
        data: null
      }
    }
  })
  
  const successCount = processedResults.filter(r => r.success).length
  console.log(`\n--- 多模型调用结果汇总 ---`)
  processedResults.forEach(r => {
    const status = r.success ? '✅ 成功' : '❌ 失败'
    const detail = r.success ? `${r.data?.name} (置信度: ${r.data?.confidence})` : r.error
    console.log(`${r.modelName}: ${status} - ${detail}`)
  })
  console.log(`成功: ${successCount}/${enabledModels.length}`)
  console.log('========== 多模型并行调用结束 ==========\n')
  
  return {
    fallback: successCount === 0,
    results: processedResults
  }
}

module.exports = {
  callModel,
  callWithRetry,
  callModelsParallel,
  callModelWithCandidates,
  activeModels,
  models
}