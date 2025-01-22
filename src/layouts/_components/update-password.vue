<template>
  <a-modal
    v-model:open="updatePassWordOpen"
    title="修改密码"
    :mask-closable="false"
    @ok="confirm"
    :ok-button-props="{ loading: loading }"
    @cancel="cancelFixed"
  >
    <a-form
      :rules="resetRules"
      :model="formState"
      class="pwd-form"
      ref="formRef"
      :label-col="{ style: { width: '120px' } }"
    >
      <a-form-item label="旧密码" name="old_password">
        <a-input-password
          :maxlength="20"
          size="large"
          placeholder="请输入旧密码"
          v-model:value.trim="formState.old_password"
          autocomplete="off"
          @keyup="formState.old_password = formState.old_password.replace(/\s+/g, '')"
        />
      </a-form-item>
      <a-form-item label="新密码" name="new_password" validate-first>
        <a-input-password
          :maxlength="20"
          size="large"
          placeholder="请输入新密码"
          v-model:value.trim="formState.new_password"
          autocomplete="off"
          @keyup="formState.new_password = formState.new_password.replace(/\s+/g, '')"
        />
      </a-form-item>
      <a-form-item label="确认新密码" name="confirm_password" validate-first>
        <a-input-password
          :maxlength="20"
          size="large"
          placeholder="再次输入新密码"
          v-model:value.trim="formState.confirm_password"
          autocomplete="off"
          @keyup="formState.confirm_password = formState.confirm_password.replace(/\s+/g, '')"
        />
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive } from 'vue'
import type { Rule } from 'ant-design-vue/es/form/interface'
import { useUserStore } from '@/stores/user'
import { userApi } from '@/services/api'
import { useRequest } from 'vue-request'
import { message } from 'ant-design-vue'
import router from '@/router'
import { useClearCache } from '@/hooks/useUser'
const { clear } = useClearCache()

const userStore = useUserStore()

console.log('用户', userStore.userInfo)

const updatePassWordOpen = ref(false)
const formRef = ref()

const formState = reactive({
  old_password: '',
  new_password: '',
  confirm_password: '',
})

const createLengthReg = (min: number, max: number) => {
  return new RegExp(`^[\\s\\S]{${min},${max}}$`)
}

const passwordValidator = (_rule: Rule, value: string) => {
  if (!value.trim()) {
    return Promise.reject('请输入密码')
  }
  if (!createLengthReg(6, 20).test(value)) {
    return Promise.reject('密码长度必须是8-20位字符')
  }
  return Promise.resolve()
}

const validateAckPWS = async () => {
  if (formState.confirm_password === '') {
    return Promise.reject('请确认密码')
  }
  if (formState.new_password !== formState.confirm_password) {
    return Promise.reject('两次输入内容不一致')
  }
  return Promise.resolve()
}

const resetRules: Record<string, Rule[]> = {
  old_password: [
    {
      required: true,
      message: '请输入旧密码',
      trigger: 'blur',
    },
    {
      pattern: createLengthReg(6, 20),
      message: '密码长度必须是8-20位字符',
      trigger: 'blur',
    },
  ],
  new_password: [
    {
      validator: (_rule: Rule, value: string) => {
        return passwordValidator(_rule, value)
      },
      trigger: 'blur',
    },
  ],
  confirm_password: [
    {
      validator: validateAckPWS,
      trigger: 'blur',
    },
  ],
}

const { loading, runAsync: runUpdatePassword } = useRequest(userApi.updatePassword)
const confirm = () => {
  formRef.value.validate().then(async () => {
    const res = await runUpdatePassword(userStore.userInfo.account, formState)
    message.success('操作成功')
    formRef.value.resetFields()
    updatePassWordOpen.value = false
    setTimeout(() => {
      clear()
      router.replace('/login')
    }, 500)
    console.log('修改密码响应', res)
  })
}

const cancelFixed = () => {
  formRef.value.resetFields()
}
const show = () => {
  updatePassWordOpen.value = true
}

defineExpose({ show })
</script>

<style scoped lang="less">
.pwd-form {
  padding: 32px;
}
</style>
