<template>
  <div class="workbench">
    <div class="order-statistics">
      <div class="statistics">
        <div class="icon-box">
          <SvgIcon name="home (1)" className="home-icon home-icon--urgency" />
        </div>
        <div class="text-box">
          <div class="label">加急订单</div>
          <div class="value">{{ statusStatic?.data.urgent_count }}</div>
        </div>
      </div>
      <div class="statistics">
        <div class="icon-box">
          <SvgIcon name="home (2)" className="home-icon home-icon--accept" />
        </div>
        <div class="text-box">
          <div class="label">待接受订单</div>
          <div class="value">{{ statusStatic?.data.wait_exec_count }}</div>
        </div>
      </div>
      <div class="statistics">
        <div class="icon-box">
          <SvgIcon name="home (3)" className="home-icon home-icon--awaitOut" />
        </div>
        <div class="text-box">
          <div class="label">待出库订单</div>
          <div class="value">{{ statusStatic?.data.wait_outbound_count }}</div>
        </div>
      </div>
      <div class="statistics">
        <div class="icon-box">
          <SvgIcon name="home (4)" className="home-icon home-icon--execution" />
        </div>
        <div class="text-box">
          <div class="label">执行中订单</div>
          <div class="value">{{ statusStatic?.data.in_exec_count }}</div>
        </div>
      </div>
      <div class="statistics">
        <div class="icon-box">
          <SvgIcon name="home (5)" className="home-icon home-icon--out" />
        </div>
        <div class="text-box">
          <div class="label">已出库订单</div>
          <div class="value">{{ statusStatic?.data.outbound_done_count }}</div>
        </div>
      </div>
    </div>
    <div class="content-statistics">
      <div class="left">
        <div class="left-top">
          <div class="title">
            <img src="@/assets/images/workbench/Rectangle.png" class="rectangle" />
            <div class="title-content">
              <span class="title-text">待出库订单</span>
              <a-input
                placeholder="车牌号/客户名称"
                v-model:value="waiteOutPageForm.search"
                @press-enter="handleSearch"
                @change="!waiteOutPageForm.search && handleSearch()"
                class="search-input"
              >
                <template #prefix>
                  <i class="ri-search-line"></i>
                </template>
              </a-input>
              <a-select
                :options="Shipment_Types"
                placeholder="提货方式"
                class="shipment_Types"
                v-model:value="waiteOutPageForm.outbound_type"
                @change="handleSearch"
                allow-clear
              ></a-select>
            </div>

            <img src="@/assets/images/workbench/mark.png" class="mark" />
          </div>
          <a-table
            :columns="waiteOutColumns"
            :dataSource="waiteOutList"
            :loading="loadingWaiteOut"
            :scroll="{ y: 160 }"
            :pagination="false"
            @change="waiteOutTableChange"
          >
            <template #bodyCell="{ column, record }">
              <div v-if="column.key === 'product_effect_url'">
                <a-image
                  :src="getImgUrlByUrl(record.product_effect_url)"
                  :height="40"
                  :width="80"
                  class="sample-img"
                  alt=""
                />
              </div>
              <div v-if="column.key === 'product_type'">
                {{ findLabelByValue(Product_Types, record.product_type) }}
              </div>
              <div v-if="column.key === 'outbound_type'">
                {{ findLabelByValue(Shipment_Types, record.outbound_type) }}
              </div>
              <div
                v-if="column.key === 'license_plate' && record.outbound_type === 'self_pickup'"
                class="car-num"
              >
                <span class="car-num-text" v-if="!record.editCarNum">{{
                  record.license_plate
                }}</span>
                <a-input
                  placeholder="车牌号"
                  v-model:value.trim="updateCarNum"
                  :maxlength="8"
                  v-else
                ></a-input>
                <a-button
                  class="edit-btn"
                  type="text"
                  @click="record.editCarNum = true"
                  v-if="!record.editCarNum"
                  ><i class="ri-edit-line"></i
                ></a-button>
                <a-button class="save-btn" type="primary" @click="saveCarNum(record)" v-else
                  >保存
                </a-button>
              </div>
            </template>
          </a-table>
        </div>
        <div class="left-bottom" ref="chartExpressageRef">物流统计</div>
      </div>
      <div class="right">
        <div class="title">
          <img src="@/assets/images/workbench/Rectangle.png" class="rectangle" />
          加急订单列表
          <img src="@/assets/images/workbench/mark.png" class="mark" />
        </div>
        <a-table
          :columns="urgencyColumns"
          :dataSource="urgencyList"
          :loading="loadingUrgency"
          :scroll="{ y: 480 }"
          :pagination="{
            total: urgencyPageForm.total,
            current: urgencyPageForm.page,
            pageSize: urgencyPageForm.limit,
            showTotal: (total: number) => `共${total}条记录`,
            showSizeChanger: true,
            size: 'small',
          }"
          @change="urgencyTableChange"
        >
          <template #bodyCell="{ column, record }">
            <div v-if="column.key === 'status'">
              <span :class="['order-state', `order-state--${record.status}`]">
                {{ findLabelByValue(Order_Status_Types, record.status) }}
              </span>
            </div>
            <div v-if="column.key === 'product_type'">
              {{ findLabelByValue(Product_Types, record.product_type) }}
            </div>
          </template>
        </a-table>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import useList from '@/hooks/useList'
