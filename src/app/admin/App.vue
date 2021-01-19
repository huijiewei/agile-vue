<template>
  <div id="app">
    <router-view></router-view>
    <login-modal v-if="loginModalShowed"></login-modal>
  </div>
</template>

<script>
import { getCurrentInstance, provide } from 'vue'
import LoginModal from '@admin/components/LoginModal'
import { useSplash } from '@shared/hooks/useSplash'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'

let lastErrorMessage = ''
let lastLoginAction = ''

export default {
  name: 'App',
  components: { LoginModal },
  storeSubscribe: null,
  computed: {
    loginModalShowed: function () {
      return !this.isLogin
    },
  },
  beforeCreate() {
    this.$store.dispatch('auth/init')
    this.$store.dispatch('tabs/init')
  },
  data() {
    return {
      isLogin: true,
    }
  },
  methods: {
    showLoginModal(action) {
      if (lastLoginAction === action) {
        return
      }

      lastLoginAction = action

      if (action === 'modal') {
        this.isLogin = false
        return
      }

      this.isLogin = true

      if (action === 'direct') {
        const router = this.$router
        const loginUrl = '/login'

        this.$message({
          message: '需要登录才能访问',
          type: 'warning',
          duration: 2000,
        })

        if (router.currentRoute.path === loginUrl) {
          router.replace(router.currentRoute.fullPath)
        } else {
          router.replace({
            path: loginUrl,
            query: { direct: router.currentRoute.fullPath },
          })
        }
      }
    },
    showErrorMessage(error) {
      if (error.message.length > 0 && error.message !== lastErrorMessage) {
        lastErrorMessage = error.message

        const currentPath = this.$router.currentRoute.path
        const isHome = currentPath === '/' || currentPath === '/home'

        this.$alert(error.message, {
          center: true,
          confirmButtonText: error.historyBack ? '返回' : '确定',
          type: 'warning',
          showClose: false,
          callback: () => {
            lastErrorMessage = ''
            this.$store.dispatch('clearError')

            if (error.historyBack === true && !isHome) {
              this.historyBack(null, false, true)
            }
          },
        })
      }
    },
  },
  setup() {
    useSplash()

    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const { ctx } = getCurrentInstance()

    provide(
      'historyBack',
      async (to = null, force = false, closeTab = false) => {
        if (closeTab) {
          const next = await store.dispatch('tabs/close', {
            name: route.name,
            path: route.path,
          })

          if (to == null) {
            to = next
          }
        }

        if ((!force || to === null) && ctx.$routerHistory.hasPrevious()) {
          await router.replace(ctx.$routerHistory.previous())
        } else {
          if (to == null) {
            to = { path: '/home' }
          } else if (typeof to === 'string') {
            to = { path: to }
          }

          await router.replace(to)
        }
      }
    )
  },
  mounted() {
    this.storeSubscribe = this.$store.subscribe((mutation) => {
      if (mutation.type === 'TOGGLE_ERROR') {
        this.showErrorMessage(mutation.payload)
      }

      if (mutation.type === 'auth/TOGGLE_LOGIN_ACTION') {
        this.showLoginModal(mutation.payload)
      }
    })
  },
  unmounted() {
    if (this.storeSubscribe) {
      this.storeSubscribe()
    }
  },
}
</script>

<style lang="less">
@import '../../shared/assets/styles/base.less';
@import './assets/styles/style.less';
</style>
