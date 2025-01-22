import { ref, reactive } from 'vue'
import { cloneDeep } from 'lodash'
import { useRequest } from 'vue-request'
import dayjs from 'dayjs'

export interface ResponseData {
  code: string
  message: string
  data: {
    data_list: any[]
    total: number
    pages: number
  }
}

interface PageInfo {
  offset: number
  limit: number
  total: number
  pages?: number
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export default function <Params, D = any>(api: any, otherParams: Params, callback?: Function) {


  // 获取数据
  const { data, runAsync: runGetDateList, loading } = useRequest<ResponseData>(api, { throttleInterval: 0 })

  // 初始化查询数据
  type PageForm = PageInfo & Params
  const pageForm = reactive<PageForm>({ offset: 1, limit: 10, total: 0, ...otherParams })
  const initPageForm = cloneDeep(pageForm) //复制一份

  const dataList = ref<D[]>([])
  // 获取数据
  const getDataList = async (otherParams?: Partial<PageForm>) => {
    try {
      await runGetDateList(Object.assign(pageForm, otherParams))
      if (data.value?.data.data_list) {
        data.value?.data.data_list.forEach((item, index, arr) => {
          if (item.hasOwnProperty('create_time')) {
            arr[index].create_time = dayjs(arr[index].create_time).format('YYYY-MM-DD HH:mm:ss')
          }
        })
      }
      dataList.value = data.value?.data.data_list || []
      pageForm.total = data.value?.data.total || 0
      pageForm.pages = data.value?.data.pages || 0
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      callback && callback(data.value)

      // 当前页码数大于最大页码数时，重置页码数
      const maxOffset = Math.ceil(pageForm.total / pageForm.limit)
      if (maxOffset && pageForm.offset > maxOffset) {
        getDataList({ offset: maxOffset } as Partial<PageForm>)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const resetPageForm = () => {
    Object.assign(pageForm, initPageForm)
    getDataList()
  }

  return {
    loading,
    pageForm,
    dataList,
    getDataList,
    resetPageForm,
  }
}
