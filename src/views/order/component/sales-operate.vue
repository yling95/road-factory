<template>
  <div class="sales-operate">
    <a-modal
      v-model:open="modalOpen"
      :title="modalTitle"
      :width="650"
      :centered="formState.outbound_type === 'logistics'"
      @ok="handleOk"
      @cancel="handleClose"
      :ok-button-props="{
        loading: loadingDeliveryInfo,
      }"
      :mask-closable="false"
    >
      <a-form
        ref="formRef"
        v-if="nowOperateType === 'receiveInfo'"
        class="accept-modal"
        :model="formState"
        :label-col="{ style: { width: '120px' } }"
      >
        <div class="min-title">出货信息：</div>
        <a-form-item
          label="取货方式"
          name="outbound_type"
          :rules="[{ required: true, message: '请选择取货方式' }]"
        >
          <a-select
            placeholder="请选择取货方式"
            v-model:value="formState.outbound_type"
            @change="outTypeChange"
            :options="Shipment_Types"
          ></a-select>
        </a-form-item>
        <a-form-item
          label="发货仓"
          :name="['details', 'warehouse']"
          :rules="[{ required: true, message: '请选择发货仓' }]"
        >
          <a-select
            placeholder="请选择发货仓"
            :options="Store_Base"
            allow-clear
            v-model:value="formState.details.warehouse"
            :filterOption="filterOption"
            show-search
          ></a-select>
        </a-form-item>
        <div v-if="formState.outbound_type === 'self_pickup'">
          <a-form-item
            label="车牌号"
            :name="['details', 'license_plate']"
            :rules="[
              { required: formState.outbound_type === 'self_pickup', message: '请输入车牌号' },
            ]"
          >
            <a-input
              placeholder="请输入车牌号"
              :maxlength="10"
              v-model:value.trim="formState.details.license_plate"
              @keyup="
                formState.details.license_plate = formState.details.license_plate.replace(
                  /\s+/g,
                  '',
                )
              "
            />
          </a-form-item>
          <a-form-item label="备注" name="remarks">
            <a-textarea placeholder="备注" v-model:value="formState.remarks" />
          </a-form-item>
        </div>
        <div v-else>
          <a-form-item
            label="物流公司"
            :name="['details', 'logistics_company']"
            :rules="[
              { required: formState.outbound_type === 'logistics', message: '请选择物流公司' },
            ]"
          >
            <a-select
              placeholder="请选择物流公司"
              :options="Logistics_Company"
              :filterOption="filterOption"
              show-search
              v-model:value="formState.details.logistics_company"
            ></a-select>
          </a-form-item>
          <div>
            <div class="min-title">收货人信息：</div>
            <a-form-item
              label="收货人姓名"
              :name="['details', 'recipient_name']"
              :rules="[
                { required: formState.outbound_type === 'logistics', message: '请输入收货人姓名' },
              ]"
            >
              <a-input
                placeholder="请输入收货人姓名"
                :maxlength="20"
                v-model:value="formState.details.recipient_name"
              />
            </a-form-item>
            <a-form-item
              label="收货人电话"
              :name="['details', 'recipient_phone']"
              :rules="[
                { required: formState.outbound_type === 'logistics', message: '请输入收货人电话' },
              ]"
            >
              <a-input
                placeholder="请输入收货人电话"
                :maxlength="15"
                v-model:value.trim="formState.details.recipient_phone"
              />
            </a-form-item>
            <a-form-item
              label="收货地址"
              :name="['details', 'delivery_address']"
              :rules="[
                { required: formState.outbound_type === 'logistics', message: '请输入收货地址' },
              ]"
            >
              <a-textarea
                placeholder="请输入收货地址"
                :auto-size="{ minRows: 2, maxRows: 5 }"
                :maxlength="200"
                v-model:value="formState.details.delivery_address"
              />
            </a-form-item>
          </div>
          <div>
            <div class="min-title">发货人信息：</div>
            <a-form-item
              label="发货人姓名"
              :name="['details', 'sender_name']"
              :rules="[
                { required: formState.outbound_type === 'logistics', message: '请输入发货人姓名' },
              ]"
            >
              <a-input
                placeholder="请输入发货人姓名"
                :maxlength="20"
                v-model:value.trim="formState.details.sender_name"
              />
            </a-form-item>
            <a-form-item
              label="发货人电话"
              :name="['details', 'sender_phone']"
              :rules="[
                { required: formState.outbound_type === 'logistics', message: '请输入发货人电话' },
              ]"
            >
              <a-input
                placeholder="请输入发货人电话"
                :maxlength="15"
                v-model:value.trim="formState.details.sender_phone"
              />
            </a-form-item>
            <a-form-item label="发货备注" name="remarks">
              <a-textarea placeholder="发货备注" v-model:value.trim="formState.remarks" />
            </a-form-item>
          </div>
        </div>
      </a-form>
    </a-modal>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, defineExpose } from 'vue'
