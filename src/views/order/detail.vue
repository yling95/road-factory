<template>
  <SecondCard :title="'订单详情'" :loading="loadingDtail || loadingFlow">
    <div class="detail-content">
      <div class="info-wrap">
        <div class="info-title">基本信息:</div>
        <div class="info-content">
          <div class="detial-item wrap-4">
            <span class="label">订单编号：</span>
            <span class="value">{{ orderDetail.order_number }}</span>
          </div>
          <div class="detial-item wrap-4">
            <span class="label">订单状态：</span>
            <span
              :class="['value', 'order-state-text', `order-state-text--${orderDetail.status}`]"
              >{{ findLabelByValue(Order_Status_Types, orderDetail.status) }}</span
            >
          </div>
          <div class="detial-item wrap-4">
            <span class="label">订单类型：</span>
            <span class="value">{{
              findLabelByValue(Product_Types, orderDetail.product_type)
            }}</span>
          </div>
          <div class="detial-item wrap-4">
            <span class="label">客户名称：</span>
            <span class="value">{{ orderDetail.customer_name }}</span>
          </div>

          <div class="detial-item wrap-2">
            <span class="label">产品图：</span>
            <span class="value">
              <a-image
                v-if="orderDetail.sample_img_url"
                :src="getImgUrlByUrl(orderDetail.sample_img_url)"
                :height="220"
                :width="160"
                class="sample-img"
                alt=""
              />
              <span v-else>无</span>
            </span>
          </div>
          <div class="detial-item wrap-2">
            <span class="label">产品信息：</span>
            <span class="value product">
              <p><span>品名及规格</span><span>数量</span><span>单位</span><span>仓库</span></p>
              <p v-for="(item, index) in orderDetail.product_info" :key="index">
                <span>{{ item.name }}</span
                ><span>{{ item.count }}</span
                ><span>{{ item.unit }}</span>
                <span>{{ findLabelByValue(Store_Base, item.warehouse) }} </span>
              </p>
            </span>
          </div>
        </div>
      </div>
      <div class="info-wrap">
        <div class="info-title">订单跟踪:</div>
        <div class="info-content">
          <div class="detial-item wrap-2">
            <span class="label">预计出货日期：</span>
            <span class="value">{{
              orderDetail.outbound_plan_time
                ? dayjs(orderDetail.outbound_plan_time).format('YYYY-MM-DD')
                : '无'
            }}</span>
          </div>
          <div class="detial-item wrap-2">
            <span class="label">出库方式：</span>
            <span class="value">{{
              orderDetail.outbound_type
                ? findLabelByValue(Shipment_Types, orderDetail.outbound_type)
                : '无'
            }}</span>
          </div>
          <div class="detial-item wrap-2">
            <span class="label">制作完成实物图：</span>
            <span class="value">
              <div v-if="!orderDetail.product_effect_url">无</div>
              <div v-else>
                <a-image
                  v-if="isImage(orderDetail.product_effect_url)"
                  :src="getImgUrlByUrl(orderDetail.product_effect_url)"
                  :height="220"
                  :width="160"
                  class="sample-img"
                  alt=""
                />

                <video
                  v-if="isVideo(orderDetail.product_effect_url)"
                  :src="getImgUrlByUrl(orderDetail.product_effect_url)"
                  controls
                  width="300"
                ></video>
              </div>
            </span>
          </div>
          <div class="detial-item wrap-2">
            <span class="label">出库仓：</span>
            <span class="value">{{
              orderDetail.delivery_info?.details?.warehouse
                ? findLabelByValue(Store_Base, orderDetail.delivery_info.details?.warehouse)
                : '无'
            }}</span>
          </div>

          <div class="detial-item wrap-2">
            <span class="label">收货信息：</span>
            <span class="value">
              <div class="shouhuo" v-if="orderDetail.delivery_info">
                <div class="title" v-if="orderDetail.outbound_type === 'self_pickup'">
                  <span class="label">车牌号:</span>
                  <span>{{ orderDetail?.delivery_info.details.license_plate }}</span>
                </div>
                <div v-if="orderDetail.outbound_type === 'logistics'">
                  <div class="title">
                    <span class="label">物流公司:</span>
                    <span>{{
                      findLabelByValue(
                        Logistics_Company,
                        orderDetail.delivery_info.details?.logistics_company,
                      )
                    }}</span>
                  </div>
                  <div class="title">
                    <span class="label">收货地址:</span>
                    <span>{{ orderDetail.delivery_info.details?.delivery_address }}</span>
                  </div>
                  <div class="title">
                    <span class="label">收货人:</span>
                    <span
                      >{{ orderDetail.delivery_info.details?.recipient_name }}（{{
                        orderDetail.delivery_info.details?.recipient_phone
                      }}）</span
                    >
                  </div>
                  <div class="title">
                    <span class="label">发货人:</span>
                    <span
                      >{{ orderDetail.delivery_info.details?.sender_name }}（{{
                        orderDetail.delivery_info.details?.sender_phone
                      }}）</span
                    >
                  </div>
                </div>

                <div class="title">
                  <span class="label">备注:</span>
                  <span>{{ orderDetail.delivery_info.remarks }}</span>
                </div>
              </div>
              <span v-else>无</span>
            </span>
          </div>
          <div class="detial-item wrap-2">
            <span class="label">出库证明：</span>
            <span class="value">
              <!-- 判断文件类型并展示图片或视频 -->
              <div v-if="!orderDetail.delivery_verify_url">无</div>
              <div v-else>
                <a-image
                  v-if="isImage(orderDetail.delivery_verify_url)"
                  :src="getImgUrlByUrl(orderDetail.delivery_verify_url)"
                  :height="220"
                  :width="160"
                  class="sample-img"
                  alt=""
                />
                <video
                  v-if="isVideo(orderDetail.delivery_verify_url)"
                  :src="getImgUrlByUrl(orderDetail.delivery_verify_url)"
                  controls
                  width="160"
                ></video>
              </div>
            </span>
          </div>
          <div class="detial-item">
            <span class="label">实际出库时间：</span>
            <span class="value">{{
              orderDetail.delivery_verify_time
                ? dayjs(orderDetail.delivery_verify_time).format('YYYY-MM-DD HH:mm:ss')
                : '无'
            }}</span>
          </div>
        </div>
      </div>
      <div class="info-wrap">
        <div class="info-title">订单流水:</div>
        <div class="info-content">
          <a-steps progress-dot :current="-1" direction="vertical" :items="flowList"></a-steps>
        </div>
      </div>
    </div>
  </SecondCard>
