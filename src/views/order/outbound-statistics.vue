<template>
  <main-card :title="'出库统计'" :showPageTools="true">
    <!-- 操作区域 -->
    <div class="filter">
      <div class="filter-item">
        <a-input
          style="width: 239px"
          placeholder="订单编号/客户名称"
          v-model:value="pageForm.search"
          allowClear
          @press-enter="handleSearch"
          @change="!pageForm.search && handleSearch()"
        >
          <template #prefix>
            <i class="iconfont icon-search-line"></i>
          </template>
        </a-input>
      </div>
      <div class="filter-item">
        <a-select
          style="width: 160px"
          v-model:value="pageForm.outbound_type"
          placeholder="出库类型"
          :options="Shipment_Types"
          allow-clear
          :showSearch="false"
          showArrow
        >
        </a-select>
      </div>
      <div class="filter-item">
        <a-select
          style="min-width: 160px; max-width: 420px"
          v-model:value="pageForm.logistics_company"
          mode="multiple"
          placeholder="物流公司"
          :options="Logistics_Company"
          allow-clear
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
      :loading="loading"
      :scroll="{ y: 450 }"
    >
      <template #bodyCell="{ column, record }">
        <div v-if="column.key === 'delivery_verify_time'">
          {{ dayjs(record.delivery_verify_time).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
        <div v-if="column.key === 'delivery_verify_url'">
          <a-button type="link" v-if="record.delivery_verify_url" @click="preview(record)">查看 </a-button>
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
import useList from '@/hooks/useList'

import { Shipment_Types, Logistics_Company } from '@/views/baseData'
import { getImgUrlByUrl } from '@/utils/common'
import { orderApi } from '@/services/api'
import { isImage, isVideo } from '@/utils/index'

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
    dataIndex: 'operation',
    key: 'operation',
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
  if (searchTime.value) {
    pageForm.start_date = dayjs(searchTime.value?.[0]).startOf('date').format('YYYY-MM-DD')
    pageForm.end_date = dayjs(searchTime.value?.[1]).endOf('date').format('YYYY-MM-DD')
  } else {
    pageForm.start_date = undefined
    pageForm.end_date = undefined
  }
  getDataList({ ...pageForm, pages: 1 })
}

// 预览出库证明
const previewVisible = ref(false)
const previewItem = ref()
const preview = (item: any) => {
  previewVisible.value = true
  previewItem.value = item
}
onMounted(() => {
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
.preview-content{
  display: flex;
  align-content: center;
  padding-top: 32px;
  justify-content: center;
}
</style>
