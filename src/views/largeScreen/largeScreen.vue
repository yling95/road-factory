<template>
  <div class="largeScreen">
    <div class="header">
      <div class="left">
        <img src="@/assets/logo.png" @click="backToSystem" />
        <span class="title-text system-name">大路通</span>
        <span class="title-text">数据大屏</span>
      </div>
      <div class="right">
        <span class="date">{{ currentTime.format('YYYY-MM-DD') }}</span>
        <span class="week">{{ weekMap[currentTime.day()] }}</span>
        <span class="time">{{ currentTime.format('HH:mm') }}</span>
      </div>
    </div>
    <div class="content">
      <div class="mid">
        <div class="order shadow-box">
          <div class="title">
            <SvgIcon name="pick-order" className="title-icon" />
            <span class="title-text">自提订单</span>
          </div>
          <div class="carousel-container">
            <div class="empty-data" v-if="!selfPickupOrders.length">暂无自提订单</div>
            <div class="order-card carousel-content" ref="carouselRef" v-else>
              <div class="card carousel-box" v-for="item in selfPickupOrders" :key="item">
                <div class="card-top">
                  <span class="car-num"> {{ item.license_plate }} </span>
                  <span class="order-num"
                    >{{ item.customer_name }}（{{
                      item.order_number.slice(0, 3) + '***' + item.order_number.slice(-2)
                    }}）
                  </span>
                </div>
                <div class="card-content">
                  <div class="product-list-title">
                    <span class="name">商品</span>
                    <span class="numUnit">数量/单位</span>
                  </div>
                  <div class="product-list">
                    <div class="product-li" v-for="itemTwo in item.product_info" :key="itemTwo">
                      <span class="name-val">{{ itemTwo.name }}</span>
                      <span class="numUnit-val">*{{ itemTwo.count }}{{ itemTwo.unit }}</span>
                    </div>
                    <a-image
                      v-if="item.sample_img_url"
                      :src="getImgUrlByUrl(item.sample_img_url)"
                      :height="50"
                      width="100%"
                      class="sample-img"
                      alt=""
                    />
                  </div>
                </div>

                <div class="remark">
                  <div class="remark-label">备注</div>
                  <div class="remark-text">
                    {{ item.remarks }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="logistics static shadow-box">
          <div class="title">
            <SvgIcon name="align-item-left-fill" className="title-icon" />
            <span class="title-text">物流统计</span>
            <a-date-picker
              v-model:value="logisticsTime"
              @change="getLogisticsStatistics"
              class="date-picker"
              :disabled-date="disabledDate"
            />
          </div>
          <div ref="logisticsRef" class="chart-box"></div>
        </div>
        <div class="order-static static shadow-box">
          <div class="title">
            <SvgIcon name="pie_chart" className="title-icon" />
            <span class="title-text">订单状态占比</span>
            <a-date-picker
              v-model:value="ordersTime"
              class="date-picker"
              @change="getStatusStatistics"
              :disabled-date="disabledDate"
            />
          </div>
          <div ref="orderStaticRef" class="chart-box"></div>
        </div>
      </div>
      <div class="bottom">
        <div class="order-table">
          <div class="title">
            <img src="@/assets/images/workbench/Rectangle.png" class="rectangle" />
            <div class="title-text">加急订单</div>
            <img src="@/assets/images/workbench/mark.png" class="mark" />
          </div>
          <a-table
            :columns="normalOrderColumns"
            :dataSource="urgncyDataList"
            :pagination="false"
            :scroll="{ y: 250 }"
          >
            <template #bodyCell="{ column, record }">
              <div v-if="column.key === 'status'">
                <span :class="['order-state', `order-state--${record.status}`]">
                  {{ findLabelByValue(Order_Status_Types, record.status) }}
                </span>
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
        <div class="order-table">
          <div class="title">
            <img src="@/assets/images/workbench/Rectangle.png" class="rectangle" />
            <div class="title-text">正常订单</div>
            <img src="@/assets/images/workbench/mark.png" class="mark" />
          </div>
          <a-table
            :columns="normalOrderColumns"
            :dataSource="normalOrderList"
            :pagination="false"
            :scroll="{ y: 250 }"
          >
            <template #bodyCell="{ column, record }">
              <div v-if="column.key === 'status'">
                <span :class="['order-state', `order-state--${record.status}`]">
                  {{ findLabelByValue(Order_Status_Types, record.status) }}
                </span>
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
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted, onUnmounted, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useRequest } from 'vue-request'
import dayjs from 'dayjs'
import type { Dayjs } from 'dayjs'
import * as echarts from 'echarts'
import { findLabelByValue, getImgUrlByUrl } from '@/utils/common'
import { orderApi } from '@/services/api'
import { baseURL } from '@/request'
import { SSE } from '@/utils/SSE'
import { Order_Status_Types, Logistics_Company, Product_Types } from '../baseData'

