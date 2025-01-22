<template>
  <a-layout-sider class="slider" :collapsed="collapsed">
    <a-menu ref="antMenuRef" v-model:selectedKeys="current" mode="inline" class="left-menu">
      <a-menu-item :key="'/workbench'" @click="go('/workbench')">
        <template #icon><i class="menu-icon ri-macbook-fill"></i></template>
        <span>工作台</span>
        <!-- </span> -->
      </a-menu-item>
      <a-sub-menu v-for="menu in menuData" :key="menu.url">
        <template #icon>
          <i :class="['menu-icon', menu.icon]"></i>
        </template>
        <template #title>
          <span>
            <span>{{ menu.name }}</span>
          </span>
        </template>
        <a-menu-item v-for="menuTwo in menu.children" :key="menuTwo.url" @click="go(menuTwo.url)">{{
          menuTwo.name
        }}</a-menu-item>
      </a-sub-menu>
      <a-button type="text" class="collapsed-btn" @click="toggleCollapsed">
        <i class="ri-menu-unfold-line" v-if="collapsed"></i>
        <i class="ri-menu-fold-line" v-else></i>
      </a-button>
    </a-menu>
  </a-layout-sider>
</template>

<script setup lang="ts">
import { useEventListener, useResizeObserver } from '@vueuse/core'
import { debounce } from 'lodash'
import { useUserStore } from '@/stores/user'
import { nextTick, onMounted, ref, watch } from 'vue'
import { onBeforeRouteUpdate, type RouteRecordRaw, useRoute, useRouter } from 'vue-router'

import { checkKey } from '@/directives/auth'
import { useSysInfoStore } from '@/stores/sys-info'
const router = useRouter()
const route = useRoute()
const { layoutInfo } = useSysInfoStore()
const userStore = useUserStore()

const menuData = ref([
  {
    url: '/order-manage',
    name: '订单管理',
    icon: 'ri-survey-fill',
    children: [
      { url: '/order/list', name: '订单列表' },
      { url: '/order/outbound-statistics', name: '出库统计' },
    ],
  },
])

const go = (url: string) => {
  router.push(url)
}

// TODO:监听菜单宽度变化
const antMenuRef = ref(null)
const menuWidth = ref(0) //菜单宽度
useResizeObserver(antMenuRef, (entries) => {
  const entry = entries[0]
  const { width } = entry.contentRect
  menuWidth.value = width
  layoutInfo.sideMenuWidth = width
})

// TODO:菜单收起逻辑
const collapsed = ref(false)
const toggleCollapsed = () => {
  collapsed.value = !collapsed.value
}
const getShortPath = (path = '', length = 2) => {
  const pathArr = path.split('/')
  return pathArr.slice(0, length + 1).join('/')
}
const current = ref<string[]>([getShortPath(route.path, 2)])

onBeforeRouteUpdate((to) => {
  current.value = [to.fullPath]
})

// 监听窗口变化,避免频繁调用，开启了防抖
const watchWindowSize = debounce(() => {
  // 获取窗口的宽度和高度，不包括滚动条
  const w = document.documentElement.clientWidth
  // 小于1440收起菜单
  collapsed.value = w < 1440
}, 200)

useEventListener(window, 'resize', watchWindowSize)

onMounted(() => {
  if (
    userStore.userInfo.role === 'admin' &&
    menuData.value.filter((item) => item.url === '/person-manage').length === 0
  ) {
    menuData.value.push({
      url: '/person-manage',
      name: '人员管理',
      icon: 'ri-user-fill',
      children: [{ url: '/person/list', name: '人员列表' }],
    })
  }
  watchWindowSize()
})
</script>

<style lang="less" scoped>
.left-menu {
  background-color: @background1;
  .menu-icon {
    font-size: 16px;
  }
}
.collapsed-btn {
  position: absolute;
  bottom: 28px;
  left: 24px;
  z-index: 10;
  padding: 0;
  width: 18px;
  height: 18px;
  font-size: 18px;
  color: @text2;
  background-color: transparent;
  border: none !important;
  border-radius: 0;
  cursor: pointer;
  transform: none;
}
</style>
