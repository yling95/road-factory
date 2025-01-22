import axios from '@/request/index'
import { type AxiosRequestConfig } from 'axios'

export const commonApi = {
  uploadFile: (file: FormData, config?: AxiosRequestConfig<any> | undefined) =>
    axios.post('/media/upload', file, {
      timeout: 1000 * 60 * 30,
      headers: { 'Content-Type': 'multipart/form-data', cancelable: false },
      ...config,
    }),
  getAllEnums: () => axios.get('/enum/all_enums')
}
/**
 * 用户接口
 */
export const userApi = {
  login: (params: any) => axios.post('/user/login', params),
  logout: (params: any) => axios.post('/user/logout', params),
  getUserInfo: (account: string | number) => axios.get(`/user/profile/${account}`),
  addUser: (params: any) => axios.post('/user/register', params),
  updateUserInfo: (account: string | number, params: any) => axios.put(`/user/profile/${account}`, { ...params }),
  updatePassword: (account: string | number, params: any) => axios.put(`/user/${account}/pwd`, params),
  resetPwd: (account: string | number) => axios.post(`/user/${account}/reset_pwd`),
  deleteUser: (account: string | number) => axios.delete(`/user/${account}`),
  userList: (params: any) => axios.get(`/user/users`, { params }),
}

export const orderApi = {
  create: (params: any) => axios.post('/order/create', params),
  accept: (orderNum: any, params: any) => axios.post(`/order/${orderNum}/accept`, params),
  productDone: (orderNum: any, params: any) => axios.post(`/order/${orderNum}/production_done`, params),
  productStatus: (orderNum: any, params: any) => axios.post(`/order/${orderNum}/status`, params),
  productBatchStatus: (params: any) => axios.post(`/order/batch_status`, params),
  rollback: (orderNum: any) => axios.post(`/order/${orderNum}/rollback`),
  deliveryInfo: (orderNum: any, params: any) => axios.put(`/order/${orderNum}/delivery_info`, params),
  outboundVerify: (orderNum: any, params: any) => axios.post(`/order/${orderNum}/outbound_verify`, params),
  delete: (orderNum: string | number) => axios.delete(`/order/${orderNum}`),
  oderList: (params: string | number) => axios.get(`/order/orders`, { params }),
  detail: (orderNum: string | number) => axios.get(`/order/profile/${orderNum}`),
  outStatistics: (params: string | number) => axios.get(`/order/outbound_statistics`, { params }), // 出库统计
  flow: (orderNum: string | number) => axios.get(`/order/${orderNum}/flow`),
  statusStatistics: () => axios.get(`/order/status_statistics`), //订单数量统计
  logisticsStatistics: () => axios.get(`/order/logistics_statistics`), //订单物流统计
  urgentOrders: () => axios.get(`/order/urgent_orders`), // 加急订单
  normalOrders: () => axios.get(`/order/normal_orders`), // 正常订单
  waitOuteOrders: () => axios.get(`/order/wait_outbound_orders`), //待出库订单
  selfPickupOrders: () => axios.get(`/order/self_pickup_orders`), // 自提订单
  getLogisticsPrinNum: (orderNum: string | number) => axios.get(`/order/${orderNum}/logistics_print_num`) // 获取物流打印编号
}

export const localConversionApi = {
  getList: (params: any) => axios.get('/ai/local-data-convert/jobs', { params }), //分页查询
  startTask: (id: number) => axios.get('/ai/local-data-convert/job/start', { params: { jobId: id } }), //根据任务id开始任务
  stopTask: (id: number) => axios.put('/ai/local-data-convert/job/stop', null, { params: { jobId: id } }), //终止任务
  createTask: (params: any) => axios.post('/ai/local-data-convert/job', params), //创建任务
  deleteTask: (id: number) => axios.delete(`/ai/local-data-convert/job`, { params: { jobId: id } }), //根据任务id删除任务
  getDetail: (params: any) => axios.get(`/ai/local-data-convert/job/results`, { params }), //查询任务本地数据转换详情

  deleteFile: (id: string, fileName?: string) =>
    axios.delete(`/ai/local-data-convert/job/src`, { params: { dataSrcId: id, srcFileName: fileName } }),
  uploadFile: (dataSrcId: string, file: FormData, config?: AxiosRequestConfig<any> | undefined) =>
    axios.post('/ai/local-data-convert/upload', file, {
      params: { dataSrcId },
      timeout: 1000 * 60 * 30,
      headers: { 'Content-Type': 'multipart/form-data', cancelable: false },
      ...config,
    }),

  // 导出准备
  exportPrepare: (params: any) => axios.post('/dataConvertExport/exportPrepare', params),
  // 列表查询
  getExportList: (params: any) => axios.get('/dataConvertExport/list', { params }),
  //批量删除导出任务
  deleteExport: (params: any) => axios.delete(`/dataConvertExport/deleteBatchByIds`, { params }),
  //下载
  downloadExport: (params: any) => axios.get('/dataConvertExport/download', { params }),
}