</template>

<script lang="ts" setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRequest } from 'vue-request'
import { useRoute } from 'vue-router'
import { orderApi } from '@/services/api'
import { findLabelByValue, getImgUrlByUrl } from '@/utils/common'
import {
  Operate_types,
  Order_Status_Types,
  Product_Types,
  Shipment_Types,
  Store_Base,
  Logistics_Company,
} from '@/views/baseData'
import dayjs, { Dayjs } from 'dayjs'
import { isImage, isVideo } from '@/utils'

const route = useRoute()
const orderNum = route.params.id as string | number
const { loading: loadingDtail, data: detailData, runAsync: runDetail } = useRequest(orderApi.detail)
const { loading: loadingFlow, data: dataFlow, runAsync: runFlow } = useRequest(orderApi.flow)

const flowList = ref<any[]>([])
const orderDetail = ref({
  order_number: '',
  customer_name: '',
  status: '',
  product_type: '',
  sample_img_url: '',
  creator_name: '',
  remarks: '',
  product_effect_url: '',
  delivery_verify_url: '',
  outbound_type: '',
  outbound_plan_time: '',
  delivery_verify_time: '',
  delivery_info: {}, // 收货信息
})

onMounted(async () => {
  const flowRes = await runFlow(orderNum)
  const detailRes = await runDetail(orderNum)
  console.log('页面', detailRes)
  dataFlow.value?.data.forEach((item: any) => {
    const operateText = findLabelByValue(Operate_types, item.operation)
    console.log('操作---', operateText)

    const title = `${operateText}${(item.remarks ?? '') ? `--(备注：${item.remarks})` : ''}【${
      item.creator_name
    }】`
    const flowItem = {
      title,
      description: dayjs(item.create_time).format('YYYY-MM-DD HH:mm:ss'),
    }
    flowList.value.push(flowItem)
  })
  orderDetail.value = detailRes.data
  console.log('----', flowList.value)

  // Promise.all([runDetail(orderNum), runFlow(orderNum)]).then(() => {
  //   console.log('获取请求完成', dataDtail, dataFlow)
  // })
})
</script>

<style scoped lang="less">
.detail-content {
  // width: 700px;
  padding: 40px 180px;
  font-size: 16px;
  margin: 0 auto;

  .info-wrap {
    padding-bottom: 12px;
    border-bottom: 1px solid @border2;
    margin-bottom: 48px;
    width: 1240px;
    &:last-child {
      border-bottom: none;
    }
    .info-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 24px;
      position: relative;
      padding: 4px 0 4px 12px;
      &::after {
        content: '';
        display: block;
        width: 4px;
        height: 100%;
        background-color: @primary1;
        position: absolute;
        left: 0;
        top: 0;
        border-radius: 0 2px 2px 0;
      }
    }
    .info-content {
      display: flex;
      padding-left: 12px;
      gap: 0 36px;
      flex-wrap: wrap;
      .detial-item {
        flex-shrink: 0;
        display: flex;
        margin-bottom: 24px;
        width: 30%;
        .label {
          color: @text2;
          white-space: nowrap;
        }
        .value {
          color: @text1;
          margin-left: 4px;
          white-space: nowrap;
          .img {
            width: 220px;
          }
        }
        .shouhuo {
          width: 400px;
          flex-shrink: 0;
          border: 1px solid @border2;
          padding: 20px;
          background: #fbf7f2;
          border-radius: 8px;
          // height: 350px;
          .title {
            display: flex;
            margin-bottom: 12px;
            white-space: wrap;
            .label {
              white-space: nowrap;
              margin-right: 8px;
            }
          }
        }
        .product {
          flex-shrink: 0;
          width: 400px;
          border: 1px solid @border2;
          padding: 20px;
          background: #fbf7f2;
          border-radius: 8px;
          p {
            display: flex;
            margin-bottom: 8px;
            &:first-child {
              font-weight: bold;
              margin-bottom: 12px;
            }
            span {
              width: 60px;
              &:first-child {
                width: 220px;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
              }
            }
          }
        }
        &.wrap-4 {
          width: 20%;
        }
        &.wrap-2 {
          width: 46%;
        }
      }
    }
  }
}
</style>
