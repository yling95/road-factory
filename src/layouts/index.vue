<template>
  <a-layout class="layout">
    <headerBar></headerBar>
    <a-layout>
      <left-menu />
      <a-layout class="content">
        <a-layout-content>
          <main class="main">
            <!-- <a-spin
              wrapper-class-name="app-spin"
              :spinning="globalStore.loadingOptions.type === 'stair' && globalStore.loading"
              :delay="globalStore.loadingOptions.delay"
              :tip="globalStore.loadingOptions.tip"
            > -->
            <router-view />
            <!-- </a-spin> -->
          </main>
        </a-layout-content>
      </a-layout>
    </a-layout>
  </a-layout>
</template>
<script lang="ts" setup>
import leftMenu from './_components/left-menu.vue'
import headerBar from './_components/header-bar.vue'
import { SSE } from '@/utils/SSE'
import { baseURL } from '@/request'
import { useUserStore } from '@/stores/user'
import { Modal } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { onUnmounted } from 'vue'
import type { UserType } from '../views/order/Types'

const router = useRouter()
// 角色对操作权限判断
const userStore = useUserStore()
const nowUserType: UserType = userStore.userInfo.role

const isSalesManage = nowUserType === 'salesman'
const isfactoryManage = nowUserType === 'factory'

// SSE
const sse = new SSE({
  messageCb: (message: any) => {
    userStore.updateSseMassageData(message)
    if (message.operation === 'create_order' && isfactoryManage) {
      Modal.confirm({
        content: '有新订单待接收,请前往接受',
        onOk: () => {
          router.push('/order/list')
        },
      })
    }
    if (message.operation === 'production_done' && isSalesManage) {
      Modal.confirm({
        content: '有订单完成，请前往填写收货信息',
        onOk: () => {
          router.push('/order/list')
        },
      })
    }
  },
})
// 建立连接
sse.selectAndLink(`${baseURL}/sse/connect`)
onUnmounted(() => {
  sse.closeLink()
})
</script>
<style scoped lang="less">
.layout {
  min-height: 100vh;
}
.slider {
  background: @background1;
}
.content {
  background: @background5;
  border-radius: 12px;
  height: calc(100vh - 64px);
  padding: 32px;
  overflow: auto;
  .main {
    height: 100%;
  }
}
</style>