import * as echarts from 'echarts'
import { useRequest } from 'vue-request'
import { message, Modal, type TableProps } from 'ant-design-vue'
import insertChart from '@/assets/svgs/insert_chart.svg'
import { Shipment_Types, Order_Status_Types, Product_Types, Logistics_Company } from '../baseData'
import { findLabelByValue, getImgUrlByUrl } from '@/utils/common'
import { orderApi } from '@/services/api'
import router from '@/router'
import { useUserStore } from '@/stores/user'
const chartExpressageRef = ref<HTMLDivElement | null>(null)

const userStore = useUserStore()

// 设置图表的配置项
const optionInsertValue = ref()
const optionInsert: echarts.EChartsOption = {
  color: ['#FF9E64'], // 全局颜色设置
  title: {
    text: '{icon|} 物流统计',
    left: 'left',
    textStyle: {
      rich: {
        icon: {
          backgroundColor: {
            image: insertChart, // 替换为实际图片路径
          },
          width: 24, // 图片宽度
          height: 24, // 图片高度
        },
        title: {
          color: '#fff', // 标题颜色
          fontSize: 20, // 标题字体大小
          fontWeight: 'bold', // 标题字体粗细
        },
      },
    },
  },
  xAxis: {
    type: 'category',
    data: Logistics_Company.map((item) => item.label),
  },
  yAxis: {
    type: 'value',
  },
  // FF9E64
  series: [
    {
      data: [0, 0, 0, 0, 0, 0, 0, 0, 0],
      type: 'bar',
    },
  ],
}

// 表格
const urgencyColumns = ref([
  {
    title: '订单编号',
    dataIndex: 'order_number',
    key: 'order_number',
    ellipsis: true,
  },
  {
    title: '类型',
    dataIndex: 'product_type',
    key: 'product_type',
    ellipsis: true,
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    key: 'status',
    ellipsis: true,
  },
])

const waiteOutColumns = ref([
  {
    title: '订单编号',
    dataIndex: 'order_number',
    key: 'order_number',
    ellipsis: true,
  },
  {
    title: '订单类型',
    dataIndex: 'product_type',
    key: 'product_type',
    ellipsis: true,
  },
  {
    title: '产品图片',
    dataIndex: 'product_effect_url',
    key: 'product_effect_url',
    ellipsis: true,
  },
  {
    title: '客户名称',
    dataIndex: 'customer_name',
    key: 'customer_name',
    ellipsis: true,
  },
  {
    title: '提货方式',
    dataIndex: 'outbound_type',
    key: 'outbound_type',
    ellipsis: true,
  },
  {
    title: '车牌号',
    dataIndex: 'license_plate',
    key: 'license_plate',
    width: 220,
    ellipsis: true,
  },
])

