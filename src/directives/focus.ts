/**
 * 聚集
 */
export default {
  mounted(el: HTMLElement & { value: string }) {
    if (el.tagName === 'INPUT') {
      el.focus()
    }
  }
}
