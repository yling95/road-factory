const TWO_DAY_MIN = 60 * 60 * 24 * 2

interface IConfig {
  type: 'localStorage' | 'sessionStorage'
  prefix: string
  expire: number
  isEncrypt: boolean
}

const config: IConfig = {
  type: 'localStorage', // 本地存储类型 localStorage/sessionStorage
  prefix: 'atp_1.0', // 名称前缀 建议：项目名 + 项目版本
  expire: TWO_DAY_MIN, //过期时间 单位：秒
  isEncrypt: true // 默认加密 为了调试方便, 开发过程中可以不加密
}

// 名称前自动添加前缀
const autoAddPrefix = (key: string): string => {
  const prefix = config.prefix ? config.prefix + '_' : ''
  return prefix + key
}

// 设置 setStorage
export const setStorage = (key: string, value: unknown, expire = TWO_DAY_MIN) => {
  const prefixKey = autoAddPrefix(key)
  if (value === '' || value === null || value === undefined) {
    value = null
  }

  if (isNaN(expire) || expire < 1) {
    throw new Error('Expire must be a number')
  }

  expire = (expire ? expire : config.expire) * 60000

  const data = {
    value: value, // 存储值
    time: Date.now(), //存值时间戳
    expire: expire // 过期时间
  }

  window[config.type].setItem(prefixKey, JSON.stringify(data))
}

// 删除 removeStorage
export const removeStorage = (key: string) => {
  const prefixKey = autoAddPrefix(key)
  window[config.type].removeItem(prefixKey)
}

// 获取 getStorage
export const getStorage = (key: string) => {
  const prefixKey = autoAddPrefix(key)

  // key 不存在判断
  if (!window[config.type].getItem(prefixKey) || JSON.stringify(window[config.type].getItem(prefixKey)) === 'null') {
    return null
  }

  // 优化 持续使用中续期
  const storage = JSON.parse(window[config.type].getItem(prefixKey) || '')
  const nowTime = Date.now()
  // 过期删除
  if (storage.expire && config.expire * 6000 < nowTime - storage.time) {
    removeStorage(prefixKey)
    return null
  } else {
    // 未过期期间被调用 则自动续期 进行保活
    setStorage(key, storage.value)
    return storage.value
  }
}

// 获取全部 getAllStorage
export const getAllStorage = () => {
  const len = window[config.type].length // 获取长度
  const arr = [] // 定义数据集
  for (let i = 0; i < len; i++) {
    // 获取key 索引从0开始
    const getKey: string = window[config.type].key(i) || ''
    // 获取key对应的值
    const getVal = window[config.type].getItem(getKey)
    // 放进数组
    arr[i] = { key: getKey, val: getVal }
  }
  return arr
}

// 清空 clearStorage
export const clearStorage = () => {
  window[config.type].clear()
}

export default {
  get: getStorage,
  set: setStorage,
  remove: removeStorage,
  getAll: getAllStorage,
  clear: clearStorage
}
