<template>
  <SecondCard
    :title="route.query.id ? `编辑订单（${route.query.id}）` : '新增订单'"
    :loading="loadingDtail"
  >
    <a-form
      class="order-form"
      :layout="'vertical'"
      ref="formRef"
      :model="formState"
      :rules="formRules"
    >
      <a-form-item label="订单编号：" name="order_number">
        <a-input
          placeholder="请输入订单编号"
          v-model:value="formState.order_number"
          :maxlength="30"
          class="default-input"
        ></a-input>
      </a-form-item>
      <a-form-item label="客户名称：" name="customer_name">
        <a-input
          placeholder="请输入客户名称"
          v-model:value="formState.customer_name"
          :maxlength="20"
          class="default-input"
        ></a-input>
      </a-form-item>
      <a-form-item label="订单类型：" name="product_type">
        <a-select
          placeholder="'请选择订单类型'"
          :options="Product_Types"
          v-model:value="formState.product_type"
          class="default-input"
        ></a-select>
      </a-form-item>
      <a-form-item label="产品图：" name="sample_img_url">
        <a-upload
          list-type="picture-card"
          @preview="handlePreview"
          :file-list="fileList"
          :maxCount="1"
          accept="image/*"
          @remove="removeFile"
          :customRequest="customRequest"
          :before-upload="beforeUpload"
        >
          <div v-if="fileList.length < 1">
            <i class="ri-add-line"></i>
            <p class="upload-text">上传产品图</p>
          </div>
        </a-upload>
      </a-form-item>
      <a-form-item label="产品信息：">
        <div class="product-item" v-for="(product, index) in formState.product_info" :key="index">
          <a-form-item
            class="mrBt0"
            :name="['product_info', index, 'name']"
            :rules="[{ required: true, message: '请输入品名及规格' }]"
          >
            <a-input
              placeholder="品名及规格"
              :maxlength="80"
              v-model:value="product.name"
              class="default-input"
            />
          </a-form-item>
          <a-form-item
            class="mrBt0"
            :name="['product_info', index, 'warehouse']"
            :rules="[{ required: true, message: '请选择所属仓库' }]"
          >
            <a-select
              placeholder="所属仓库"
              :options="Store_Base"
              v-model:value="product.warehouse"
              class="mid"
            />
          </a-form-item>
          <a-form-item
            class="mrBt0"
            :name="['product_info', index, 'count']"
            :rules="[{ required: true, message: '请输入数量' }]"
          >
            <a-input
              placeholder="数量"
              type="number"
              :min="1"
              :max="999999"
              v-model:value="product.count"
              class="mini"
            />
          </a-form-item>
          <a-form-item
            class="mrBt0"
            :name="['product_info', index, 'unit']"
            :rules="[{ required: true, message: '请输入单位' }]"
          >
            <a-input placeholder="单位" v-model:value="product.unit" class="mini" />
          </a-form-item>
          <div class="operate-box">
            <a-button
              type="text"
              class="operate-btn"
              @click="operateProduct('remove', index)"
              v-show="index !== 0"
              ><i class="ri-subtract-line"></i
            ></a-button>
            <a-button
              type="text"
              class="operate-btn operate-btn--add"
              @click="operateProduct('add')"
              ><i class="ri-add-line"></i
            ></a-button>
          </div>
        </div>
      </a-form-item>
      <a-form-item label="备注：" name="remarks">
        <a-textarea
          class="default-input"
          v-model:value="formState.remarks"
          :maxlength="200"
          placeholder="备注"
        ></a-textarea>
      </a-form-item>
      <a-form-item class="error-infos" :wrapper-col="{ span: 14, offset: 4 }">
        <a-button type="primary" @click.prevent="onSubmit" :loading="formLoading">提交</a-button>
        <a-button style="margin-left: 10px" @click="resetFields">重置</a-button>
      </a-form-item>
    </a-form>
  </SecondCard>
  <a-modal
    :open="previewVisible"
    :title="previewTitle"
    :footer="null"
    @cancel="((previewVisible = false), (previewTitle = ''))"
  >
    <img alt="example" style="width: 100%" :src="previewImage" />
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRequest } from 'vue-request'
import { Product_Types, Store_Base } from '@/views/baseData'
import axios from 'axios'
import { commonApi, orderApi } from '@/services/api'
import type { UploadProps } from 'ant-design-vue'
import type { RuleObject } from 'ant-design-vue/es/form/interface'
import { message, Modal } from 'ant-design-vue'
import type { UploadRequestOption } from 'ant-design-vue/es/vc-upload/interface'
import type { FileType } from 'ant-design-vue/es/upload/interface'
import { getImgUrlByUrl } from '@/utils/common'

const router = useRouter()
const route = useRoute()
const formRef = ref()
const formState = reactive({
  order_number: '',
  customer_name: '',
  product_type: undefined,
  sample_img_url: '',
  product_info: [{ name: '', warehouse: undefined, count: '', unit: '' }],
  remarks: '',
})
const fileList = ref<UploadProps['fileList']>([])

const formRules = ref<{ [key: string]: RuleObject[] }>({
  order_number: [{ required: true, message: '请输入订单编号', trigger: 'blur' }],
  customer_name: [{ required: true, message: '请输入客户名称', trigger: 'blur' }],
  product_type: [{ required: true, message: '请选择订单类型', trigger: 'blur' }],
  sample_img_url: [{ required: true, message: '请上传产品图', trigger: 'blur' }],
})

