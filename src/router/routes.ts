// import { isAuth } from '@/config'
import type { RouteRecordRaw } from 'vue-router'

export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'layouts',
    component: () => import('@/layouts/index.vue'),
    redirect: '/order-list',
    children: [
      {
        path: '/order-list',
        meta: {
          title: '订单列表',
          auth: true,
        },
        component: () => import('@/views/order-management/list.vue'),
      },
    ],
  },
  {
    path: '/login',
    component: () => import('@/views/login/login.vue')
    // beforeEnter: (_to, _from, next) => {
    //   const toHref = localStorage.getItem('to-href')
    //   if (!!toHref) {
    //     localStorage.removeItem('to-href')
    //     next(toHref)
    //   } else {
    //     next()
    //   }
    // },
  },
]