const {
  loading: loadingDtail,
  data: statusStatic,
  runAsync: runStatusStatistics,
} = useRequest(orderApi.statusStatistics)

// 表格数据
const {
  dataList: urgencyList,
  getDataList: getUrgencyDataList,
  loading: loadingUrgency,
  pageForm: urgencyPageForm,
} = useList(
  orderApi.urgentOrders,
  {
    order_number: undefined,
    start_date: undefined,
    end_date: undefined,
    status: undefined,
  },
  () => {
    console.log('订单列表', urgencyList.value)
  }
)
const urgencyTableChange: TableProps<any>['onChange'] = (pagination) => {
  urgencyPageForm.limit = pagination.pageSize || 10
  getUrgencyDataList({
    pages: pagination.current,
  })
}
// 表格数据
const {
  dataList: waiteOutList,
  getDataList: getwaiteOutDataList,
  loading: loadingWaiteOut,
  pageForm: waiteOutPageForm,
} = useList(
  orderApi.waitOuteOrders,
  {
    search: undefined,
    outbound_type: undefined,
    limit: 9999
  },
  () => {
    console.log('订单列表222', waiteOutList.value)
  }
)
const waiteOutTableChange: TableProps<any>['onChange'] = (pagination) => {
  waiteOutPageForm.limit = pagination.pageSize || 10
  getwaiteOutDataList({
    pages: pagination.current,
  })
}

const handleSearch = () => {
  getwaiteOutDataList({ ...waiteOutPageForm, page: 1 })
}

const showBarChart = (logisticsStatic: any) => {
  const keyArr = Logistics_Company.map((item) => item.value)
  console.log('物流统计', logisticsStatic, keyArr)
  // 初始化结果数组为0
  const result = keyArr.map((key) => {
    const matchingEntry = logisticsStatic.find((entry: any) => entry.logistics_company === key)
    return matchingEntry ? matchingEntry.order_count : 0
  })

  optionInsert.series[0].data = result
  optionInsertValue.value.setOption(optionInsert)
  console.log('result', optionInsert)
}
const getLogisticsStatistics = async () => {
  const res = await orderApi.logisticsStatistics()
  showBarChart(res.data)
}

// 修改车牌号
const updateCarNum = ref()
const saveCarNum = async (record: any) => {
  // 调用修改车牌号的接口
  let res = await orderApi.licensePlateUpdate(record.order_number, {
    license_plate: updateCarNum.value,
  })
  console.log('修改车牌号响应', res)

  if (res) {
    message.success('修改车牌号成功')
    getwaiteOutDataList()
  }
  record.editCarNum = false
}

watch(
  () => userStore.sseMassageData, // 监听 state.value
  (newValue: any, oldValue) => {
    runStatusStatistics()
    if (newValue.operation === 'urgent_order') {
      getUrgencyDataList()
    }
    if (newValue.operation === 'production_done') {
      getwaiteOutDataList()
    }
    if (newValue.operation === 'outbound_verify') {
      getLogisticsStatistics()
    }
    console.log('sse数据改变', newValue)
  }
)

onMounted(async () => {
  // 初始化 ECharts 图表实例
  optionInsertValue.value = echarts.init(chartExpressageRef.value)
  // 监听点击事件
  optionInsertValue.value?.on('click', function (params: { dataIndex: any; data: any; name: any }) {
    // params 中包含了点击的数据项信息
    console.log('点击的柱状图信息:', params)

    // 获取点击的柱状图的索引和数据
    const index = params.dataIndex // 被点击的柱状图的索引
    const value = params.data // 被点击的柱状图的数值
    const category = params.name // 对应的类别（x轴数据）

    console.log('对应的物流公司', Logistics_Company[index])
    router.replace('/order/outbound-statistics')
  })

  // 获取订单数量统计
  // waiteOutPageForm.offset = 5
  Promise.all([
    runStatusStatistics(),
    getUrgencyDataList(),
    getLogisticsStatistics(),
    getwaiteOutDataList(),
  ])
})
</script>

