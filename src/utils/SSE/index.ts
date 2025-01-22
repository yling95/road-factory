type messageCb = (code: number, message: string, data: any) => any
interface SSEOptions {
  messageCb: messageCb
}

export class SSE {
  url: string
  messageCb: messageCb | null
  timer: NodeJS.Timeout | null
  event: EventSource | null
  constructor(options?: SSEOptions) {
    this.messageCb = options ? options.messageCb : null
    this.timer = null
    this.event = null
    this.url = ''
  }
  // 开启链接
  selectAndLink(url?: string) {
    console.log('建立连接', url)

    this.timer && clearTimeout(this.timer)
    if (this.event) return
    url && (this.url = url)
    this.timer = setTimeout(() => {
      this.event = new EventSource(this.url)
      this.event.onerror = () => {
        console.log('sse失败')

        this.event?.close()
        this.event = null
      }

      this.event.onopen = () => {
        console.log('sse连接成功')
      }
      this.event.addEventListener('order_event', (event) => {
        const data = JSON.parse(event.data)
        this.messageCb && this.messageCb(data)
        // messageElement.innerHTML += `time:${data.time}, operation:${data.operation}` + '<br />'
        console.log('sse数据', data)
      })

    }, 500)
  }
  // 断开链接并清空code
  closeLink() {
    if (this.event === null) return
    this.event.close()
    this.event = null
  }
}
