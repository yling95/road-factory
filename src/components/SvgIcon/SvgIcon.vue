<template>
  <svg :class="`svg-icon ${className}`" aria-hidden="true">
    <use :href="`#icon-${name}`"></use>
  </svg>
</template>

<script lang="ts" setup>
import { defineProps } from 'vue'

defineProps({
  name: {
    type: String,
    required: true,
  },
  className: {
    type: String,
    default: '',
  },
})
</script>

<style>
.svg-icon {
  width: 18px;
  height: 18px;
  fill: currentColor;
}
</style>
