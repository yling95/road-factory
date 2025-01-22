export default {
  /**
   * inserted：被绑定元素插入父节点时调用
   * el：指令所绑定的元素，可以用来直接操作 DOM
   * binding.value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
   */
  mounted(el: HTMLElement, binding: any) {
    const value: Function = binding.value
    if (!value) {
      throw new Error('缺少唯一指令')
    }
    // 监听点击事件
    el.addEventListener('click', () => {
      value()
    })
  },
  unMounted(el: HTMLElement, binding: any) {
    const value: Function = binding.value
    if (!value) {
      throw new Error('缺少唯一指令')
    }
    // 监听点击事件
    el.removeEventListener('click', () => {
      value()
    })
  }
}
