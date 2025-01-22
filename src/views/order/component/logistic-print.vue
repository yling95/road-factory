<template>
  <a-modal
    v-model:visible="deliveryInfoVisible"
    :ok-text="'打印'"
    @ok="saveAndPrint"
    @cancel="saveAndPrintClose"
  >
    <!-- v-if="!printBase64"  -->
    <div class="logistics-tickt" id="printArea" v-if="!printBase64" ref="printAreaRef">
      <div class="title">发货</div>
      <div class="logistics">
        物流：{{
          findLabelByValue(Logistics_Company, detailData?.delivery_info.details.logistics_company)
        }}{{ printLogisticNum }}
      </div>
      <div class="dress">收货地址：{{ detailData?.delivery_info.details.delivery_address }}</div>
      <div class="peron">
        发货人：{{ detailData?.delivery_info.details.sender_name
        }}{{ detailData?.delivery_info.details.sender_phone }}
      </div>
      <div class="peron">
        收货人：{{ detailData?.delivery_info.details.recipient_name
        }}{{ detailData?.delivery_info.details.recipient_phone }}
      </div>
      <div class="product-title">
        <span class="name">品名及规格</span>
        <span class="count">数量</span>
        <span class="unit">单位</span>
      </div>
      <div class="product-li" v-for="(item, index) in detailData?.product_info" :key="index">
        <span class="name">{{ item.name }}</span>
        <span class="count">{{ item.count }}</span>
        <span class="unit">{{ item.unit }}</span>
      </div>

      <div class="info-remark">备注：{{ detailData?.delivery_info.remarks }}</div>
      <div class="info-store">
        {{ findLabelByValue(Store_Base, detailData?.delivery_info.details.warehouse) }}
      </div>
      <div class="time">{{ currentTime.format('YYYY-MM-DD HH:mm:ss') }}</div>
    </div>
    <img :src="printBase64" style="margin: 0 auto; display: block" v-else />
  </a-modal>
</template>

<script lang="ts" setup>
import { ref, onUnmounted, nextTick } from 'vue'
import dayjs from 'dayjs'
import { orderApi } from '@/services/api'
import { findLabelByValue } from '@/utils/common'
import { Logistics_Company, Store_Base } from '@/views/baseData'
import html2canvas from 'html2canvas'
import { log } from 'console'

const deliveryInfoVisible = ref(false)
const detailData = ref()
const printLogisticNum = ref()
let timer: any // 定义定时器
const currentTime = ref<any>(dayjs())
const openTimeInterval = () => {
  timer = setInterval(() => {
    currentTime.value = dayjs()
  }, 1000)
}
const clearInterValTimer = () => {
  clearInterval(timer)
  timer = null
}

const printBase64Image = (base64Image: string) => {
  // 创建一个隐藏的 iframe
  const iframe = document.createElement('iframe')
  iframe.style.position = 'absolute'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = 'none'
  document.body.appendChild(iframe)

  // 获取 iframe 的文档对象
  const iframeDoc = iframe.contentWindow.document

  // 写入打印内容到 iframe 中
  iframeDoc.open()
  iframeDoc.write('<html><head><title>打印图片</title>')

  // 设置打印样式，确保打印时只打印一页，且图片自适应页面
  iframeDoc.write('<style>')
  iframeDoc.write('@page { size: auto; margin: 0mm; }') // 去除页面边距
  iframeDoc.write(
    '@media print { body { margin: 0; padding: 0; height: 100%; overflow: hidden; } }',
  ) // 去除页面外边距和内边距，强制去掉滚动条
  iframeDoc.write('html, body { height: 100%; }') // 强制页面占满高度
  iframeDoc.write(
    'img { width: 100%; height: 100%; object-fit: contain; page-break-before: always; }',
  ) // 图片自适应页面
  iframeDoc.write('</style>')

  iframeDoc.write('</head><body>')

  // 插入 Base64 图片
  iframeDoc.write('<img src="' + base64Image + '" alt="Image" />')

  iframeDoc.write('</body></html>')
  iframeDoc.close()

  // 调用打印
  iframe.contentWindow.print()

  // 打印后移除 iframe
  document.body.removeChild(iframe)
}

