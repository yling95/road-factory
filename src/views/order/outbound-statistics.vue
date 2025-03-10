<template>
  <main-card :title="'出库统计'" :showPageTools="true">
    <!-- 操作区域 -->
    <div class="filter">
      <div class="filter-item">
        <a-select
          style="width: 160px"
          v-model:value="pageForm.outbound_type"
          placeholder="出库类型"
          :options="Shipment_Types"
          allow-clear
          @change="handleSearch"
          :showSearch="false"
          showArrow
        >
        </a-select>
      </div>
      <div class="filter-item">
        <a-select
          style="min-width: 160px; max-width: 420px"
          v-model:value="pageForm.logistics_company"
          placeholder="物流公司"
          :options="Logistics_Company"
          allow-clear
          @change="handleSearch"
          :showSearch="false"
          showArrow
        >
        </a-select>
      </div>
      <div class="filter-item">
        <a-range-picker v-model:value="searchTime" @change="handleSearch" />
      </div>
    </div>
    <a-table
      :columns="columns"
      class="table"
      :dataSource="dataList"
      :scroll="{ x: 'max-content' }"
      :loading="loading"
      :pagination="{
            total: pageForm.total,
            current: pageForm.page,
            pageSize: pageForm.limit,
            showTotal: (total: number) => `共${total}条记录`,
            showSizeChanger: true,
            size: 'small',
          }"
      @change="tableChange"
    >
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'delivery_verify_time'">
          {{ dayjs(record.delivery_verify_time).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
        <div v-if="column.key === 'delivery_verify_url'">
          <a-button type="link" v-if="record.delivery_verify_url" @click="preview(record)"
            >查看
          </a-button>
        </div>
        <div v-if="column.key === 'product_type'">
          {{ findLabelByValue(Product_Types, record.product_type) }}
        </div>
        <div v-if="column.key === 'outbound_type'">
          {{ findLabelByValue(Shipment_Types, record.outbound_type) }}
        </div>
        <div v-if="column.key === 'logistics_info' && record.outbound_type === 'logistics'">
          {{ findLabelByValue(Logistics_Company, record.logistics_info.logistics_company) }}({{
            record.logistics_number
          }})
        </div>
      </template>
    </a-table>
  </main-card>
  <a-modal v-model:open="previewVisible" :footer="null" :mask-closable="false">
    <div class="preview-content">
      <a-image
        v-if="isImage(previewItem.delivery_verify_url)"
        :src="getImgUrlByUrl(previewItem.delivery_verify_url)"
        :height="220"
        :width="160"
        class="sample-img"
        alt=""
      />

      <video
        v-if="isVideo(previewItem.delivery_verify_url)"
        :src="getImgUrlByUrl(previewItem.delivery_verify_url)"
        controls
        width="300"
      ></video>
    </div>
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue'
import dayjs, { Dayjs } from 'dayjs'
import { useRoute, useRouter } from 'vue-router'
import useList from '@/hooks/useList'
import { message, Modal, type TableProps } from 'ant-design-vue'
import { Shipment_Types, Logistics_Company, Product_Types } from '@/views/baseData'
import { getImgUrlByUrl, findLabelByValue } from '@/utils/common'
import { orderApi } from '@/services/api'
import { isImage, isVideo } from '@/utils/index'

const route = useRoute()
const router = useRouter()
// 表格结构
const columns = ref([
  {
    title: '订单编号',
    dataIndex: 'order_number',
    key: 'order_number',
    ellipsis: true,
    width: 200,
  },

  {
    title: '客户名称',
    dataIndex: 'customer_name',
    key: 'customer_name',
    width: 120,
  },
  {
    title: '订单类型',
    dataIndex: 'product_type',
    key: 'product_type',
    width: 150,
  },
  {
    title: '出库类型',
    dataIndex: 'outbound_type',
    key: 'outbound_type',
    width: 150,
  },
  {
    title: '出库人',
    dataIndex: 'outbound_person_name',
    key: 'outbound_person_name',
    width: 120,
  },
  {
    title: '出库时间',
    dataIndex: 'delivery_verify_time',
    key: 'delivery_verify_time',
    width: 200,
  },
  {
    title: '物流信息',
    dataIndex: 'logistics_info',
    key: 'logistics_info',
    ellipsis: true,
    width: 200,
  },
  {
    title: '出库证明',
    dataIndex: 'delivery_verify_url',
    key: 'delivery_verify_url',
    width: 200,
  },
])

type RangeValue = [Dayjs, Dayjs]

// 表格数据
const { dataList, getDataList, loading, pageForm } = useList(
  orderApi.outStatistics,
  {
    search: undefined,
    outbound_type: undefined,
    start_date: undefined,
    end_date: undefined,
    logistics_company: undefined,
    status: undefined,
  },
  () => {
    console.log('获取统计', dataList.value)
  }
)

// 查询
const searchTime = ref<RangeValue | undefined>(undefined)
const handleSearch = () => {
  if (pageForm.search === '') {
    pageForm.search = undefined
  }
  if (searchTime.value) {
    pageForm.start_date = dayjs(searchTime.value?.[0]).startOf('date').format('YYYY-MM-DD')
    pageForm.end_date = dayjs(searchTime.value?.[1]).endOf('date').format('YYYY-MM-DD')
  } else {
    pageForm.start_date = undefined
    pageForm.end_date = undefined
  }
  getDataList({ ...pageForm, page: 1 })
}
const tableChange: TableProps<any>['onChange'] = (pagination: any) => {
  pageForm.limit = pagination.pageSize || 10
  console.log('-----', pagination)
  pageForm.page = pagination.current
  console.log('搜索', pageForm)

  getDataList({
    page: pagination.current,
  })
}
// 预览出库证明
const previewVisible = ref(false)
const previewItem = ref()
const preview = (item: any) => {
  previewVisible.value = true
  previewItem.value = item
}
onMounted(() => {
  if (sessionStorage.getItem('Logistics_Company')) {
    pageForm.logistics_company = sessionStorage.getItem('Logistics_Company')
  }
  sessionStorage.removeItem('Logistics_Company')
  getDataList()
})
</script>

<style scoped lang="less">
.filter {
  padding: 12px 0;
  display: flex;
  gap: 16px;
}
.table {
  padding: 20px 0;
}
.preview-content {
  display: flex;
  align-content: center;
  padding-top: 32px;
  justify-content: center;
}
</style>
