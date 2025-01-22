declare interface ConfigOptions {
  apiHost: string
  GBizId: string
}
const ConfigOptions: ConfigOptions = {
  // apiHost: 'http://192.168.7.108:9901'
  apiHost: 'http://10.168.1.47:30943', //测试环境
  GBizId: 'management' // 平台
}

export default ConfigOptions
