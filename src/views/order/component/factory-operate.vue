<template>
  <div class="factory-operate">
    <a-modal
      v-model:open="modalOpen"
      :title="modalTitle"
      @ok="handleOk"
      @cancel="handleClose"
      :mask-closable="false"
      :ok-button-props="{
        loading: formLoading || loadingFinish || loadingOutStore,
      }"
    >
      <a-form
        v-if="nowOperateType === 'accept'"
        class="accept-modal"
        ref="acceptFormRef"
        :model="acceptForm"
        :label-col="{ style: { width: '120px' } }"
      >
        <a-form-item label="产品图">
          <a-image
            :src="getImgUrlByUrl(nowOperateOrder.sample_img_url)"
            :height="180"
            :width="180"
            class="sample-img"
            alt=""
          />
        </a-form-item>

        <a-form-item
          label="预计出货日期"
          name="plan_time"
          :rules="[{ required: true, message: '请选择预计出货日期' }]"
        >
          <a-date-picker
            v-model:value="acceptForm.plan_time"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            :disabled-date="disabledDate"
          />
        </a-form-item>
      </a-form>
      <a-form
        v-if="nowOperateType === 'runEnd'"
        class="accept-modal"
        ref="finishFormRef"
        :model="finishForm"
        :label-col="{ style: { width: '120px' } }"
      >
        <a-form-item label="成品图" name="effect_url">
          <a-upload
            @preview="handlePreview"
            :file-list="fileList"
            :maxCount="5"
            @remove="removeFile"
            accept="image/*,video/*"
            :customRequest="customRequest"
            :before-upload="handleBeforeUpload"
          >
            <a-button class="upload-btn">
              <i class="ri-upload-2-line"></i>
              <p class="upload-text">上传成品图/视频</p>
            </a-button>
          </a-upload>
        </a-form-item>
      </a-form>
      <a-form
        v-if="nowOperateType === 'outStore'"
        class="accept-modal"
        ref="outStoreFormRef"
        :model="outStoreForm"
        :label-col="{ style: { width: '120px' } }"
      >
        <a-form-item label="出库方式">
          <span> {{ findLabelByValue(Shipment_Types, detailData?.outbound_type) }}</span>
        </a-form-item>

        <a-form-item label="收货信息">
          <span v-if="detailData.outbound_type === 'self_pickup'">川A12121</span>
          <a-button
            v-if="detailData.outbound_type === 'logistics'"
            @click="previewPrint"
            type="primary"
          >
            <i class="ri-printer-line"></i> 打印物流单</a-button
          >
        </a-form-item>

        <a-form-item
          label="出库证明"
          name="url"
          :rules="[
            {
              required: true,
              message: '请上传出库证明',
              trigger: 'change',
            },
          ]"
        >
          <a-upload
            @preview="handlePreview"
            :file-list="fileList"
            :maxCount="1"
            @remove="removeFile"
            :show-upload-list="true"
            accept="image/*,video/*"
            :customRequest="customRequest"
            :before-upload="handleBeforeUpload"
          >
            <a-button class="upload-btn">
              <i class="ri-upload-2-line"></i>
              <p class="upload-text">上传出库证明图/视频</p>
            </a-button>
          </a-upload>
        </a-form-item>
        <a-form-item label="备注" name="remarks">
          <a-textarea placeholder="备注" v-model:value="outStoreForm.remarks"></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
    <a-modal v-model:open="previewVisible" :footer="null" :title="previewTitle">
      <template v-if="isPreviewImage">
        <img alt="example" style="width: 100%" :src="previewImage" />
      </template>
      <template v-else>
        <video style="width: 100%" controls>
          <source :src="previewImage" />
        </video>
      </template>
    </a-modal>
  </div>
  <logisticPrint ref="logisticPrintRef"></logisticPrint>
</template>

<script lang="ts" setup>
import { ref, reactive, defineExpose, onMounted, onUnmounted } from 'vue'
import { type factoryOperateTypes } from '../Types'
import { useRequest } from 'vue-request'
import type { UploadProps } from 'ant-design-vue'
import dayjs, { Dayjs } from 'dayjs'
import axios from 'axios'
import { orderApi, commonApi } from '@/services/api'
import { message, Modal } from 'ant-design-vue'
import { findLabelByValue, getImgUrlByUrl } from '@/utils/common'
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'
import { Logistics_Company, Shipment_Types, Store_Base } from '@/views/baseData'
import html2canvas from 'html2canvas'
import logisticPrint from './logistic-print.vue'

const emits = defineEmits(['getList'])
const nowOperateType = ref<factoryOperateTypes | undefined>()
const nowOperateOrder = ref()
const modalTitle = ref<string>('')
const modalOpen = ref(false)
// TODO:接受任务
const acceptFormRef = ref()
const acceptForm = reactive({ plan_time: undefined })
const disabledDate = (current: any) => {
  // 禁用今天之前的日期
  return current && dayjs(current).isBefore(dayjs().startOf('day'))
}

// TODO:订单出库
const outStoreFormRef = ref()
const outStoreForm = reactive({
  url: undefined,
  remarks: '',
})

// 制作完成
const finishFormRef = ref()
const finishForm = reactive({ effect_url: undefined })
const fileList = ref<any[]>([])
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')
const isPreviewImage = ref(true)

