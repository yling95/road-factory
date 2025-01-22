
import storage from '@/utils/storage'

const isOpenAuthCheck = process.env.NODE_ENV === 'production' ? true : true

export const checkKey = (key: string | string[]) => {
  // 是否开启校验
  if (!isOpenAuthCheck) return true

  const authList = storage.get('authList') || []
  if (key === '' || key.length === 0) {
    return true
  }
  if (typeof key === 'string') {
    return authList.includes(key)
  }
  return key.some(k => authList.includes(k))
}

export default {
  /**
   * inserted：被绑定元素插入父节点时调用
   * el：指令所绑定的元素，可以用来直接操作 DOM
   * binding.value：指令的绑定值，例如：v-my-directive="1 + 1" 中，绑定值为 2。
   */
  mounted(el: HTMLElement, binding: any) {
    const buttonKey: string = binding.value
    // 代表某个元素需要通过权限验证
    if (buttonKey) {
      const hasKey = checkKey(buttonKey)
      if (!hasKey) {
        //没有权限
        el.remove() //删除按钮
      }
    } else {
      throw new Error('缺少唯一指令')
    }
  }
}
