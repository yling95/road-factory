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
  uploadLogisticsNum: (orderNum: any, params: any) => axios.put(`/order/${orderNum}/logistics_number`, params),
  licensePlateUpdate: (orderNum: any, params: any) => axios.put(`/order/${orderNum}/license_plate`, params),
  outboundVerify: (orderNum: any, params: any) => axios.post(`/order/${orderNum}/outbound_verify`, params),
  delete: (orderNum: string | number) => axios.delete(`/order/${orderNum}`),
  oderList: (params: string | number) => axios.get(`/order/orders`, { params }),
  detail: (orderNum: string | number) => axios.get(`/order/profile/${orderNum}`),
  outStatistics: (params: string | number) => axios.get(`/order/outbound_statistics`, { params }), // 出库统计
  flow: (orderNum: string | number) => axios.get(`/order/${orderNum}/flow`),
  statusStatistics: (params?: any) => axios.get(`/order/status_statistics`, {params}), //订单数量统计
  logisticsStatistics: (params: any) => axios.get(`/order/logistics_statistics`, {params}), //订单物流统计
  urgentOrders: (params: any) => axios.get(`/order/urgent_orders`, {params}), // 加急订单
  normalOrders: (params: any) => axios.get(`/order/normal_orders`, {params}), // 正常订单
  waitOuteOrders: (params: any) => axios.get(`/order/wait_outbound_orders`, {params}), //待出库订单
  selfPickupOrders: () => axios.get(`/order/self_pickup_orders`), // 自提订单
  getLogisticsPrinNum: (orderNum: string | number) => axios.get(`/order/${orderNum}/logistics_print_num`) // 获取物流打印编号
}