<style scoped lang="less">
.workbench {
  .order-statistics {
    padding-bottom: 32px;
    display: flex;

    align-items: center;
    justify-content: space-between;
    .statistics {
      height: 90px;
      box-sizing: border-box;
      display: flex;
      align-items: center;

      .icon-box {
        // width: 100px;
        // height: 100px;
        width: 90px;
        height: 90px;
        background: #fff;
        margin-right: 12px;
        border-radius: 12px;
        display: flex;
        align-items: center;
        justify-content: center;
        .home-icon {
          width: 56px;
          height: 56px;

          &--urgency {
            color: #e44833;
          }
          &--accept {
            color: #fa9200;
          }
          &--awaitOut {
            color: #626dd9;
          }
          &--execution {
            color: #009cf8;
          }
          &--out {
            color: #2fe9a2;
          }
        }
      }

      .text-box {
        .label {
          color: @text3;
          font-size: 16px;
          line-height: 22px;
        }
        .value {
          color: #101014;
          font-size: 32px;
          line-height: 22px;
          font-weight: bold;
          margin-top: 16px;
        }
      }
    }
  }
  .content-statistics {
    display: flex;
    width: calc(90% - 32px);
    align-items: stretch; /* 确保子元素高度一致 */
    .left {
      width: 60%;
      flex-shrink: 0;
      .left-top {
        background-color: #fff;
        padding: 19px 24px;
        height: 305px;
        border-radius: 12px;
        box-sizing: border-box;
        .title {
          position: relative;

          margin-bottom: 26px;
          .title-content {
            display: flex;
            gap: 20px;
            align-items: center;
            .title-text {
              font-size: 20px;
              font-weight: bold;
              line-height: 28px;
            }
            .search-input {
              width: 220px;
              height: 36px;
            }
            .shipment_Types {
              width: 130px;
              height: 36px;
              :deep(.ant-select-selector) {
                height: 36px;
                align-items: center;
              }
            }
          }
          .rectangle {
            position: absolute;
            left: -24px;
            top: 0;
            height: 28px;
            color: #000;
          }
          .mark {
            position: absolute;
            right: -24px;
            top: -19px;
          }
        }
        .productImg {
          width: 63px;
          max-height: 36px;
        }
        .car-num {
          display: flex;
          align-items: center;
          .edit-btn {
            display: block;
            text-align: center;
            margin-left: 12px;
            width: 24px;
            padding: 0;
            line-height: 22px;
          }
          .save-btn {
            display: block;
            text-align: center;
            margin-left: 12px;
            font-size: 14px;
            width: 40px;
            padding: 0 4px;
            line-height: 22px;
          }
        }
      }
      .left-bottom {
        width: 100%;
        box-sizing: border-box;
        margin-top: 32px;
        height: 346px;
        background: #fff;
        padding: 12px 20px;
        border-radius: 12px;
      }
    }
    .right {
      height: 685px;
      flex-shrink: 1;
      box-sizing: border-box;
      margin-left: 32px;
      width: calc(100% - 60% - 64px);
      background-color: #fff;
      border-radius: 12px;
      padding: 19px 24px;
      min-width: 580px;
      .title {
        position: relative;
        font-size: 20px;
        font-weight: bold;
        line-height: 28px;
        margin-bottom: 26px;
        .rectangle {
          position: absolute;
          left: -24px;
          top: 0;
          height: 28px;
          color: #000;
        }
        .mark {
          position: absolute;
          right: -24px;
          top: -19px;
        }
      }
      .state {
        padding: 4px 8px;
        color: #fff;
        border-radius: 8px;
        &--1 {
          background: @warning;
        }
        &--2 {
          background: @link;
        }
        &--3 {
          background: #ffc107;
        }
        &--4 {
          background: @success;
        }
      }
    }
  }
}
</style>
