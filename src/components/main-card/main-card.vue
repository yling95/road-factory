<template>
  <div id="container" class="container" :style="styleValue">
    <div class="main">
      <div ref="refConfModuleHeader" class="header">
        <div class="header-title">
          <slot name="Slot-Header" extra="页面的标题等">
            <span class="title-text">{{ props.title }}</span>
          </slot>
        </div>

        <div v-if="props.showPageTools" class="tools">
          <slot name="Slot-Tools-Left" extra="页面的筛序组件和按钮等"></slot>
          <slot name="Slot-Tools-Right" extra="页面的筛序组件和按钮等"></slot>
        </div>
      </div>

      <div ref="refConfModuleContent" class="content">
        <!-- <vue-scroll @handle-scroll="handleScroll"> -->
        <div class="_container">
          <slot name="Slot-Content" extra="页面的具体内容等"></slot>
        </div>
        <slot name="default" extra="页面的具体内容等"></slot>
        <!-- </vue-scroll> -->
      </div>
    </div>
    <slot name="Batch-Operate"> </slot>
  </div>
</template>

<script setup lang="ts" name="g-conf-module">
import { onMounted, reactive, ref, nextTick, defineProps } from 'vue'

interface TsProps {
  showPageTools?: boolean
  loading?: boolean
  title?: string
}

const props = withDefaults(defineProps<TsProps>(), {
  showPageTools: false,
  loading: false,
  title: '',
})

const styleValue = reactive({
  '--header-height': '84px',
  '--main-height': '0px',
  '--border-bottom': '1px solid transparent',
})

const refConfModuleHeader = ref(null)
const refConfModuleContent = ref(null)

// const handleScroll = (vertical: Record<string, any>): void => {
//   styleValue['--border-bottom'] =
//     vertical.scrollTop > 5 ? '1px solid rgba(211, 211, 211, 0.2)' : '1px solid transparent'
// }

defineExpose({
  styleValue,
})

onMounted(() => {
  const observer = new ResizeObserver((entries) => {
    styleValue['--header-height'] = (entries[0].target as HTMLDivElement).offsetHeight + 'px'

    nextTick(() => {
      if (refConfModuleContent.value) {
        styleValue['--main-height'] =
          (refConfModuleContent.value as HTMLDivElement).offsetHeight + 'px'
      }
    })
  })

  observer.observe(refConfModuleHeader.value!)
})
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;
  .main {
    width: 100%;
    height: 100%;
    padding: 0 32px;
    border-radius: 16px;
    background: #fff;

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 20px 0;

      .header-title {
        display: flex;
        align-items: center;

        .title-text {
          font-size: 20px;
          font-weight: bold;
        }
      }

      .tools {
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-height: 44px;
      }
    }

    .content {
      // 减去的 1px 是顶部在页面处于滚动的情况下,出现的borderBottom宽度
      height: calc(100% - var(--header-height));
      width: 100%;
      // height: calc(100% - 20px);
      overflow-y: auto;
      ._container {
        margin: 0 40px;
      }
    }
  }
  // .batch-operate {
  //   position: absolute;
  //   bottom: 0;
  //   height: 80px;
  //   width: 100%;
  //   background: #fff;
  //   box-shadow: 0 -5px 2px rgba(0, 0, 0, 0.1);
  // }
}
</style>
