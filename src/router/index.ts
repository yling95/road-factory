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
          menubar: '/workbench'
        },
        component: () => import('@/views/workbench/index.vue'),
      },
      {
        path: '/order/list',
        meta: {
          title: '订单列表',
          menubar: '/order/list'
        },
        component: () => import('@/views/order/list.vue'),
      },
      {
        path: '/order/add',
        meta: {
          title: '创建订单',
          menubar: '/order/list'
        },
        component: () => import('@/views/order/form-order.vue'),
      },
      {
        path: '/order/edit',
        meta: {
          title: '编辑订单',
          menubar: '/order/list'
        },
        component: () => import('@/views/order/form-order.vue'),
      },
      {
        path: '/order/detail/:id',
        meta: {
          title: '订单详情',
          menubar: '/order/list'
        },
        component: () => import('@/views/order/detail.vue'),
      },
      {
        path: '/order/outbound-statistics',
        meta: {
          title: '出库统计',
          menubar: '/order/outbound-statistics'
        },
        component: () => import('@/views/order/outbound-statistics.vue'),
      },
      {
        path: '/person/list',
        meta: {
          title: '人员列表',
          menubar: '/person/list'
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
      title: '登录',
      noAuth: true,
    },
    component: () => import('@/views/login/login.vue')
  },
  {
    path: '/404',
    meta: {
      title: '404',
      noAuth: true,
    },
    component: () => import('@/views/not-found.vue')
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

  // 1.判断路由是否需要校验权限（是否需要登录）
  if (to.meta.noAuth) return next()

  // 2.判断是否已经登录
  if (!token) return next('/login')

  const hasRoute = router.getRoutes().some(route => {
    // 将动态路由路径（如 /order/detail/:id）转换为正则表达式
    const dynamicPathRegex = new RegExp(
      route.path.replace(/:\w+/g, '\\w+') // 将 :id 替换为 \w+
    )
    return dynamicPathRegex.test(to.path) // 判断当前路径是否匹配路由
  })

  if (!hasRoute) {
    // 如果没有找到路由，跳转到 404 页面
    return next('/404')
  }
  next()


})

export default router
