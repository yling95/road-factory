<template>
  <main-card :title="'人员列表'" :showPageTools="true">
    <template #Slot-Tools-Right>
      <a-button type="primary" class="creat-btn" @click="operatePerson('add')">新增人员</a-button>
    </template>
    <div class="order-list">
      <!-- 筛选 -->
      <div class="filter">
        <div class="filter-item">
          <a-input
            style="width: 239px"
            placeholder="用户名/手机号"
            @press-enter="handleSearch"
            @change="!pageForm.search && handleSearch()"
            v-model:value="pageForm.search"
            allowClear
          >
            <template #prefix>
              <i class="iconfont icon-search-line"></i>
            </template>
          </a-input>
        </div>
        <div class="filter-item">
          <a-select
            style="width: 160px"
            v-model:value="pageForm.role"
            :options="Person_Types"
            placeholder="用户类型"
            @change="handleSearch"
            allow-clear
            :showSearch="false"
            showArrow
          >
          </a-select>
        </div>
      </div>

      <!-- 表格 -->
      <div class="table-wrap">
        <a-table
          :columns="columns"
          :loading="loading"
          :dataSource="dataList"
          :pagination="{
            total: pageForm.total,
            current: pageForm.page,
            pageSize: pageForm.limit,
            showTotal: (total: number) => `共${total}条记录`,
            showSizeChanger: true,
            size: 'small',
          }"
        >
          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'operation'">
              <a-button type="link" @click.stop="operatePerson('edit', record)">编辑</a-button>
              <a-button type="link" @click.stop="handUserOperate('delete', record)">删除</a-button>
              <a-button type="link" @click.stop="handUserOperate('resetPwd', record)"
                >重置密码</a-button
              >
            </div>
            <div v-if="column.key === 'role'">
              {{ findLabelByValue(Person_Types, record.role) }}
            </div>
          </template>
        </a-table>
      </div>
    </div>
  </main-card>
  <a-modal
    v-model:open="personFormModalOpen"
    :title="formState?.id ? `编辑用户（${formState.account}）` : '新增用户'"
    :ok-button-props="{
      loading: formLoading || updateUserInfoLoading,
    }"
    @ok="personFormOk"
    :mask-closable="false"
    @cancel="personFormCancel"
  >
    <a-form
      class="person-form"
      :label-col="{ style: { width: '120px' } }"
      :model="formState"
      ref="formRef"
      :rules="formRules"
    >
      <a-form-item label="人员类型" name="role">
        <a-select
          :options="Person_Types"
          v-model:value="formState.role"
          placeholder="请选择人员类型"
        ></a-select>
      </a-form-item>
      <a-form-item label="姓名" name="real_name">
        <a-input placeholder="请输入姓名" v-model:value="formState.real_name"></a-input>
      </a-form-item>
      <a-form-item label="手机号" name="account">
        <a-input placeholder="请输入手机号" v-model:value="formState.account"></a-input>
      </a-form-item>
    </a-form>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import { useRequest } from 'vue-request'
import useList from '@/hooks/useList'
import type { RuleObject } from 'ant-design-vue/es/form/interface'
import { userApi } from '@/services/api'
import { Person_Types } from '../baseData'
import { message, Modal } from 'ant-design-vue'
import { findLabelByValue } from '@/utils/common'

interface userType {
  role: string | undefined
  account: string | number
  password: string
  real_name?: string
  id?: string
}

// 表格结构
const columns = ref([
  {
    title: '用户名',
    dataIndex: 'real_name',
    key: 'real_name',
    width: 100,
  },
  {
    title: '手机号',
    dataIndex: 'account',
    key: 'account',
    width: 150,
  },
  {
    title: '用户类型',
    dataIndex: 'role',
    key: 'role',
    width: 150,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 120,
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 220,
  },
])

