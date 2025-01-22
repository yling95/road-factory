<template>
  <main-card :title="'订单列表'" :showPageTools="true">
    <template #Slot-Tools-Right>
      <a-button type="primary" class="creat-btn" @click="handleToForm('add')">创建订单</a-button>
    </template>
    <div class="order-list">
      <!-- 筛选 -->
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
            v-model:value="pageForm.status"
            :class="[pageForm.status !== undefined && 'ant-select-focused']"
            placeholder="订单状态"
            :options="Order_Status_Types"
            @change="handleSearch"
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

      <!-- 表格 -->
      <div class="table-wrap">
        <a-table
          :loading="loading"
          :columns="columns"
          :scroll="{ y: 450 }"
          :dataSource="dataList"
          :pagination="{
            total: pageForm.total,
            current: pageForm.offset,
            pageSize: pageForm.limit,
            showTotal: (total: number) => `共${total}条记录`,
            showSizeChanger: true,
            size: 'small',
          }"
          :row-selection="{ selectedRowKeys: state.selectedRowKeys, onChange: onSelectChange }"
          :row-key="(record) => record.order_number"
          @change="tableChange"
        >
          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'status'">
              <span
                :class="[
                  'order-state',
                  `order-state--${record.status}`,
                  record.pause ? 'order-state--pause' : '',
                ]"
              >
                {{ findLabelByValue(Order_Status_Types, record.status) }}

                <i
                  class="ri-fire-fill urgency"
                  v-if="record.urgent && record.status !== 'outbound_done'"
                ></i>
              </span>
              <span style="font-size: 14px" class="pause_text" v-if="record.pause">（暂停）</span>
            </div>
            <div class="table-operation" v-if="column.key === 'operation'">
              <a-button type="link" @click.stop="handleToDetail(record)">详情</a-button>
              <a-button
                type="link"
                v-if="record.pause"
                @click="handleSalesOperate('pause', record)"
              >
                继续
              </a-button>
              <div v-else class="table-operation">
                <a-button
                  type="link"
                  v-if="
                    isfactoryManage && record.status === 'wait_outbound' && record.delivery_info
                  "
                  @click="handleFactoryOperate(record)"
                  >出库</a-button
                >
                <a-button
                  type="link"
                  v-if="isfactoryManage && record.status !== 'wait_outbound'"
                  @click="handleFactoryOperate(record)"
                >
                  {{
                    record.status === 'wait_exec'
                      ? '接受'
                      : record.status === 'in_exec'
                        ? '制作完成'
                        : record.status === 'wait_outbound'
                          ? '出库'
                          : record.status === 'outbound_done'
                            ? '上传物流单号'
                            : ''
                  }}
                </a-button>
                <a-button
                  type="link"
                  v-if="record.status !== 'outbound_done' && isSalesManage"
                  @click="handleSalesOperate('urgency', record)"
                  >加急
                </a-button>
                <a-button
                  type="link"
                  v-if="record.status === 'wait_outbound' && isSalesManage"
                  @click="handleSalesOperate('receiveInfo', record)"
                >
                  <!-- /修改 -->
                  <a href="javascript:;">{{ record.delivery_info ? '修改' : '填写' }}收货信息</a>
                </a-button>

                <a-dropdown>
                  <a class="ant-dropdown-link" @click.prevent>
                    更多
                    <DownOutlined />
                  </a>
                  <template #overlay>
                    <a-menu>
                      <!-- 预留修改 -->
                      <!-- <a-menu-item
                        type="link"
                        v-if="record.status === 'wait_exec' && isSalesManage"
                        @click="handleToForm('edit', record.order_number)"
                        >修改
                      </a-menu-item> -->

                      <a-menu-item
                        v-if="
                          (record.status === 'in_exec' || record.status === 'wait_exec') &&
                          isSalesManage
                        "
                        @click="handleSalesOperate('cancel', record)"
                      >
                        <a href="javascript:;">删除</a>
                      </a-menu-item>

                      <a-menu-item
                        v-if="record.status !== 'outbound_done' && isSalesManage"
                        @click="handleSalesOperate('pause', record)"
                      >
                        <a href="javascript:;">暂停</a>
                      </a-menu-item>
                      <a-menu-item
                        v-if="record.status !== 'wait_exec'"
                        @click="handleSalesOperate('back', record)"
                      >
                        <a href="javascript:;">回退</a>
                      </a-menu-item>
                      <a-menu-item
                        v-if="record.outbound_type === 'logistics' && FactoryOperate"
                        @click="handleFactoryOperate(record, 'print')"
                      >
                        <a href="javascript:;">打印物流单</a>
                      </a-menu-item>
                    </a-menu>
                  </template>
                </a-dropdown>
              </div>
            </div>
            <div v-if="column.key === 'sample_img_url'">
              <a-image
                :src="getImgUrlByUrl(record.sample_img_url)"
                :height="40"
                :width="80"
                class="sample-img"
                alt=""
              />
            </div>
            <div v-if="column.key === 'product_type'">
              {{ findLabelByValue(Product_Types, record.product_type) }}
            </div>
          </template>
        </a-table>
      </div>
    </div>
    <template #Batch-Operate>
      <div class="the-journal-bottom" v-show="hasSelect">
        <div class="table-button" @click="resetSelect()">
          <span class="table-button_active">取消选中</span>
        </div>
        <div class="select-number">已选{{ state.selectedRowKeys.length }}条</div>
        <div class="select-export">
          <a-button @click="batchUrgency">
            <i class="ri-flashlight-fill" style="margin-right: 6px"></i>
            批量加急
          </a-button>
        </div>
      </div>
    </template>
  </main-card>
  <FactoryOperate ref="factoryOperateRef" @getList="getDataList"></FactoryOperate>
  <SalesOperate ref="salesOperateRef" @getList="getDataList"></SalesOperate>
  <logisticPrint ref="logisticPrintRef"></logisticPrint>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import useList from '@/hooks/useList'
