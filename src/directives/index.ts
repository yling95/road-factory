import { App } from 'vue'

import auth from './auth'
import clickCallFunction from './click-call-function'
import focus from './focus'
import trim from './trim'

const obj: Record<string, Object> = {
  clickCallFunction,
  auth,
  trim,
  focus
}

export default {
  install: (app: App<Element>) => {
    for (const key in obj) {
      app.directive(key, obj[key])
    }
  }
}
