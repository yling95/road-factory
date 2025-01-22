<template>
  <div class="second-card">
    <div class="title">
      <a-button type="text" class="back-btn" @click="router.go(-1)"
        ><i class="ri-arrow-go-back-line"></i
      ></a-button>
      <span class="title-text">{{ props.title }}</span>
    </div>
    <div class="content">
      <a-spin :spinning="props.loading">
        <slot name="default"></slot>
      </a-spin>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'
import { useRouter } from 'vue-router'
const router = useRouter()

interface TsProps {
  showPageTools?: boolean
  title?: string
  loading?: boolean
}
const props = withDefaults(defineProps<TsProps>(), {
  showPageTools: false,
  title: '',
  loading: false,
})
</script>

<style scoped lang="less">
.second-card {
  width: 100%;
  height: 100%;
  background: #fff;
  border-radius: 16px;
  .title {
    display: flex;
    align-items: center;
    height: 32px;
    padding: 32px 24px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    padding-bottom: 32px;
    .back-btn {
      line-height: 20px;
      font-size: 20px;
      margin-right: 18px;
      font-weight: 500;
    }
    .title-text {
      font-size: 20px;
      font-weight: bold;
    }
  }
  .content {
    height: calc(100% - 64px);
    overflow: auto;
    padding: 32px 24px;
  }
}
</style>