const router = useRouter()

let timer: any // 定义定时器
const currentTime = ref<any>(dayjs())
const openTimeInterval = () => {
  timer = setInterval(() => {
    currentTime.value = dayjs()
  }, 1000)
}
const logisticsTime = ref<Dayjs>(dayjs())
const ordersTime = ref<Dayjs>(dayjs())
const weekMap = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
// 订单滚动逻辑
const carouselRef = ref<HTMLDivElement | null>(null) // 获取 DOM 节点
let carouselTimer: any = null
const selfPickupOrders = ref<any[]>([]) // 盒子内容
const startCarousel = () => {
  if (!carouselRef.value) return
  if (selfPickupOrders.value.length < 4) return

  const boxWidth = carouselRef.value.children[0].clientWidth // 单个盒子的宽度

  carouselTimer = setInterval(() => {
    // 向左滚动一个盒子宽度
    carouselRef.value!.style.transform = `translateX(-${boxWidth}px)`

    // 平滑动画结束后，将第一个盒子移到末尾
    setTimeout(() => {
      if (!carouselRef.value) return

      // 重新排序盒子
      const firstBox = selfPickupOrders.value.shift()
      if (firstBox) selfPickupOrders.value.push(firstBox)

      // 重置位置
      carouselRef.value.style.transition = 'none' // 暂停过渡
      carouselRef.value.style.transform = 'translateX(0)'
      void carouselRef.value.offsetWidth // 强制回流，重置动画状态
      carouselRef.value.style.transition = 'transform 0.5s ease' // 恢复过渡效果
    }, 500) // 与 CSS 动画时间同步
  }, 10000) // 每 10 秒滚动一次
}
const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer)
    timer = null
  }
}

// 禁用今天之后的日期
const disabledDate = (current: any) => {
  return current && dayjs(current).isAfter(dayjs().startOf('day'))
}

// 物流统计
const logisticsRef = ref<HTMLDivElement | null>(null)
const optionLogistics: echarts.EChartsOption = {
  color: ['#FF9E64'], // 全局颜色设置
  grid: {
    left: 0, // 左边距为 0
    right: 10, // 右边距为 0
    top: 10, // 上边距
    bottom: 10, // 下边距
    containLabel: true, // 自动包含标签，防止溢出
  },
  xAxis: {
    type: 'value',
    min: 0, // 设置 Y 轴最小值
    max: 40, // 设置 Y 轴最大值
    interval: 5, // 设置 Y 轴刻度间隔
    splitLine: {
      show: true, // 显示网格线

      lineStyle: {
        color: 'rgba(24, 24, 24, 0.25)', // 设置网格线颜色
        type: 'solid', // 可选值：'solid' | 'dashed' | 'dotted'
      },
    },
  },
  yAxis: {
    type: 'category',
    data: Logistics_Company.map((item) => item.label),
    axisTick: {
      show: true, // 显示刻度
      lineStyle: {
        color: 'rgba(24, 24, 24, 0.25)', // 设置刻度颜色为蓝色
        width: 1, // 设置刻度线宽度
      },
    },
    axisLine: {
      show: true, // 显示左侧轴线
      lineStyle: {
        color: 'rgba(24, 24, 24, 0.25)', // 设置轴线颜色为红色
        width: 2, // 设置轴线宽度
        type: 'solid', // 可选值：'solid' | 'dashed' | 'dotted'
      },
    },
  },
  series: [
    {
      data: [120, 200, 150, 80, 70, 110, 130, 110, 130],
      type: 'bar',
      label: {
        show: true, // 显示标签
        position: 'right', // 标签显示在柱子顶部
        color: '#000', // 标签颜色
        fontSize: 12, // 标签字体大小
        formatter: (params: any) => {
          // 自定义标签内容
          return params.value === 0 ? '' : params.value // 如果值为 0，显示“无数据”
        },
      },
    },
  ],
}
const logisticsChart = ref()

