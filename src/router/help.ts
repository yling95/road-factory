import storage from '@/utils/storage'
import { type RouteRecordRedirectOption } from 'vue-router'

export const hasAuth = (route: any): boolean => {
  const auth = (route.meta?.auth as string | string[]) || ''
  if (!auth) {
    return true
  }
  const authList = storage.get('authList') || []
  if (typeof auth === 'string') {
    return authList.includes(auth)
  } else {
    return auth.some(authItem => authList.includes(authItem))
  }
}

// 重定向第一级有权限的子菜单
export const redirectPath: RouteRecordRedirectOption = to => {
  const routes = to.matched.at(-1)?.children || []
  const hasAuthFirstItem = routes.find((route: any) => hasAuth(route)) || { path: '/login' }
  return hasAuthFirstItem.path
}
