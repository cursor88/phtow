// 动态解析 BASE_URL 和 SERVER_ORIGIN：
// - H5 端：优先使用当前页面 origin 走同源 /api 代理（避免跨域与域名配置）
// - 小程序端：可通过 uni.getStorageSync('apiBase') / 'serverOrigin' 覆盖默认值，
//   默认回退到编译期固定的内网 IP（开发期勾选"不校验合法域名"即可，发布期请改为 HTTPS 域名）
const DEFAULT_INNER_ORIGIN = 'http://192.168.3.8:8080'

const _resolveOrigin = () => {
  try {
    // 小程序环境：允许本地覆盖（不重启编译也能切）
    // #ifdef MP
    const mpCustom = uni.getStorageSync('serverOrigin')
    if (mpCustom && /^https?:\/\//.test(mpCustom)) {
      return mpCustom
    }
    // #endif
    // H5 / 浏览器：同源访问优先
    // #ifdef H5
    if (typeof window !== 'undefined' && window.location && window.location.origin) {
      // 若页面是 file:// / localhost 静态调试，仍走默认内网 IP
      if (!/^https?:\/\//.test(window.location.origin)) return DEFAULT_INNER_ORIGIN
      return window.location.origin
    }
    // #endif
  } catch (e) {
    // 忽略存储读取异常
  }
  return DEFAULT_INNER_ORIGIN
}

const SERVER_ORIGIN = _resolveOrigin()
const BASE_URL = SERVER_ORIGIN + '/api'

const PLACEHOLDER_HERB = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGZiZjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1zaXplPSI2MCIgZmlsbD0iIzlkY2FhYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+8J+NtDwvdGV4dD48L3N2Zz4='

const getImageUrl = (url) => {
  if (!url) return PLACEHOLDER_HERB
  if (url.startsWith('http')) return url
  if (url.startsWith('data:')) return url
  // 兼容双斜杠开头：把 "/uploads/..." 转成绝对地址；也防止 encodeURI 把 '/' 双重编码
  const safe = url.charAt(0) === '/' ? url : '/' + url
  return SERVER_ORIGIN + safe
}

// 从药材对象中优先解析出可用的首图 URL（兼容 image / cover_image_url 字段）
const resolveHerbImage = (herb) => {
  if (!herb) return ''
  const candidates = [
    herb.image,
    herb.cover_image_url,
    herb.coverImageUrl,
    herb.img,
    herb.image_url,
    herb.imageUrl
  ]
  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i] && typeof candidates[i] === 'string' && candidates[i].trim() !== '') {
      return candidates[i]
    }
  }
  // 若有 images 数组，取第一张
  if (Array.isArray(herb.images) && herb.images.length > 0) {
    const first = herb.images[0]
    if (typeof first === 'string') return first
    if (first && first.url) return first.url
    if (first && first.image_url) return first.image_url
  }
  return ''
}

// 常用组合：取药材对象图 → 并转成完整 URL
const getHerbImageUrl = (herb) => {
  return getImageUrl(resolveHerbImage(herb))
}

const getToken = () => {
  try {
    const raw = uni.getStorageSync('token')
    if (!raw) return ''
    try {
      return JSON.parse(raw) || ''
    } catch (e) {
      return raw || ''
    }
  } catch (e) {
    return ''
  }
}

const request = (options) => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const header = {
      'Content-Type': 'application/json',
      ...options.header
    }
    if (token) {
      header['Authorization'] = 'Bearer ' + token
    }
    const fullUrl = BASE_URL + options.url
    uni.request({
      url: fullUrl,
      method: options.method || 'GET',
      data: options.data || {},
      header,
      success: (res) => {
        if (res.statusCode === 200) {
          if (res.data.code === 0) {
            resolve(res.data.data)
          } else {
            uni.showToast({
              title: res.data.message || '请求失败',
              icon: 'none'
            })
            reject(res.data)
          }
        } else {
          const msg = 'HTTP ' + (res.statusCode || 'ERR')
          console.error('[request] status not 200', fullUrl, res.statusCode, res.data)
          uni.showToast({
            title: msg,
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        const errMsg = (err && err.errMsg) || ''
        let tip = '网络连接失败'
        // 微信小程序特有的错误分类提示
        if (errMsg.indexOf('url not in domain list') > -1 || errMsg.indexOf('合法域名') > -1) {
          tip = '未配置合法域名（开发期可勾选"不校验合法域名"）'
        } else if (errMsg.indexOf('fail timeout') > -1) {
          tip = '请求超时，请检查网络'
        } else if (errMsg.indexOf('Failed to fetch') > -1 || /fetch/i.test(errMsg)) {
          // 微信小程序侧典型的"无法访问目标服务器"（IP不可达/端口不通/HTTP 未走 SSL）
          tip = '服务器不可达，请检查 IP/端口及同网段'
        }
        console.error('[request] fail', fullUrl, errMsg || err)
        uni.showToast({
          title: tip,
          icon: 'none',
          duration: 2500
        })
        reject(err)
      }
    })
  })
}