// 订单占比统计
const orderStaticRef = ref<HTMLDivElement | null>(null)
const optionOrderStatic: echarts.EChartsOption = {
  tooltip: {
    trigger: 'item',
  },
  title: {
    text: '100', // 中间展示的统计总数
    subtext: '订单总数', // 显示副标题（可选）
    left: 'center', // 水平居中
    top: 'center', // 垂直居中
    textStyle: {
      fontSize: 30, // 总数字体大小
      color: 'rgba(16, 16, 20, 0.95)', // 副标题颜色
      fontWeight: 'bold', // 总数字体加粗
    },
    subtextStyle: {
      fontSize: 14, // 副标题字体大小
    },
  },
  legend: {
    orient: 'vertical', // 垂直布局
    right: 10, // 图例距离右侧的距离
    top: 'center', // 图例垂直居中
    itemWidth: 12, // 图例图标宽度
    itemHeight: 12, // 图例图标高度
    itemGap: 12,
    textStyle: {
      fontSize: 14, // 图例文字大小
    },
    padding: [0, 0, 0, 40], // 上右下左的内边距
  },
  series: [
    {
      type: 'pie',
      radius: ['35%', '60%'],
      center: ['50%', '50%'],
      avoidLabelOverlap: false,
      label: {
        show: false,
        position: 'center',
      },
      emphasis: {
        label: {
          show: false,
          position: 'outside', // 设置标签位置为扇区外部
          fontSize: 14,
          fontWeight: 'bold',
        },
      },
      labelLine: {
        show: false,
      },

      data: [
        { value: 1048, name: '加急', itemStyle: { color: '#E44833' } },
        { value: 1048, name: '待接受', itemStyle: { color: '#FA9200' } },
        { value: 735, name: '执行中', itemStyle: { color: '#009CF8' } },
        { value: 580, name: '待出库', itemStyle: { color: '#626DD9' } },
        { value: 484, name: '已出库', itemStyle: { color: '#2FE9A2' } },
      ],
    },
  ],
}
const orderStaticChart = ref()

const normalOrderColumns = ref([
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
    title: '产品图片',
    dataIndex: 'sample_img_url',
    key: 'sample_img_url',
    ellipsis: true,
  },
  {
    title: '订单状态',
    dataIndex: 'status',
    key: 'status',
    ellipsis: true,
  },
])

const showPieChart = (statusStatic: any) => {
  optionOrderStatic.series[0].data = [
    {
      value: statusStatic?.urgent_count,
      name: `加急(${statusStatic?.urgent_count})`,
      itemStyle: { color: '#E44833' },
    },
    {
      value: statusStatic?.wait_exec_count,
      name: `待接受(${statusStatic?.wait_exec_count})`,
      itemStyle: { color: '#FA9200' },
    },
    {
      value: statusStatic?.in_exec_count,
      name: `执行中(${statusStatic?.in_exec_count})`,
      itemStyle: { color: '#009CF8' },
    },
    {
      value: statusStatic?.wait_outbound_count,
      name: `待出库(${statusStatic?.wait_outbound_count})`,
      itemStyle: { color: '#626DD9' },
    },
    {
      value: statusStatic?.outbound_done_count,
      name: `已出库(${statusStatic?.outbound_done_count})`,
      itemStyle: { color: '#2FE9A2' },
    },
  ]
  optionOrderStatic.title.text =
    statusStatic?.wait_exec_count +
    statusStatic?.in_exec_count +
    statusStatic?.wait_outbound_count +
    statusStatic?.outbound_done_count
  orderStaticChart.value.setOption(optionOrderStatic)
}
const showBarChart = (logisticsStatic: any) => {
  const keyArr = Logistics_Company.map((item) => item.value)
  console.log('物流统计', logisticsStatic, keyArr)
  // 初始化结果数组为0
  const result = keyArr.map((key) => {
    const matchingEntry = logisticsStatic.find((entry: any) => entry.logistics_company === key)
    return matchingEntry ? matchingEntry.order_count : 0
  })
  optionLogistics.series[0].data = result
  logisticsChart.value.setOption(optionLogistics)
}

