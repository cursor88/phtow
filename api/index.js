const BASE_URL = 'http://localhost:8080/api'
const SERVER_ORIGIN = 'http://localhost:8080'

const PLACEHOLDER_HERB = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiB2aWV3Qm94PSIwIDAgMjAwIDIwMCI+PHJlY3Qgd2lkdGg9IjIwMCIgaGVpZ2h0PSIyMDAiIGZpbGw9IiNmMGZiZjYiLz48dGV4dCB4PSIxMDAiIHk9IjEwMCIgZm9udC1zaXplPSI2MCIgZmlsbD0iIzlkY2FhYiIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZG9taW5hbnQtYmFzZWxpbmU9Im1pZGRsZSI+8J+NtDwvdGV4dD48L3N2Zz4='

export const getImageUrl = (url) => {
  if (!url) return PLACEHOLDER_HERB
  if (url.startsWith('http')) return url
  if (url.startsWith('data:')) return url
  return SERVER_ORIGIN + encodeURI(url)
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
    uni.request({
      url: BASE_URL + options.url,
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
          uni.showToast({
            title: '网络错误',
            icon: 'none'
          })
          reject(res)
        }
      },
      fail: (err) => {
        uni.showToast({
          title: '网络连接失败',
          icon: 'none'
        })
        reject(err)
      }
    })
  })
}

const uploadFile = (filePath, url = '/herb/identify') => {
  return new Promise((resolve, reject) => {
    const token = getToken()
    const header = {}
    if (token) {
      header['Authorization'] = 'Bearer ' + token
    }
    uni.uploadFile({
      url: BASE_URL + url,
      filePath: filePath,
      name: 'image',
      header,
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
  getDetail: (id) => request({ url: `/herb/detail/${id}` }),
  getList: (params) => request({ url: '/herb/list', data: params }),
  getClassics: (id) => request({ url: `/herb/classics/${id}` }),
  getFoodMatch: (id) => request({ url: `/herb/food-match/${id}` })
}

export const quizApi = {
  getDailyQuestion: () => request({ url: '/quiz/daily' }),
  getRandomQuestion: () => request({ url: '/quiz/random' }),
  submitAnswer: (questionId, answer) => request({
    url: '/quiz/submit',
    method: 'POST',
    data: { questionId, answer }
  }),
  getList: (params) => request({ url: '/quiz/list', data: params })
}

export const matchApi = {
  getMatchList: (herbId) => request({ url: `/match/list?herbId=${herbId}` }),
  getMatchDetail: (id) => request({ url: `/match/detail/${id}` }),
  searchMatches: (keyword) => request({ url: `/match/search?keyword=${encodeURIComponent(keyword)}` })
}

export const checkinApi = {
  getDailyHerb: () => request({ url: '/checkin/daily-herb' }),
  checkin: (herbId) => request({ url: '/checkin/checkin', method: 'POST', data: { herbId } }),
  getRecords: () => request({ url: '/checkin/records' }),
  getCalendar: (year, month) => request({ url: `/checkin/calendar?year=${year}&month=${month}` }),
  getStats: () => request({ url: '/checkin/stats' })
}

export const identifyApi = {
  identify: (imagePath) => {
    return new Promise((resolve, reject) => {
      const token = getToken()
      const header = {}
      if (token) {
        header['Authorization'] = 'Bearer ' + token
      }
      uni.uploadFile({
        url: BASE_URL + '/herb/identify',
        filePath: imagePath,
        name: 'image',
        header,
        success: (res) => {
          try {
            const data = JSON.parse(res.data)
            if (data.code === 0) {
              resolve(data.data)
            } else {
              reject(new Error(data.message || '识别失败'))
            }
          } catch (e) {
            reject(e)
          }
        },
        fail: reject
      })
    })
  },
  addRecord: (data) => request({ url: '/identify/add', method: 'POST', data }),
  deleteRecord: (id) => request({ url: `/identify/delete/${id}`, method: 'POST' }),
  getRecords: (page, pageSize) => request({ url: `/identify/list?page=${page || 1}&pageSize=${pageSize || 20}` }),
  getStats: () => request({ url: '/identify/stats' })
}

export const constitutionApi = {
  getQuestions: (mode) => request({ url: `/constitution/questions?mode=${mode || 'standard'}` }),
  submit: (data) => request({ url: '/constitution/submit', method: 'POST', data }),
  getRecords: () => request({ url: '/constitution/records' }),
  getRecord: (id) => request({ url: `/constitution/record/${id}` }),
  getTypes: () => request({ url: '/constitution/constitution-types' })
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
  createSession: () => request({ url: '/chat/create', method: 'POST', data: {} }),
  sendMessage: (data) => request({ url: '/chat/message', method: 'POST', data }),
  continueChat: (data) => request({ url: '/chat/message', method: 'POST', data }),
  endSession: (sessionId) => request({ url: `/chat/end/${sessionId}`, method: 'POST' }),
  getSession: (sessionId) => request({ url: `/chat/session/${sessionId}` }),
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

export default {
  herb: herbApi,
  quiz: quizApi,
  match: matchApi,
  checkin: checkinApi,
  identify: identifyApi,
  constitution: constitutionApi,
  auth: authApi,
  chat: chatApi,
  llmConfig: llmConfigApi,
  favorite: favoriteApi,
  wrongQuestion: wrongQuestionApi,
  review: reviewApi,
  getImageUrl
}
