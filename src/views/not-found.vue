<template>
  <a-result class="result" status="404" title="404" sub-title="找不到页面">
    <template #extra>
      <a-button type="primary" @click="router.replace('/')">首页</a-button>
    </template>
  </a-result>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>

<style lang="less" scoped></style>
