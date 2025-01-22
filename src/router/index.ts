import { createRouter, createWebHistory, createWebHashHistory, type RouteRecordRaw } from 'vue-router'
// import { redirectPath } from './help'
import { useUserStore } from '@/stores/user'


export const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    component: () => import('@/layouts/index.vue'),
    redirect: '/workbench',
    children: [
      {
        path: '/workbench',
        meta: {
          title: '工作台',
        },
        component: () => import('@/views/workbench/index.vue'),
      },
      {
        path: '/order/list',
        meta: {
          title: '订单列表',
        },
        component: () => import('@/views/order/list.vue'),
      },
      {
        path: '/order/add',
        meta: {
          title: '创建订单',
        },
        component: () => import('@/views/order/form-order.vue'),
      },
      {
        path: '/order/edit',
        meta: {
          title: '编辑订单',
        },
        component: () => import('@/views/order/form-order.vue'),
      },
      {
        path: '/order/detail/:id',
        meta: {
          title: '订单详情',
        },
        component: () => import('@/views/order/detail.vue'),
      },
      {
        path: '/order/outbound-statistics',
        meta: {
          title: '出库统计',
        },
        component: () => import('@/views/order/outbound-statistics.vue'),
      },
      {
        path: '/person/list',
        meta: {
          title: '人员列表',
        },
        component: () => import('@/views/person/list.vue'),
      },
      // {
      //   path: '/no-auth',
      //   component: () => import('../view/no-auth.vue')
      // }
    ],
  },
  {
    path: '/login',
    meta: {
      title: '人员列表',
      noAuth: true,
    },
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
  {
    path: '/largeScreen',
    component: () => import('@/views/largeScreen/largeScreen.vue')
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes: routes

})

router.beforeEach((to, from, next) => {

  const { token } = useUserStore()
  console.log('路由', to.meta.noAuth, token)

  // const { isUpdateMenu } = useMenuStore()
  // 1.判断路由是否需要校验权限（是否需要登录）
  if (to.meta.noAuth) return next()
  console.log('2222')

  // 2.判断是否已经登录
  if (!token) return next('/login')
  next()
  console.log('333')
  // 3.判断是否需要更新菜单
  // if (isUpdateMenu) {
  //   // 加载菜单
  //   loadMenus(to, from, next)
  // } else {
  //   // 校验路由
  //   checkRoutes(to, from, next)
  // }
})

export default router
