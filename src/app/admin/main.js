import { createApp } from 'vue'
import queryString from 'query-string'

import ElementPlus from 'element-plus'
import 'element-plus/lib/theme-chalk/index.css'

import router from './router'
import store from './store'

import App from './App.vue'

import './registerServiceWorker'

import DeleteDialog from './plugins/DeleteDialog'
import PermissionCheck from './plugins/PermissionCheck'

import { createHttpClient } from '@core/plugins/HttpClient'

const app = createApp(App)

app.use(ElementPlus)

app.use(createHttpClient(), {
  getApiHost: () => {
    return document
      .querySelector('meta[name="api-host"]')
      .getAttribute('content')
  },
  getAccessToken: () => {
    return store.getters['auth/getAccessToken']
  },
  setLoginAction: async (action) => {
    await store.dispatch('auth/setLoginAction', action)
  },
  setErrorMessage: async (message, historyBack) => {
    await store.dispatch('setError', {
      message: message,
      historyBack: historyBack,
    })
  },
  paramsSerializer: function (params) {
    return queryString.stringify(params, {
      arrayFormat: process.env.VUE_APP_QS_ARRAY_FORMAT || 'bracket',
    })
  },
})

app.use(PermissionCheck, {
  store,
})

app.use(DeleteDialog, {
  MessageBox: ElementPlus.MessageBox,
})

app.mixin({
  data: function () {
    return {
      tinymceUrl: process.env.VUE_APP_TINYMCE_URL,
      tinymceLanguageUrl: process.env.VUE_APP_TINYMCE_LANGUAGE_URL,
    }
  },
})

app.use(store)
app.use(router)
app.mount('#root')