import { orderApi, commonApi } from '@/services/api'
import { message, Modal, type TableProps } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { Order_Status_Types, Product_Types } from '../baseData'
import { findLabelByValue, getImgUrlByUrl } from '@/utils/common'
import dayjs, { Dayjs } from 'dayjs'
import { useUserStore } from '@/stores/user'
import { useRequest } from 'vue-request'
import type { factoryOperateTypes, salesOperateTypes, UserType } from './Types'

import FactoryOperate from './component/factory-operate.vue'
import SalesOperate from './component/sales-operate.vue'
import logisticPrint from './component/logistic-print.vue'

type Key = string | number
type RangeValue = [Dayjs, Dayjs]

const userStore = useUserStore()
const router = useRouter()

// 角色对操作权限判断
const nowUserType: UserType = userStore.userInfo.role
const isSalesManage = nowUserType !== 'factory'
const isfactoryManage = nowUserType !== 'sales'

const factoryOperateRef = ref()
const salesOperateRef = ref()
const logisticPrintRef = ref()

/**
 *
 *  表格选择
 */
const state = reactive<{
  selectedRowKeys: Key[]
  loading: boolean
}>({
  selectedRowKeys: [], // Check here to configure the default column
  loading: false,
})

const hasSelect = computed(() => !!state.selectedRowKeys.length)
const onSelectChange = (selectedRowKeys: any) => {
  state.selectedRowKeys = selectedRowKeys
}
const resetSelect = () => {
  state.selectedRowKeys = []
}
const { loading: loadingBatchStatus, runAsync: runBatchStatus } = useRequest(
  orderApi.productBatchStatus,
)
const batchUrgency = () => {
  Modal.confirm({
    content: `确认批量加急订单:${state.selectedRowKeys.join('、')}`,
    okButtonProps: {
      loading: loadingBatchStatus.value,
    },
    onOk: async () => {
      const res = await runBatchStatus({
        operation: 'urgent_order',
        orders: state.selectedRowKeys,
      })
      if (res) {
        message.success('操作成功')
        state.selectedRowKeys = []
        getDataList()
      }
    },
  })
}

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
  getDataList({ ...pageForm, offset: 1 })
}

