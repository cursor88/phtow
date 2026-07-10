const formatDate = (date, fmt = 'YYYY-MM-DD') => {
  if (!date) return ''
  const d = new Date(date)
  const o = {
    'M+': d.getMonth() + 1,
    'D+': d.getDate(),
    'h+': d.getHours(),
    'm+': d.getMinutes(),
    's+': d.getSeconds(),
    'q+': Math.floor((d.getMonth() + 3) / 3),
    'S': d.getMilliseconds()
  }
  if (/(Y+)/.test(fmt)) {
    fmt = fmt.replace(RegExp.$1, (d.getFullYear() + '').substr(4 - RegExp.$1.length))
  }
  for (let k in o) {
    if (new RegExp('(' + k + ')').test(fmt)) {
      fmt = fmt.replace(RegExp.$1, (RegExp.$1.length === 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k]).length)))
    }
  }
  return fmt
}

const randomFromArray = (arr) => {
  if (!arr || arr.length === 0) return null
  return arr[Math.floor(Math.random() * arr.length)]
}

const shuffleArray = (arr) => {
  const newArr = [...arr]
  for (let i = newArr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[newArr[i], newArr[j]] = [newArr[j], newArr[i]]
  }
  return newArr
}

const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

const throttle = (func, limit) => {
  let inThrottle
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}

const storage = {
  set: (key, value) => {
    try {
      uni.setStorageSync(key, JSON.stringify(value))
    } catch (e) {
      console.error('storage set error:', e)
    }
  },
  get: (key, defaultValue = null) => {
    try {
      const value = uni.getStorageSync(key)
      return value ? JSON.parse(value) : defaultValue
    } catch (e) {
      console.error('storage get error:', e)
      return defaultValue
    }
  },
  remove: (key) => {
    try {
      uni.removeStorageSync(key)
    } catch (e) {
      console.error('storage remove error:', e)
    }
  },
  clear: () => {
    try {
      uni.clearStorageSync()
    } catch (e) {
      console.error('storage clear error:', e)
    }
  }
}

const showLoading = (title = '加载中...') => {
  uni.showLoading({
    title,
    mask: true
  })
}

const hideLoading = () => {
  uni.hideLoading()
}

const showToast = (title, icon = 'none') => {
  uni.showToast({
    title,
    icon,
    duration: 2000
  })
}

export default {
  formatDate,
  randomFromArray,
  shuffleArray,
  debounce,
  throttle,
  storage,
  showLoading,
  hideLoading,
  showToast
}
