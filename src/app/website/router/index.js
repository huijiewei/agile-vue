import Vue from 'vue'
import VueRouter from 'vue-router'
import DefaultLayout from '../components/DefaultLayout'
import SiteIndex from '../views/site/Index'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '',
        redirect: '/home',
      },
      {
        path: '/home',
        name: 'Home',
        component: SiteIndex,
        meta: {
          affix: true,
          title: '首页',
        },
      },
    ],
  },
]

const router = new VueRouter({
  base: '',
  mode: 'history',
  routes: routes,
  scrollBehavior: (to, from, savedPosition) => {
    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return { selector: to.hash }
    }

    return { x: 0, y: 0 }
  },
})

Vue.use(router)

export default router