const getSelfPickupOrder = async () => {
  const res = await orderApi.selfPickupOrders()
  selfPickupOrders.value = res.data.data_list
}

const getStatusStatistics = async () => {
  const params = {
    query_date: ordersTime.value ? ordersTime.value.format('YYYY-MM-DD') : undefined,
  }
  const res = await orderApi.statusStatistics(params)
  showPieChart(res.data)
}
const getLogisticsStatistics = async () => {
  console.log('66')

  const params = {
    query_date: logisticsTime.value ? logisticsTime.value.format('YYYY-MM-DD') : undefined,
  }
  const res = await orderApi.logisticsStatistics(params)
  showBarChart(res.data)
}
// 获取加急订单列表
const urgncyDataList = ref()
const getUrgencyDataList = async () => {
  const res = await orderApi.urgentOrders({ limit: 9999, page: 1 })
  urgncyDataList.value = res.data.data_list
}
// 获取正常订单列表
const normalOrderList = ref()
const getNormalDataList = async () => {
  const res = await orderApi.normalOrders({ limit: 9999, page: 1 })
  normalOrderList.value = res.data.data_list
}

// SSE
const sse = new SSE({
  messageCb: (message: any) => {
    console.log('SSE====', message)
    getStatusStatistics()
    if (message.operation === 'create_order') {
      getNormalDataList()
    }
    if (message.operation === 'upload_delivery') {
      getSelfPickupOrder()
    }
    if (message.operation === 'urgent_order') {
      getUrgencyDataList()
    }
    if (message.operation === 'outbound_verify') {
      getLogisticsStatistics()
    }
  },
})
// 建立连接
sse.selectAndLink(`${baseURL}/sse/connect`)

onMounted(async () => {
  // 初始化 ECharts 图表实例
  logisticsChart.value = echarts.init(logisticsRef.value)
  orderStaticChart.value = echarts.init(orderStaticRef.value)
  // 使用配置项渲染图表
  await Promise.all([
    getSelfPickupOrder(),
    getStatusStatistics(),
    getLogisticsStatistics(),
    getUrgencyDataList(),
    getNormalDataList(),
  ])
  nextTick(() => {
    openTimeInterval()
    startCarousel() // 开始滚动
  })
})

const backToSystem = () => {
  router.replace('/')
}
onUnmounted(() => {
  clearInterval(timer)
  clearInterval(carouselTimer)
  stopCarousel()
  sse.closeLink()
})
</script>

