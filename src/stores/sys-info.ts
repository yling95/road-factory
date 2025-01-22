import { defineStore } from 'pinia'
import { ref } from 'vue'
export const useSysInfoStore = defineStore(
  'sysInfoStore',
  () => {
    const layoutInfo = ref({
      headerHeight: 44, //头部高度
      sideMenuWidth: 0 //侧边栏宽度
    })
    return { layoutInfo }
  },
  {
    persist: false //本地持久化存储
  }
)
