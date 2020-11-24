import { createRouter, createWebHistory } from 'vue-router'

import notFound from '@admin/views/site/NotFound'
import siteIndex from '@admin/views/site/Index'
import siteLogin from '@admin/views/site/Login'
import siteProfile from '@admin/views/site/Profile'

import adminRoute from './admin/admin'
import adminLogRoute from './admin/admin-log'
import adminGroupRoute from './admin/group'

import userRoute from './user/user'
import userAddressRoute from './user/address'

import shopCategoryRoute from './shop/category'
import shopBrandRoute from './shop/brand'
import shopProductRoute from './shop/product'

import districtRoute from './district/district'

import cmsCategoryRoute from './cms/category'
import cmsArticleRoute from './cms/article'

import AdminLayout from '@admin/components/AdminLayout'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: siteLogin,
    meta: {
      title: '登录',
    },
  },
  {
    path: '/',
    component: AdminLayout,
    children: [
      {
        path: '',
        redirect: '/home',
      },
      {
        path: '/home',
        name: 'Home',
        component: siteIndex,
        meta: {
          affix: true,
          title: '首页',
        },
      },
      {
        path: '/profile',
        name: 'Profile',
        component: siteProfile,
        meta: {
          title: '个人资料',
        },
      },
      ...adminRoute,
      ...adminLogRoute,
      ...adminGroupRoute,
      ...userRoute,
      ...userAddressRoute,
      ...shopBrandRoute,
      ...shopProductRoute,
      ...shopCategoryRoute,
      ...districtRoute,
      ...cmsCategoryRoute,
      ...cmsArticleRoute,
      {
        path: '/:pathMatch(.*)*',
        component: notFound,
        meta: {
          title: '页面未找到',
        },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(process.env.VUE_APP_PUBLIC_PATH),
  routes: routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return { el: to.hash, behavior: 'smooth' }
    }

    return { left: 0, top: 0 }
  },
})

export default router
