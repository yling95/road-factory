import { type Code, CODE_OPTIONS } from './code'

type MessageCb = (code: Code, text: string) => any
type ErrorCb = (error: Event) => any
interface SSEOptions {
  messageCb?: MessageCb
  errorCb?: ErrorCb
}

export class SSE {
  url: string
  messageCb: MessageCb | null
  errorCb: ErrorCb | null
  event: EventSource | null

  constructor(options: SSEOptions) {
    this.messageCb = options.messageCb || null
    this.errorCb = options.errorCb || null
    this.event = null
    this.url = ''
  }

  // 开启链接
  selectAndLink(url?: string) {
    if (this.event) {
      return
    }

    url && (this.url = url)

    this.event = new EventSource(this.url)
    this.event.onopen = () => { }
    this.event.onerror = event => {
      console.log('SSE链接失败')
      this.event = null
      this.errorCb && this.errorCb(event)
    }
    this.event.onmessage = e => {
      const { code } = JSON.parse(e.data) as { code: Code }
      if (code === 'SYSTEM-100000') {
        console.log('SSE首次返回正常')
        return
      }
      const text = CODE_OPTIONS[code]
      this.messageCb && this.messageCb(code, text)
    }
  }
  // 断开链接并清空code
  closeLink() {
    if (this.event === null) {
      return
    }
    this.event.close()
    this.event = null
  }
}
