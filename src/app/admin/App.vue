<template>
  <router-view></router-view>
  <login-modal v-if="!isLogin"></login-modal>
</template>

<script>
import { getCurrentInstance, onMounted, onUnmounted, provide, ref } from 'vue'
import LoginModal from '@admin/components/LoginModal'
import { useSplash } from '@shared/hooks/useSplash'
import { useStore } from 'vuex'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

let lastErrorMessage = ''
let lastLoginAction = ''

export default {
  name: 'App',
  components: { LoginModal },
  setup() {
    useSplash()

    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const { ctx } = getCurrentInstance()

    store.dispatch('auth/init')
    store.dispatch('tabs/init')

    const isLogin = ref(true)

    const showLoginModal = (action) => {
      if (lastLoginAction === action) {
        return
      }

      lastLoginAction = action

      if (action === 'modal') {
        isLogin.value = false
        return
      }

      isLogin.value = true

      if (action === 'direct') {
        const loginUrl = '/login'

        ElMessage.warning({
          message: '需要登录才能访问',
          duration: 2000,
        })

        if (route.path === loginUrl) {
          router.replace(route.fullPath)
        } else {
          router.replace({
            path: loginUrl,
            query: { direct: route.fullPath },
          })
        }
      }
    }

    const showErrorMessage = (error) => {
      if (error.message.length > 0 && error.message !== lastErrorMessage) {
        lastErrorMessage = error.message

        const currentPath = route.path
        const isHome = currentPath === '/' || currentPath === '/home'

        ctx.$alert(error.message, {
          center: true,
          confirmButtonText: error.historyBack ? '返回' : '确定',
          type: 'warning',
          showClose: false,
          callback: () => {
            lastErrorMessage = ''
            store.dispatch('clearError')

            if (error.historyBack === true && !isHome) {
              historyBack(null, false, true)
            }
          },
        })
      }
    }

    const historyBack = async (to = null, force = false, closeTab = false) => {
      if (closeTab && to == null) {
        to = await store.dispatch('tabs/close', {
          name: route.name,
          path: route.path,
        })
      }

      if ((!force || to === null) && ctx.$routerHistory.hasPrevious()) {
        to = ctx.$routerHistory.previous()
      } else {
        if (to == null) {
          to = { path: '/home' }
        } else if (typeof to === 'string') {
          to = { path: to }
        }
      }

      await router.replace({
        path: to.path,
        query: to.query,
      })
    }

    provide('historyBack', historyBack)

    let storeUnsubscribe = null

    onMounted(() => {
      storeUnsubscribe = store.subscribe((mutation) => {
        if (mutation.type === 'TOGGLE_ERROR') {
          showErrorMessage(mutation.payload)
        }

        if (mutation.type === 'auth/TOGGLE_LOGIN_ACTION') {
          showLoginModal(mutation.payload)
        }
      })
    })

    onUnmounted(() => {
      if (storeUnsubscribe) {
        storeUnsubscribe()
      }
    })

    return {
      isLogin,
    }
  },
}
</script>

<style lang="less">
@import '../../shared/assets/styles/base.less';
@import './assets/styles/style.less';
</style>