// 新增
const handleToForm = (type: 'add' | 'edit' = 'add', id?: number) => {
  if (type === 'add') {
    router.push({ path: '/order/add' })
  } else {
    router.push({ path: `/order/edit`, query: { id } })
  }
}

// 跳转详情
const handleToDetail = (item: any) => {
  router.push({
    path: `/order/detail/${item.order_number}`,
  })
}

// 工厂端操作
const handleFactoryOperate = (item: any, operateType?: any) => {
  if (operateType === 'print') {
    logisticPrintRef.value.open(item.order_number)
    return
  }
  let type: factoryOperateTypes | undefined
  switch (item.status) {
    case 'wait_exec':
      type = 'accept'
      break
    case 'in_exec':
      type = 'runEnd'
      break
    case 'wait_outbound':
      type = 'outStore'
      break
    case 'outbound_done':
      type = 'uploadFlow'
      break
    default:
      break
  }
  console.log('操作66', item)

  factoryOperateRef.value.openModal(type, item)
}

// 销售端操作
const handleSalesOperate = (type: salesOperateTypes, item: any) => {
  console.log('操作', type, item)

  salesOperateRef.value.openModal(type, item)
}

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
    title: '订单状态',
    dataIndex: 'status',
    key: 'status',
    width: 150,
  },
  {
    title: '订单类型',
    dataIndex: 'product_type',
    key: 'product_type',
    width: 150,
  },
  {
    title: '样板图',
    dataIndex: 'sample_img_url',
    key: 'sample_img_url',
    width: 150,
  },
  {
    title: '创建人',
    dataIndex: 'creator_name',
    key: 'creator_name',
    width: 120,
  },
  {
    title: '创建时间',
    dataIndex: 'create_time',
    key: 'create_time',
    width: 200,
  },
  {
    title: '备注',
    dataIndex: 'remarks',
    ellipsis: true,
    key: 'remarks',
  },
  {
    title: '操作',
    dataIndex: 'operation',
    key: 'operation',
    width: 330,
  },
])

// 表格数据
const { dataList, getDataList, loading, pageForm } = useList(
  orderApi.oderList,
  {
    search: undefined,
    start_date: undefined,
    end_date: undefined,
    status: undefined,
  },
  () => {
    console.log('订单列表', dataList.value)
  },
)
const tableChange: TableProps<any>['onChange'] = (pagination) => {
  pageForm.limit = pagination.pageSize || 10
  getDataList({
    offset: pagination.current,
  })
}

// 初始化
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
.order-state {
  position: relative;
  // display: flex;
  // white-space: nowrap;
  // align-items: center;
  .urgency {
    position: absolute;
    right: -6px;
    top: -18px;
    font-size: 20px;
    color: #ff3001;
  }
  &--pause {
    background: #ccc;
    .urgency {
      color: rgba(250, 0, 15, 0.4);
    }
  }
}
.pause_text {
  display: block;
  white-space: nowrap;
}

.sample-img {
  width: 80px;
  max-height: 40px;
  object-fit: contain;
}

.the-journal-bottom {
  display: flex;
  align-items: center;
  position: absolute;
  bottom: -17px;
  left: -32px;
  height: 62px;
  z-index: 2;
  border-top: 1px solid @border3;
  background: #fff;
  box-shadow:
    0px -3.4px 5.85px 0px rgba(2, 36, 59, 0.03),
    0px -17px 36px 0px rgba(2, 36, 59, 0.06);
  display: flex;
  width: calc(100% + 64px);
  border-radius: 0px 0px 8px 8px;
  font-size: 16px;

  .table-button {
    width: 124px;
    height: 36px;
    line-height: 36px;
    text-align: center;
    border-right: 1px solid @border2;
    .table-button_active {
      color: @text3;
      font-size: 16px;
      line-height: 22px;
      cursor: pointer;
    }
    .table-button_disable {
      color: #ccc;
    }
  }

  .select-number {
    width: 124px;
    height: 36px;
    font-weight: 400;
    font-size: 16px;
    line-height: 36px;
    text-align: center;
    color: @primary1;
  }

  .select-export {
    height: 36px;
    width: 60px;
  }
}
</style>
