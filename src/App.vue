<template>
  <a-config-provider
    :locale="zhCN"
    :autoInsertSpaceInButton="false"
    :theme="{
      token: {
        colorPrimary: '#FA9200',
        fontSize: 16,
      },
    }"
  >
    <a-spin
      wrapper-class-name="app-spin"
      :spinning="globalStore.loadingOptions.type === 'global' && globalStore.loading"
      :delay="globalStore.loadingOptions.delay"
      :tip="globalStore.loadingOptions.tip"
    >
      <router-view />
    </a-spin>
  </a-config-provider>
</template>

<script setup lang="ts">
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import dayjs from 'dayjs'
import 'dayjs/locale/zh-cn'
import { useGlobalStore } from '@/stores/global'
import { message } from 'ant-design-vue'
import { onUnmounted, onMounted } from 'vue'
dayjs.locale('zh-cn')

const globalStore = useGlobalStore()
message.config({
  maxCount: 4,
  top: '56px',
})

const visibilitychange = () => {
  if (document.visibilityState === 'visible') {
    message.destroy()
  }
}
// 监听页面显示隐藏
document.addEventListener('visibilitychange', visibilitychange)
onUnmounted(() => {
  document.removeEventListener('visibilitychange', visibilitychange)
  // window.removeEventListener('resize', resize)
})

// onMounted(() => {
//   resize()
//   window.addEventListener('resize', resize)
// })
// const resize = () => {
//   const scale = window.innerWidth / 1920
//   document.documentElement.style.transform = `scale(${scale})`
//   document.documentElement.style.transformOrigin = 'top left'
// }
</script>
<style lang="less">
.app-spin {
  height: 100%;

  > div > .ant-spin {
    max-height: unset !important;
  }

  .ant-spin-blur {
    height: 100%;
  }

  .ant-spin-container {
    height: 100%;
  }
}
</style>
