const BASE_URL = 'http://localhost:3000/api'

const request = (options) => {
  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
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

export const constitutionApi = {
  getQuestions: (mode) => request({ url: `/constitution/questions?mode=${mode || 'standard'}` }),
  submit: (data) => request({ url: '/constitution/submit', method: 'POST', data }),
  getRecords: () => request({ url: '/constitution/records' }),
  getRecord: (id) => request({ url: `/constitution/record/${id}` }),
  deleteRecord: (id) => request({ url: `/constitution/record/${id}`, method: 'DELETE' }),
  getTypes: () => request({ url: '/constitution/constitution-types' })
}

export default {
  herb: herbApi,
  quiz: quizApi,
  match: matchApi,
  constitution: constitutionApi
}
