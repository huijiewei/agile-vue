import Vue from 'vue'

import ElementUI from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

import router from './router'
import store from './store'

import App from './App.vue'

import HttpClient from '@core/plugins/HttpClient'
import AclChecker from './plugins/AclChecker'
import DeleteDialog from './plugins/DeleteDialog'

Vue.use(ElementUI)

Vue.use(HttpClient, {
  apiHost: process.env.VUE_APP_ADMIN_API_HOST,
  store,
  router,
  loginUrl: '/login',
  loginDispatch: 'auth/showLoginModal',
  accessTokenGetter: 'auth/getAccessToken',
  errorMessageDispatch: 'setErrorMessage'
})

Vue.use(AclChecker, {
  store
})

Vue.use(DeleteDialog, {
  MessageBox: ElementUI.MessageBox
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#root')