// 打印物流单
const saveAndPrint = () => {
  printBase64Image(printBase64.value)
}
const saveAndPrintClose = () => {
  clearInterValTimer()
}

const printBase64 = ref()
const printAreaRef = ref()
const divToImg = async () => {
  const element = document.getElementById('printArea')
  console.log('element', element, printAreaRef.value)

  try {
    // 使用 html2canvas 生成 Canvas
    const canvas = await html2canvas(element, {
      useCORS: true, // 如果图片有跨域，需要启用此选项
    })

    // 将 Canvas 转为图片
    const imgData = canvas.toDataURL('image/png')

    // 创建一个隐藏的 a 标签用于下载图片
    const a = document.createElement('a')
    a.href = imgData // Base64 图片地址
    a.download = 'saved-image.png' // 图片保存时的文件名
    printBase64.value = imgData

    // 模拟点击下载
    // document.body.appendChild(a) // 添加到 DOM
    // a.click() // 触发点击事件
    // document.body.removeChild(a) // 移除 a 标签

    console.log('图片已保存到本机', imgData)

    // 打开新的窗口并打印图片
    // const newWindow = window.open('', '', 'width=287,height=491')
    // newWindow.document.write(`<img src="${imgData}" style="width:100%;"/>`)
    // newWindow.document.close()
    // newWindow.focus()
    // newWindow.print()
    // newWindow.close()
  } catch (error) {
    console.error('打印失败', error)
  }
}

const getOrderDetail = async (orderNumber: string | number) => {
  const resDetail = await orderApi.detail(orderNumber)
  detailData.value = resDetail.data
}
const getLogisticsPrinNum = async (orderNumber: string | number) => {
  const res = await orderApi.getLogisticsPrinNum(orderNumber)
  printLogisticNum.value = res.data.logistics_number
}

const open = async (orderNumber: any) => {
  console.log('open', orderNumber)
  printBase64.value = ''

  const results = await Promise.all([getOrderDetail(orderNumber), getLogisticsPrinNum(orderNumber)])
  console.log('所有任务执行完成', results)
  deliveryInfoVisible.value = true
  nextTick(() => {
    divToImg()
  })
  openTimeInterval()
}

defineExpose({ open })

onUnmounted(() => {
  clearInterValTimer()
})
</script>

<style scoped lang="less">
.logistics-tickt {
  width: 287px;
  height: 491px;
  padding: 12px 18px;
  box-sizing: border-box;
  margin: 0 auto;
  font-size: 17px;
  .title {
    font-size: 24px;
    padding-top: 10px;
    text-align: center;
    line-height: 24px;
  }
  .logistics {
    text-align: right;
    margin-bottom: 8px;
  }
  .dress {
    font-size: 19px;
    margin-bottom: 4px;
  }
  .product-title {
    margin-top: 14px;
  }
  .product-li {
    font-size: 16px;
  }
  .product-title,
  .product-li {
    display: flex;
    .name {
      display: block;
      width: 220px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .count {
      display: block;
      width: 50px;
      text-align: center;
    }
    .unit {
      display: block;
      width: 50px;
      text-align: center;
    }
  }
  .info-remark {
    margin-top: 20px;
    display: -webkit-box; /* 必须加 */
    -webkit-box-orient: vertical; /* 设置垂直排列 */
    overflow: hidden; /* 内容超出隐藏 */
    -webkit-line-clamp: 2; /* 限制行数为2 */
    line-clamp: 2; /* 非标准属性，部分现代浏览器支持 */
  }
  .info-store {
    text-align: right;
  }
  .time {
    text-align: right;
  }
}
</style>