import { type salesOperateTypes } from '../Types'
import { Logistics_Company, Shipment_Types, Store_Base } from '../../baseData'
import { Modal, message } from 'ant-design-vue'
import { orderApi } from '@/services/api'
import { useRequest } from 'vue-request'
// import { phoneNumberReg } from '@/utils/reg'

const emits = defineEmits(['getList'])
const formRef = ref()
const nowOperateType = ref<salesOperateTypes | undefined>('receiveInfo')
const nowOperateOrder = ref()
const modalTitle = ref<string>('')
const modalOpen = ref(false)

const formState = reactive({
  outbound_type: 'self_pickup',
  remarks: '',
  details: {
    license_plate: '', // 自提-车牌号
    logistics_company: undefined,
    delivery_address: '',
    sender_name: '',
    sender_phone: '',
    recipient_name: '',
    recipient_phone: '',
    warehouse: undefined,
  },
})

// 模糊匹配：根据用户输入（input）匹配选项的 label
const filterOption = (input: string, option: any) => {
  return option.label.toLowerCase().includes(input.toLowerCase())
}

const { loading: loadingChangeStatus, runAsync: runChangeStatus } = useRequest(
  orderApi.productStatus,
)

const { loading: loadingRollback, runAsync: runRollback } = useRequest(orderApi.rollback)
const { loading: loadingDelete, runAsync: runDelete } = useRequest(orderApi.delete)