// 表单
const formRef = ref()
const formState = ref<userType>({
  role: undefined,
  real_name: '',
  account: '',
  password: '123456',
})
const phoneRegex = /^1[3-9]\d{9}$/
const formRules = ref<{ [key: string]: RuleObject[] }>({
  role: [{ required: true, message: '请选择用户角色', trigger: 'blur' }],
  real_name: [{ required: true, message: '请输入用户姓名', trigger: 'blur' }],
  account: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    {
      pattern: phoneRegex,
      message: '手机号格式不正确',
      trigger: 'blur',
    },
  ],
})

const { loading: formLoading, runAsync: runAdd } = useRequest(userApi.addUser)
const { loading: updateUserInfoLoading, runAsync: runUpdateUserInfo } = useRequest(
  userApi.updateUserInfo,
)
const { loading: deleteLoading, runAsync: runDelete } = useRequest(userApi.deleteUser)
const { loading: UpdatePasswordLoading, runAsync: runUpdatePassword } = useRequest(userApi.resetPwd)

const personFormModalOpen = ref(false)
const personFormModalType = ref<'add' | 'edit'>('add')
const operateItem = ref<userType | null>()

// 新增、编辑用户
const operatePerson = async (type: 'add' | 'edit', item?: any) => {
  if (type === 'edit') {
    const res = await userApi.getUserInfo(item.account)
    formState.value = { ...res.data }
    operateItem.value = item
  }
  personFormModalType.value = type
  personFormModalOpen.value = true
}

const personFormOk = () => {
  formRef.value.validate().then(async () => {
    let res
    if (personFormModalType.value === 'add') {
      res = await runAdd(formState.value)
    } else {
      res = await runUpdateUserInfo(operateItem.value?.account, formState.value)
    }
    if (res?.code === 0) {
      personFormModalOpen.value = false
      formRef.value.resetFields()
      if (personFormModalType.value === 'add') {
        message.success('新增用户成功')
      }
      if (personFormModalType.value === 'edit') {
        message.success('编辑用户成功')
      }
      getDataList()
    }
  })
}
const personFormCancel = () => {
  formRef.value.resetFields()
}

// 用户操作
const handUserOperate = async (type: 'delete' | 'resetPwd', item: any) => {
  console.log('操作', type, item)
  switch (type) {
    case 'delete':
      Modal.confirm({
        content: `确认删除用户（${item.account}）`,
        okText: '确认',
        okButtonProps: {
          loading: deleteLoading.value,
        },
        onOk: () => {
          return new Promise(async function (resolve) {
            const res = await runDelete(item.account)
            if (res) {
              message.success(`用户（${item.account}）删除成功`)
              getDataList()
              resolve(true)
            }
          })
        },
        cancelText: '取消',
      })
      break

    case 'resetPwd':
      Modal.confirm({
        content: `确认重置用户（${item.account}）密码？`,
        okText: '重置',
        okButtonProps: {
          loading: UpdatePasswordLoading.value,
        },
        onOk: () => {
          return new Promise(async function (resolve) {
            const res = await runUpdatePassword(item.account)
            console.log('删除用户相应', res)
            message.success(`用户（${item.account}）密码重置成功`)
            getDataList()
            resolve(true)
          })
        },
        cancelText: '取消',
      })
      break

    default:
      break
  }
}

// 查询
const handleSearch = () => {
  if (pageForm.search === '') {
    pageForm.search = undefined
  }
  getDataList({ ...pageForm, page: 1 })
}

const { dataList, getDataList, loading, pageForm } = useList(
  userApi.userList,
  {
    search: undefined,
    role: undefined,
  },
  () => {
    console.log('获取列表', dataList.value)
  },
)
onMounted(() => {
  getDataList()
})
</script>

<style scoped lang="less">
.creat-btn {
  height: 42px;
  font-size: 15px;
  font-weight: 600;
}
.filter {
  padding: 12px 0;
  display: flex;
  gap: 16px;
}
.table-wrap {
  padding: 20px 0;
}
.table-operation {
  :deep(.ant-btn) {
    padding: 0;
  }
}
.person-form {
  padding: 24px 0;
  width: 400px;
}
</style>