const uploadFile = (filePath, url = '/herb/identify') => {
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + url,
      filePath: filePath,
      name: 'image',
      success: (res) => {
        try {
          const data = JSON.parse(res.data)
          if (data.code === 0) {
            resolve(data.data)
          } else {
            uni.showToast({
              title: data.message || '识别失败',
              icon: 'none'
            })
            reject(data)
          }
        } catch (e) {
          reject(e)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '上传失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

export const herbApi = {
  identify: (filePath) => uploadFile(filePath, '/herb/identify'),
  getDetail: (id) => request({ url: `/herb/detail/${encodeURIComponent(id)}` }),
  getList: (params) => request({ url: '/herb/list', data: params }),
  getClassics: (id) => request({ url: `/herb/classics/${id}` }),
  getFoodMatch: (id) => request({ url: `/herb/food-match/${id}` })
}

export const quizApi = {
  getDailyQuestion: () => request({ url: '/quiz/daily' }),
  getRandomQuestion: (topicId) => request({ url: topicId ? `/quiz/random?topic_id=${topicId}` : '/quiz/random' }),
  submitAnswer: (questionId, answer) => request({
    url: '/quiz/submit',
    method: 'POST',
    data: { questionId, answer }
  }),
  getList: (params) => request({ url: '/quiz/list', data: params }),
  getTopics: () => request({ url: '/quiz/topics' }),
  getStats: () => request({ url: '/quiz/stats' })
}

export const matchApi = {
  getMatchList: (params) => {
    // 兼容旧调用：传入数字时视为 herbId
    if (typeof params === 'number' || typeof params === 'string') {
      params = { herbId: params }
    }
    params = params || {}
    let url = `/match/list?page=${params.page || 1}&pageSize=${params.pageSize || 10}`
    if (params.herbId) url += `&herbId=${params.herbId}`
    return request({ url })
  },
  getMatchDetail: (id) => request({ url: `/match/detail/${id}` }),
  searchMatches: (keyword) => request({ url: `/match/search?keyword=${encodeURIComponent(keyword)}` })
}

export const constitutionApi = {
  getQuestions: (mode) => request({ url: `/constitution/questions?mode=${mode || 'standard'}` }),
  submit: (data) => request({ url: '/constitution/submit', method: 'POST', data }),
  getRecords: () => request({ url: '/constitution/records' }),
  getRecord: (id) => request({ url: `/constitution/record/${id}` }),
  deleteRecord: (id) => request({ url: `/constitution/record/${id}`, method: 'DELETE' }),
  getTypes: () => request({ url: '/constitution/constitution-types' })
}

export const checkinApi = {
  getDailyHerb: () => request({ url: '/checkin/daily-herb' }),
  checkin: (herbId) => request({ url: '/checkin/checkin', method: 'POST', data: { herbId } }),
  getRecords: () => request({ url: '/checkin/records' }),
  getCalendar: (year, month) => request({ url: `/checkin/calendar?year=${year}&month=${month}` }),
  getStats: () => request({ url: '/checkin/stats' })
}

export const identifyApi = {
  identify: (imagePath) => uploadFile(imagePath, '/herb/identify'),
  addRecord: (data) => request({ url: '/identify/add', method: 'POST', data }),
  deleteRecord: (id) => request({ url: `/identify/delete/${id}`, method: 'POST' }),
  getRecords: (page, pageSize) => request({ url: `/identify/list?page=${page || 1}&pageSize=${pageSize || 20}` }),
  getStats: () => request({ url: '/identify/stats' })
}

export const authApi = {
  login: (username, password) => request({
    url: '/auth/login',
    method: 'POST',
    data: { username, password }
  }),
  register: (data) => request({ url: '/auth/register', method: 'POST', data }),
  forgotStep1: (username) => request({ url: '/auth/forgot-check', method: 'POST', data: { username } }),
  forgotReset: (data) => request({ url: '/auth/forgot-reset', method: 'POST', data }),
  logout: () => request({ url: '/auth/logout', method: 'POST' }),
  getProfile: () => request({ url: '/auth/profile' })
}

export const chatApi = {
  sendMessage: (data) => request({ url: '/chat/message', method: 'POST', data }),
  continueChat: (data) => request({ url: '/chat/message', method: 'POST', data }),
  getHistory: (page) => request({ url: `/chat/history?page=${page || 1}` }),
  getDetail: (sessionId) => request({ url: `/chat/history/${sessionId}` }),
  deleteHistory: (sessionId) => request({ url: `/chat/history/${sessionId}`, method: 'DELETE' })
}

export const llmConfigApi = {
  getStatus: () => request({ url: '/llm-status' }),
  getPresets: () => request({ url: '/llm/presets' }),
  getProviders: () => request({ url: '/llm/config' }),
  saveProvider: (data) => request({ url: '/llm/config', method: 'POST', data }),
  setActiveProvider: (id) => request({ url: `/llm/active/${id}`, method: 'PUT' }),
  deleteProvider: (id) => request({ url: `/llm/providers/${id}`, method: 'DELETE' }),
  checkStatus: () => request({ url: '/llm/check', method: 'POST' })
}

export const favoriteApi = {
  getHerbs: () => request({ url: '/favorite/herbs' }),
  toggleHerb: (herbId) => request({
    url: '/favorite/toggle',
    method: 'POST',
    data: { targetType: 'herb', targetId: herbId }
  }),
  getMatches: () => request({ url: '/favorite/matches' }),
  toggleMatch: (matchId) => request({
    url: '/favorite/toggle',
    method: 'POST',
    data: { targetType: 'match', targetId: matchId }
  })
}

export const wrongQuestionApi = {
  getList: (params) => request({ url: '/wrong-questions/list', data: params }),
  add: (data) => request({ url: '/wrong-questions/add', method: 'POST', data }),
  clear: () => request({ url: '/wrong-questions/clear', method: 'POST' }),
  remove: (id) => request({ url: '/wrong-questions/remove', method: 'POST', data: { id } })
}

export const reviewApi = {
  getPendingList: (page) => request({ url: `/admin/pending-images?page=${page || 1}` }),
  approve: (id, data) => request({ url: `/admin/approve-image/${id}`, method: 'POST', data }),
  reject: (id, data) => request({ url: `/admin/reject-image/${id}`, method: 'POST', data }),
  getStats: () => request({ url: '/admin/dashboard-stats' })
}

// 识别纠错反馈：使用 uni.uploadFile 提交图片+表单字段
export const feedbackApi = {
  submitCorrection: (filePath, data) => {
    return new Promise((resolve, reject) => {
      uni.uploadFile({
        url: BASE_URL + '/feedback/identify-correction',
        filePath: filePath,
        name: 'image',
        formData: {
          herbId: data.herbId || 0,
          herbName: data.herbName || '',
          originalResult: data.originalResult || '',
          note: data.note || ''
        },
        success: (res) => {
          try {
            const parsed = JSON.parse(res.data)
            if (parsed.code === 0) {
              resolve(parsed.data)
            } else {
              uni.showToast({ title: parsed.message || '提交失败', icon: 'none' })
              reject(parsed)
            }
          } catch (e) {
            uni.showToast({ title: '提交失败', icon: 'none' })
            reject(e)
          }
        },
        fail: (err) => {
          uni.showToast({ title: '网络连接失败', icon: 'none' })
          reject(err)
        }
      })
    })
  }
}

export { getImageUrl, resolveHerbImage, getHerbImageUrl }

export default {
  herb: herbApi,
  quiz: quizApi,
  match: matchApi,
  constitution: constitutionApi,
  checkin: checkinApi,
  identify: identifyApi,
  auth: authApi,
  chat: chatApi,
  llmConfig: llmConfigApi,
  favorite: favoriteApi,
  wrongQuestion: wrongQuestionApi,
  review: reviewApi,
  feedback: feedbackApi,
  getImageUrl
}