const handleBeforeUpload = (file: any) => {
  return new Promise((resolve, reject) => {
    const isImage = file.type.startsWith('image/')
    const isVideo = file.type.startsWith('video/')
    if (!isImage && !isVideo) {
      message.error('只支持上传图片')
      return reject('仅支持上传图片、视频')
    }
    fileList.value = [...(fileList.value || []), file]
    resolve(file) // Allow upload
  })
}
const customRequest = async (options: UploadRequestOption) => {
  const { file, onProgress, onError, onSuccess } = options
  console.log('进入上传', file, onProgress)
  outStoreForm.url = ''
  const formData = new FormData()
  formData.append('file', file)
  const source = axios.CancelToken.source()
  try {
    const res = await commonApi.uploadFile(formData, {
      cancelToken: source.token,
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percent = Math.round((progressEvent.loaded / progressEvent.total) * 100)
          if (typeof onProgress === 'function') {
            // 更新进度条
            onProgress({ percent })
          }
        }
      },
    })

    if (res.code === 0) {
      if (typeof onSuccess === 'function') {
        // 用户组件回显图片
        const realUrl = getImgUrlByUrl(res.data.file_url)
        file.url = realUrl

        console.log('上传成功:', nowOperateType.value, file)
        // 表单提交图片
        if (nowOperateType.value === 'runEnd') {
          finishForm.effect_url = res.data.file_url
        }
        if (nowOperateType.value === 'outStore') {
          outStoreForm.url = res.data.file_url
        }
        onSuccess(realUrl)
      }
    } else {
      if (typeof onError === 'function') {
        onError(res.message, res.message)
      }
    }
  } catch (err) {
    if (typeof onError === 'function') {
      console.error('上传失败:', err.message)
      onError(err.message)
    }
  }
}
const removeFile = (file: any) => {
  fileList.value = []
  finishForm.effect_url = undefined
  outStoreForm.url = undefined
}
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (file.url) {
    previewImage.value = file.url
  } else {
    previewImage.value = await new Promise((resolve) => {
      const reader = new FileReader()
      reader.readAsDataURL(file.originFileObj)
      reader.onload = () => resolve(reader.result)
    })
  }
  isPreviewImage.value = file.type.startsWith('image/')
  previewVisible.value = true
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
}

const handleOk = () => {
  switch (nowOperateType.value) {
    case 'accept':
      acceptFormRef.value.validate().then(() => {
        submitAccept()
      })
      break
    case 'runEnd':
      finishFormRef.value.validate().then(() => {
        submitFinish()
      })
      break

    case 'outStore':
      outStoreFormRef.value.validate().then(() => {
        submitOutStore()
      })
      break

    default:
      break
  }
}
// 接受订单
const { loading: formLoading, runAsync: runAccept } = useRequest(orderApi.accept)
const submitAccept = async () => {
  const res = await runAccept(nowOperateOrder.value.order_number, acceptForm)
  console.log('res', res)
  if (res.data) {
    message.success('订单已接受')
    emits('getList')
    handleClose()
  }
}

// 制作完成
const { loading: loadingFinish, runAsync: runFinish } = useRequest(orderApi.productDone)
const submitFinish = async () => {
  const res = await runFinish(nowOperateOrder.value.order_number, finishForm)
  console.log('res', res)
  if (res.data) {
    message.success('订单已制作完成')
    emits('getList')
    handleClose()
  }
}

// TODO:订单出库
// 打印物流单
const logisticPrintRef = ref()
const previewPrint = async () => {
  logisticPrintRef.value.open(detailData.value.order_number)
}
const { loading: loadingOutStore, runAsync: runOutStore } = useRequest(orderApi.outboundVerify)
const submitOutStore = async () => {
  const res = await runOutStore(nowOperateOrder.value.order_number, outStoreForm)
  console.log('res', res)
  if (res.data) {
    message.success('订单已出库')
    emits('getList')
    handleClose()
  }
}

const handleClose = () => {
  switch (nowOperateType.value) {
    case 'accept':
      acceptFormRef.value.resetFields()
      break
    case 'runEnd':
      finishFormRef.value.resetFields()
      break
    case 'outStore':
      outStoreFormRef.value.resetFields()
      break

    default:
      break
  }
  modalTitle.value = ''
  modalOpen.value = false
}

const detailData = ref()
const openModal = async (type: factoryOperateTypes, item: any) => {
  console.log('----', item)
  nowOperateType.value = type
  nowOperateOrder.value = item
  switch (type) {
    case 'accept':
      modalTitle.value = `接受订单（${item.order_number}）`
      modalOpen.value = true
      break

    case 'runEnd':
      modalTitle.value = `制作完成订单（${item.order_number}）`
      modalOpen.value = true
      // Modal.confirm({
      //   content: `确认制作完成订单（${item.order_number}）`,
      //   okText: '确认',
      //   cancelText: '取消',
      //   okButtonProps: {
      //     loading: loadingFinish.value,
      //   },
      //   onOk: async () => {
      //     return new Promise(async function (resolve) {
      //       const res = await runFinish(item.order_number)
      //       if (res) {
      //         message.success(`订单（${item.order_number}）加急成功`)
      //         resolve(true)
      //         emits('getList')
      //       }
      //     })
      //   },
      // })
      break

    case 'outStore':
      const res = await orderApi.detail(item.order_number)
      detailData.value = res.data
      console.log('订单详情', detailData.value)
      modalTitle.value = `订单出库（${item.order_number}）`
      modalOpen.value = true
      break

    default:
      break
  }
}

onMounted(() => {
  // openModal('outStore', { order_number: '65478912' })
})

defineExpose({
  openModal,
})
</script>

<style scoped lang="less">
.accept-modal {
  padding: 32px 24px 24px 24px;
  font-size: 16px;
  .product-img {
    width: 120px;
  }
  .upload-btn {
    // width: 120px;
    display: flex;
    justify-content: center;
    align-items: center;
    i {
      font-size: 18px;
      color: @text2;
      margin-right: 8px;
    }

    .upload-text {
      font-size: 16px;
      color: @text2;
    }
  }
  .send-val {
    display: flex;
    gap: 8px;
  }
}
</style>
