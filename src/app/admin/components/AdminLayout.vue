<template>
  <section :class="['ag-app', isCollapsed ? 'ag-collapsed' : '']">
    <aside class="ag-aside">
      <div class="ag-logo">
        <router-link :to="{ path: '/home' }">
          <img alt="主页" src="../assets/images/logo.png" /><img
            alt="Boilerplate"
            src="../assets/images/banner-white.png"
          />
        </router-link>
      </div>
      <prefect-scrollbar
        :scroll-to="'li.el-menu-item.is-active'"
        :settings="{ suppressScrollX: true }"
        class="ag-scrollbar"
      >
        <sider-menu :is-collapsed="isCollapsed" />
      </prefect-scrollbar>
    </aside>
    <section class="ag-layout">
      <header class="ag-header">
        <header-nav :is-collapsed="isCollapsed" :current-user="currentUser" />
        <header-tab></header-tab>
      </header>
      <main class="ag-main">
        <router-view
          v-slot="{ Component }"
          :key="
            $route.meta && $route.meta.parent
              ? $route.meta.parent.path
              : $route.path
          "
          v-if="isRouterAlive"
        >
          <transition name="fade">
            <keep-alive :include="cachedTabs">
              <component :is="Component" /></keep-alive></transition
        ></router-view>
      </main>
    </section>
  </section>
</template>

<script>
import PrefectScrollbar from '../../../shared/components/PrefectScrollbar'
import HeaderNav from '@admin/components/HeaderNav'
import SiderMenu from '@admin/components/SiderMenu'
import HeaderTab from '@admin/components/HeaderTab'
import { provide, ref, nextTick, computed, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useRoute } from 'vue-router'
import { useRefreshUser } from '@admin/hooks/useRefreshUser'

export default {
  name: 'AdminLayout',
  components: { HeaderTab, PrefectScrollbar, HeaderNav, SiderMenu },
  setup() {
    const store = useStore()
    const route = useRoute()
    const { refreshUser } = useRefreshUser()

    const isRouterAlive = ref(true)

    onBeforeMount(async () => {
      if (!store.getters['auth/getCurrentUser']) {
        await refreshUser()
      }
    })

    const isCollapsed = computed(() => {
      return store.getters['isSidebarCollapsed']
    })

    const cachedTabs = computed(() => {
      return store.getters['tabs/getCached']
    })

    const currentUser = computed(() => {
      return store.getters['auth/getCurrentUser']
    })

    provide('reload', async () => {
      const cacheNames = [route.name]

      if (route.meta.parent) {
        cacheNames.push(route.meta.parent.name)
      }

      await store.dispatch('tabs/deleteCache', cacheNames)

      isRouterAlive.value = false

      await nextTick()

      isRouterAlive.value = true

      await store.dispatch('tabs/updateCache', cacheNames)
    })

    return {
      isRouterAlive,
      isCollapsed,
      cachedTabs,
      currentUser,
    }
  },
}
</script>

<style lang="less">
@import '../../../shared/assets/styles/mixin.less';
@aside-width: 220px;
@aside-collapsed-width: 60px;
@aside-background-color: #2c343f;

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter,
.fade-leave-active {
  opacity: 0;
}

.ag-app {
  display: flex;
  flex: auto;
  flex-direction: row;
  background: #f4f8fb;
  min-height: 100vh;

  &.ag-collapsed {
    .ag-aside {
      width: @aside-collapsed-width;
    }

    .ag-layout {
      margin-left: @aside-collapsed-width;
    }

    .ag-header {
      width: calc(~'100% - ' @aside-collapsed-width);
    }
  }

  .ag-aside {
    position: fixed;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.01);
    top: 0;
    left: 0;
    width: @aside-width;
    z-index: 10;
    height: 100vh;
    background-color: @aside-background-color;

    .ag-logo {
      text-align: center;
      height: 50px;
      line-height: 50px;

      a {
        text-decoration: none;
      }

      img {
        vertical-align: middle;
        height: 39px;
        display: inline-block;
      }
    }

    .ag-scrollbar {
      height: calc(100vh - 50px);
    }

    .el-menu {
      background-color: @aside-background-color;

      .el-menu-item,
      .el-submenu__title {
        color: #fff;
        &:hover,
        &:focus {
          background-color: #ffd04b;
        }
      }
    }
  }

  .ag-layout {
    position: relative;
    margin-left: @aside-width;
    display: flex;
    flex: auto;
    flex-direction: column;
    overflow: hidden;
  }

  .ag-header {
    position: fixed;
    width: calc(~'100% - ' @aside-width);
    z-index: 10;
    right: 0;

    .ag-nav {
      .clearfix();
      background: #fff;
      box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.02);
    }
  }

  .ag-main {
    padding: 92px 16px 20px 16px;

    .box {
      background: #fff;
      min-height: calc(100vh - 152px);
      padding: 20px;
      box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.02);

      .box-header {
        border-bottom: 1px solid #ddd;
        margin-bottom: 20px;
        padding-bottom: 13px;

        h4 {
          font-size: 14px;
          font-weight: normal;
        }

        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          margin: 0;
        }
      }
    }
  }
}
</style>
