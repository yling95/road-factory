<template>
  <a-layout-header class="header">
    <div class="left">
      <img src="@/assets/logo.png" class="logo-img" alt="logo" />
      <div class="system">
        <span class="company-name">大路通</span>
        <span class="system-name">订单管理系统</span>
      </div>
    </div>
    <div class="right">
      <SvgIcon name="screen-icon" className="screen-icon" @click="gotoLargeScreen" />
      <a-dropdown placement="bottomRight" v-model:open="popoverOpen">
        <template #overlay>
          <a-menu>
            <a-menu-item @click="handleUpdatePassword">修改密码</a-menu-item>
            <a-menu-item @click="handleLogout">退出登录</a-menu-item>
          </a-menu>
        </template>
        <div class="person-box">
          <img
            class="user-img"
            src="@/assets/images/common/user.png"
            v-if="!userStore.userInfo.real_name"
          />
          <div class="user-name" v-else>{{ getFirstTwo(userStore.userInfo.real_name) }}</div>

          <SvgIcon name="arrow-down-s-line" v-if="!popoverOpen" className="down-icon" />
          <SvgIcon name="arrow-up-s-line" v-else className="down-icon" />
        </div>
      </a-dropdown>
    </div>
  </a-layout-header>
  <updatePassword ref="updatePasswordRef"></updatePassword>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useLogout } from '@/hooks/useUser'
import updatePassword from './update-password.vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const getFirstTwo = (str: string) => {
  return str.slice(0, 2)
}

const popoverOpen = ref(false)
const updatePasswordRef = ref()

const gotoLargeScreen = () => {
  router.push('/largeScreen')
}

const handleUpdatePassword = () => {
  console.log('修改密码')
  popoverOpen.value = false
  updatePasswordRef.value?.show()
}
// 退出登录
const { logout } = useLogout()
const handleLogout = () => {
  popoverOpen.value = false
  logout()
}

onMounted(() => {})
</script>

<style lang="less" scoped>
.header {
  background-color: #fff;
  box-shadow: 0px 2px 4px 0px #00000024;
  z-index: 1;
  padding: 8px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left {
    font-size: 20px;
    font-family: 'AlimamaFangYuan';
    font-weight: 700;
    display: flex;
    align-items: center;
    height: 52px;
    .logo-img {
      width: 86px;
    }
    .system {
      line-height: 52px;
      .company-name {
        color: #fa9200;
      }
      .system-name {
        color: #4d5057;
      }
    }
  }
  .right {
    display: flex;
    height: 52px;
    align-items: center;
    justify-content: center;
    .screen-icon {
      width: 28px;
      height: 28px;
      color: #535364;
      cursor: pointer;
      margin-right: 32px;
    }
    .person-box {
      display: flex;
      align-items: center;
      cursor: pointer;
      .user-img {
        width: 32px;
        height: 32px;
        margin-right: 4px;
      }
      .user-name {
        width: 34px;
        height: 34px;
        margin-right: 4px;
        text-align: center;
        font-size: 16px;
        line-height: 34px;
        background: @primary1;
        border-radius: 8px;
        color: #fff;
      }
      .down-icon {
        font-size: 18px;
        color: @text2;
      }
    }
  }
}
</style>