<style scoped lang="less">
.largeScreen {
  background: #f2eae1;
  min-width: 1920px;
  min-height: 100vh;
  .header {
    display: flex;
    padding: 14px 32px;
    align-items: center;
    height: 80px;
    box-sizing: border-box;
    justify-content: space-between;
    border-bottom: 1px solid @border2;
    .left {
      display: flex;
      align-items: center;
      img {
        width: 82px;
        height: 49px;
        margin-right: 8px;
        cursor: pointer;
      }
      .title-text {
        font-family: 'AlimamaFangYuan';
        font-size: 22px;
        font-weight: bold;
        &.system-name {
          color: @primary1;
        }
      }
    }
    .right {
      color: @text1;
      font-size: 24px;
      display: flex;
      align-items: center;
      .week {
        margin-left: 12px;
      }
      .time {
        font-size: 32px;
        font-weight: bold;
        margin-left: 32px;
        color: #181818;
      }
    }
  }
  .content {
    height: calc(100% - 80px);
    box-sizing: border-box;
    padding: 27px 32px;
    .mid {
      display: flex;
      gap: 22px;

      .order {
        flex: 1;
        box-sizing: border-box;
        width: 916px;
      }
      .static {
        width: 448px;
        box-sizing: border-box;
        position: relative;
        .chart-box {
          width: 400px;
          height: 325px;
        }
        .date-picker {
          position: absolute;
          right: 24px;
          width: 135px;
          top: 14px;
        }
      }
      .shadow-box {
        border-radius: 12px;
        height: 396px;
        padding: 14px 24px;
        background: linear-gradient(315deg, #ffffff 0%, #fff6ed 100%);
        box-shadow: 0px 0px 6px 0px rgba(48, 51, 58, 0.15);
        .title {
          display: flex;
          align-items: center;
          font-size: 20px;
          gap: 12px;
          padding-bottom: 20px;
          .title-icon {
            width: 24px;
            height: 24px;
          }
          .title-text {
            color: @text2;
            font-weight: 600;
          }
        }
      }
    }
    .bottom {
      display: flex;
      gap: 24px;
      margin-top: 24px;
      .order-table {
        flex-shrink: 0;
        height: 400px;
        border-radius: 12px;
        box-sizing: border-box;
        width: 916px;
        padding: 14px 24px;
        background: linear-gradient(315deg, #ffffff 0%, #fff6ed 100%);
        box-shadow: 0px 0px 6px 0px rgba(48, 51, 58, 0.15);
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
      }
    }
  }

  .carousel-container {
    max-width: 880px; /* 容器宽度 */
    overflow: hidden; /* 隐藏超出部分 */
    .empty-data {
      width: 880px;
      height: 324px;
      text-align: center;
      display: flex;
      align-items: center;
      justify-content: center;
      color: @text2;
    }
    .carousel-content {
      display: flex; /* 水平排列盒子 */
      transition: transform 0.5s ease; /* 平滑过渡效果 */
      will-change: transform; /* 提高动画性能 */
      gap: 20px;

      .carousel-box {
        width: 244px;
        height: 324px;
        box-sizing: border-box;
        background: #fff;
        border-radius: 16px;
        padding: 8px 12px;
        .card-top {
          display: flex;
          padding: 8px 0;
          justify-content: space-between;
          border-bottom: 1px solid @border1;
          margin-bottom: 12px;
          .car-num {
            font-size: 22px;
            font-weight: bold;
          }
          .order-num {
            font-size: 14px;
            color: @text2;
          }
        }
        .card-content {
          height: 200px;
          border-bottom: 1px solid @border1;
          .product-list-title {
            display: flex;
            height: 42px;
            box-sizing: border-box;
            align-items: center;
            justify-content: space-between;
            padding: 7px 0 15px 0;

            .name {
              width: 32px;
              height: 26px;
              background: @primary1;
              font-size: 14px;
              padding: 2px;
              text-align: center;
              line-height: 26px;
              display: block;
              color: #fff;
              border-radius: 4px;
            }
            .numUnit {
              font-size: 14px;
              color: @text4;
            }
          }
          .product-list {
            height: 158px;
            overflow-y: auto;
            .product-li {
              display: flex;
              justify-content: space-between;
              color: @text1;
              .name-val {
                max-width: 220px;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
              }
              margin-bottom: 12px;
            }
          }
        }
        .remark {
          margin-top: 12px;
          display: flex;
          align-items: center;
          height: 26px;
          .remark-label {
            background: #626dd9;
            width: 32px;
            height: 26px;
            padding: 2px;
            color: #fff;
            font-size: 14px;
            text-align: center;
            line-height: 26px;
            border-radius: 4px;
            flex-shrink: 0;
            margin-right: 14px;
          }
          .remark-text {
            font-size: 14px;
            color: @text2;
            width: 300px; /* 设置容器宽度 */
            overflow: hidden; /* 隐藏超出内容 */
            text-overflow: ellipsis; /* 显示省略号 */
            display: -webkit-box; /* 兼容 WebKit 的多行显示方式 */
            -webkit-line-clamp: 2; /* 限制显示两行 */
            -webkit-box-orient: vertical; /* 规定文本垂直布局 */
            word-break: break-word; /* 自动换行 */
          }
        }
      }
    }
  }
}
</style>
