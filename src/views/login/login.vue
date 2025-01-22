<template>
  <div class="login-page">
    <div class="left">
      <img src="@/assets/images/login/loginBg.png" />
    </div>
    <div class="right">
      <div>
        <div class="title">
          <div class="welcome">欢迎使用</div>
          <div class="system">
            <span class="company-name">大路通</span>
            <span class="system-name">订单管理系统</span>
          </div>
        </div>
        <div class="content">
          <div class="form">
            <a-input
              placeholder="请输入账号"
              :bordered="true"
              :maxlength="11"
              v-model:value.trim="formState.account"
              class="login-input"
            />
            <a-input-password
              placeholder="请输入密码"
              :bordered="true"
              v-model:value.trim="formState.password"
              :maxlength="40"
              v-model:visible="passwordVisible"
              class="login-input"
            />
            <span class="forget" @click="forgetPassword">忘记密码？</span>
            <a-button
              class="login-btn"
              type="primary"
              @click="login"
              :loading="loading || loadingTwo"
              >登录
              <i class="ri-arrow-right-line right-icon"></i>
            </a-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import { Modal } from 'ant-design-vue'
import { useRequest } from 'vue-request'
import { userApi } from '@/services/api'
import { useUserStore } from '@/stores/user'
import router from '@/router'

const userStore = useUserStore()

const passwordVisible = ref(false)
const formState = reactive({
  account: 'admin',
  password: '123456',
})
const forgetPassword = () => {
  Modal.confirm({
    content: '忘记密码，请联系管理员进行重置密码！',
    okText: '确认',
    cancelText: '取消',
  })
}

const { loading, runAsync: runLogin } = useRequest(userApi.login)
const { loading: loadingTwo, runAsync: runGetUserInfo } = useRequest(userApi.getUserInfo)
const login = async () => {
  try {
    console.log('登录参数', formState)

    const { data } = await runLogin(formState)
    userStore.updateToken(data.token)
    // userStore.updateUserInfo(data)
    if (data.token) {
      const res = await runGetUserInfo(formState.account)
      console.log('获取用户信息', res)
      if (res.data) {
        userStore.updateUserInfo(res.data)
        router.replace('/')
      }
    }

    console.log('登录', formState)
  } catch (error: any) {
    console.log('登录失败', error)
  }
}
</script>

<style scoped lang="less">
.login-page {
  width: 100vw;
  height: 100vh;
  display: flex;
  box-sizing: border-box;
  justify-content: space-between;
  .left {
    img {
      width: auto;
      height: 100%;
      display: block;
    }
  }
  .right {
    flex: 1;
    min-width: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    .title {
      font-size: 36px;
      text-align: center;
      margin-bottom: 40px;
      .welcome {
        font-weight: 200;
        color: #4d5057;
        line-height: 52px;
      }
      .system {
        line-height: 52px;
        .company-name {
          color: #fa9200;
          margin-bottom: 12px;
        }
        .system-name {
          color: #4d5057;
        }
      }
    }
    .content {
      .form {
        width: 400px;
        :deep(.ant-input-affix-wrapper) {
          border-color: @background2;
          &-focused {
            border-color: @primary1;
          }
          .ant-input {
            background-color: @background2;
          }
        }
        :deep(.ant-input) {
          border-color: @background2;
          &:focus {
            border-color: @primary1;
          }
        }
        .login-input {
          border-radius: 34px;
          background-color: @background2;
          padding: 22px 24px;
          box-sizing: border-box;
          height: 68px;
          font-size: 16px;
          width: 100%;
          margin-bottom: 32px;
        }
        .forget {
          margin-top: 32px;
          font-size: 14px;
          cursor: pointer;
          color: @text2;
        }
        .login-btn {
          display: block;
          width: 100%;
          height: 68px;
          margin-top: 40px;
          font-size: 18px;
          position: relative;
          border-radius: 34px;
          .right-icon {
            position: absolute;
            right: 16px;
            color: #fff;
            font-weight: 200;
            font-size: 20px;
          }
        }
      }
    }
  }
}
</style>