const openModal = (type: salesOperateTypes, item: any) => {
  console.log('----', type, item)
  nowOperateType.value = type
  nowOperateOrder.value = item
  switch (type) {
    case 'receiveInfo':
      modalTitle.value = `${item.delivery_info ? '修改' : '填写'}收货信息（${item.order_number}）`
      modalOpen.value = true
      console.log('收货信息', item.delivery_info)
      if (item.delivery_info.details.license_plate) {
        // 如果有 license_plate 字段，则为自提
        formState.outbound_type = 'self_pickup'
        formState.details.license_plate = item.delivery_info.details.license_plate
        formState.details.warehouse = item.delivery_info.details.warehouse
      } else if (item.delivery_info.details.logistics_company) {
        // 如果有 logistics_company 字段，则为物流
        formState.outbound_type = 'logistics'
        formState.details = { ...item.delivery_info.details }
      }

      // 初始化备注
      formState.remarks = item.delivery_info.remarks

      break

    case 'urgency':
      Modal.confirm({
        content: `确认加急订单（${item.order_number}）`,
        okText: '确认',
        cancelText: '取消',
        okButtonProps: {
          loading: loadingChangeStatus.value,
        },
        onOk: async () => {
          return new Promise(async function (resolve) {
            const res = await runChangeStatus(item.order_number, { operation: 'urgent_order' })
            if (res) {
              message.success(`订单（${item.order_number}）加急成功`)
              resolve(true)
              emits('getList')
            }
          })
        },
      })
      break
    case 'back':
      Modal.confirm({
        content: `确认回退订单（${item.order_number}）`,
        okText: '确认',
        cancelText: '取消',
        okButtonProps: {
          loading: loadingRollback.value,
        },
        onOk: async () => {
          return new Promise(async function (resolve) {
            const res = await runRollback(item.order_number)
            if (res) {
              message.success(`订单（${item.order_number}）回退成功`)
              resolve(true)
              emits('getList')
            }
          })
        },
      })
      break
    case 'cancel':
      Modal.confirm({
        content: `确认删除订单（${item.order_number}）`,
        okText: '确认',
        cancelText: '取消',
        okButtonProps: {
          loading: loadingDelete.value,
        },
        onOk: async () => {
          return new Promise(async function (resolve) {
            const res = await runDelete(item.order_number)
            if (res) {
              message.success(`订单（${item.order_number}）删除成功`)
              resolve(true)
              emits('getList')
            }
          })
        },
      })
      break
    case 'pause':
      Modal.confirm({
        content: `确认${item.pause ? '继续' : '暂停'}订单（${item.order_number}）`,
        okText: '确认',
        cancelText: '取消',
        okButtonProps: {
          loading: loadingChangeStatus.value,
        },
        onOk: async () => {
          return new Promise(async function (resolve) {
            const res = await runChangeStatus(item.order_number, {
              operation: item.pause ? 'resume_order' : 'suspend_order',
            })
            if (res) {
              message.success(`订单（${item.order_number}）${item.pause ? '继续' : '暂停'}成功`)
              resolve(true)
              emits('getList')
            }
          })
        },
      })
      break

    // case 'outStore':
    //   modalTitle.value = `订单出库（12224556）`
    //   modalOpen.value = true
    //   break

    default:
      break
  }
}
// 切换提货方式，重置表单
const outTypeChange = (val: any) => {
  formRef.value.resetFields()
  initFormData()
  formState.outbound_type = val
}
// 初始化表单数据
const initFormData = () => {
  formState.outbound_type = 'self_pickup'
  formState.remarks = ''
  formState.details = {
    license_plate: '',
    logistics_company: undefined,
    delivery_address: '',
    sender_name: '',
    sender_phone: '',
    recipient_name: '',
    recipient_phone: '',
    warehouse: undefined,
  }
}

const handleClose = () => {
  formRef.value.resetFields()
  modalOpen.value = false
}

const { loading: loadingDeliveryInfo, runAsync: runDeliveryInfo } = useRequest(
  orderApi.deliveryInfo,
)

// 创建提交的数据（动态处理 details 字段）
const createSubmitData = (formData: any) => {
  const { outbound_type, remarks, details } = formData

  let detailsForSubmission = { ...details }

  if (outbound_type === 'self_pickup') {
    // 只保留 license_plate 字段
    detailsForSubmission = { license_plate: details.license_plate, warehouse: details.warehouse }
  } else {
    // 移除 license_plate 字段
    const { license_plate, ...restDetails } = details
    detailsForSubmission = restDetails
  }

  // 返回处理后的数据
  return {
    outbound_type,
    remarks,
    details: detailsForSubmission,
  }
}

const handleOk = () => {
  console.log('确认收货地址')
  formRef.value.validate().then(async () => {
    const paramsData = createSubmitData(formState)
    console.log('参数', paramsData)
    const res = await runDeliveryInfo(nowOperateOrder.value.order_number, paramsData)
    console.log('响应', res)
    message.success('收货地址填写成功')
    handleClose()
    emits('getList')
  })
}
defineExpose({
  openModal,
})
</script>

<style scoped lang="less">
.accept-modal {
  padding: 32px 24px 0 44px;
  font-size: 16px;
  // width: 450px;
  .send-form {
    display: flex;
  }
  .min-title {
    font-weight: bold;
    color: @text1;
    padding: 2px;
    padding-left: 8px;
    position: relative;
    margin-bottom: 8px;
    &::after {
      width: 2px;
      height: 100%;
      background-color: @primary1;
      content: '';
      display: block;
      position: absolute;
      left: 0;
      top: 0;
    }
  }
}
</style>