const productItem = { name: '', warehouse: undefined, count: '', unit: '' }
const operateProduct = (type: 'add' | 'remove', index?: number) => {
  if (type === 'add') {
    formState.product_info.push({ ...productItem })
  }
  if (type === 'remove' && index != null) {
    formState.product_info.splice(index, 1)
  }
}

// 预览上传的图片
const previewVisible = ref(false)
const previewImage = ref('')
const previewTitle = ref('')
const getBase64 = (file: File) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}
const handlePreview = async (file: UploadProps['fileList'][number]) => {
  if (!file.url && !file.preview) {
    file.preview = (await getBase64(file.originFileObj)) as string
  }
  previewImage.value = file.url || file.preview
  previewVisible.value = true
  previewTitle.value = file.name || file.url.substring(file.url.lastIndexOf('/') + 1)
}

// 上传文件
const beforeUpload: UploadProps['beforeUpload'] = (file: any) => {
  return new Promise((resolve, reject) => {
    if (!file.type.startsWith('image/')) {
      message.error('只支持上传图片')
      return reject('只支持上传图片')
    }
    file.url = ''
    fileList.value = [...(fileList.value || []), file]
    resolve(file)
  })
}
const removeFile = (file: any) => {
  fileList.value = []
  formState.sample_img_url = ''
  console.log('移除文件', file)
}
const customRequest = async (options: UploadRequestOption) => {
  const { file, onProgress, onError, onSuccess } = options
  const formData = new FormData()
  formData.append('file', file)
  const source = axios.CancelToken.source()
  commonApi
    .uploadFile(formData, {
      cancelToken: source.token,
      onUploadProgress: (progressEvent) => {
        const percents = (progressEvent.progress || 0) * 100
        if (typeof onProgress === 'function') {
          // 更新进度条
          onProgress({ percent: percents })
        }
      },
    })
    .then((res: any) => {
      console.log('上传', res)
      if (res.code === 0) {
        if (typeof onSuccess === 'function') {
          // 用户组件回显图片
          const realUrl = getImgUrlByUrl(res.data.file_url)
          file.url = realUrl
          // 表单提交图片
          formState.sample_img_url = res.data.file_url
          onSuccess(res)
        }
      } else {
        if (typeof onError === 'function') {
          onError(res.message, res.message)
        }
      }
    })
    .catch((err) => {
      if (typeof onError === 'function') {
        onError(err.message)
      }
    })
}

// 提交表单
const { loading: formLoading, runAsync: runAdd } = useRequest(orderApi.create)
const onSubmit = () => {
  formRef.value
    .validate()
    .then(async () => {
      console.log(formState)
      const paramsData = { ...formState }
      paramsData.product_type = paramsData.product_type.toString()
      console.log('----', paramsData)
      const res = await runAdd(paramsData)
      console.log('新增响应', res)
      message.success('订单创建成功')
      formRef.value.resetFields()
      Modal.confirm({
        content: `订单创建成功，是否继续创建？`,
        okText: '返回',
        cancelText: '继续',
        onOk: () => {
          router.go(-1)
        },
        onCancel: () => {
          formRef.value.resetFields()
        },
      })
    })
    .catch((err: any) => {
      console.log('error', err)
    })
}
const resetFields = () => {
  formRef.value.resetFields()
}

// 预留修改订单
const { loading: loadingDtail, runAsync: runDetail } = useRequest(orderApi.detail)
const editReShowForm = async () => {
  const res = await runDetail(route.query.id as string)
  if (res.data) {
    console.log('详情数据', res.data)
    const data = res.data
    console.log('图片', data.sample_img_url)

    // 设置 fileList，模拟上传的图片文件
    fileList.value = [
      {
        uid: '-1', // 唯一标识符
        name: data.sample_img_url.split('/').pop(),
        status: 'done',
        url: getImgUrlByUrl(data.sample_img_url), // 回显图片的 URL
      },
    ]
    console.log('url', getImgUrlByUrl(data.sample_img_url))

    formState.order_number = data.order_number
    formState.customer_name = data.customer_name
    formState.product_type = data.product_type
    formState.sample_img_url = data.sample_img_url
    formState.remarks = data.remarks

    // 填充产品信息
    formState.product_info = data.product_info.map((product: any) => ({
      name: product.name,
      warehouse: product.warehouse,
      count: product.count,
      unit: product.unit,
    }))
  }
}

onMounted(() => {
  // if (route.query.id) {
  //   console.log('是编辑')
  //   editReShowForm()
  // }
})
</script>

<style scoped lang="less">
.order-form {
  width: 700px;
  padding-top: 10px;
  margin: 0 auto;
  .default-input {
    width: 380px;
  }
  .product-item {
    height: 56px;
    display: flex;
    gap: 8px;
    .mid {
      width: 180px;
    }
    .mrBt0 {
      margin-bottom: 0;
    }
    .mini {
      width: 80px;
    }
    .operate-box {
      display: flex;
      gap: 6px;
      margin-left: 4px;
      width: 64px !important;

      .operate-btn {
        cursor: pointer;
        display: block;
        padding: 0;
        width: 24px;
        height: 24px;
        border-radius: 12px;
        border: 1px solid @border2;
        margin-top: 5px;
        text-align: center;
        line-height: 24px;

        &--add {
          background-color: @border1;
        }
      }
    }
  }
  .upload-btn {
    width: 120px;
    height: 120px;
    border: 1px dashed @border2;
    i {
      font-size: 28px;
      color: @text3;
    }

    .upload-text {
      font-size: 14px;
      color: @text3;
    }
  }
}
</style>
