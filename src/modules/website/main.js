import Vue from 'vue'

import App from './App.vue'

Vue.config.productionTip = false

export function createApp() {
  const app = new Vue({
    render: (h) => h(App),
  })
  return { app }
}
