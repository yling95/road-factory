/**
 * 去除输入框前后空格
 */
export default {
  mounted(el: HTMLElement & { value: string }) {
    const eventListener = (el: any) => {
      if (!el) return
      el.addEventListener('blur', () => {
        el.value = el.value.trim()
        el.dispatchEvent(new Event('input'))
      })
    }

    if (el.tagName === 'INPUT') {
      /* INPUT元素 */
      eventListener(el)
    } else if (el.tagName === 'TEXTAREA') {
      /* TEXTAREA元素 */
      eventListener(el)
    } else {
      /* 其他元素 */
      const inputDom = el.querySelector('input')
      const textareaDom = el.querySelector('textarea')
      inputDom && eventListener(inputDom)
      textareaDom && eventListener(textareaDom)
    }
  }
}
