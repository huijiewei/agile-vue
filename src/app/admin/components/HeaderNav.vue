<template>
  <nav class="ag-nav">
    <div class="nav-left">
      <i
        :class="[
          'trigger',
          'trigger-left',
          isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold',
        ]"
        :title="isCollapsed ? '展开侧边栏' : '收缩侧边栏'"
        @click="toggleSidebar"
      />
      <i
        :class="[
          'trigger',
          'trigger-right',
          isCollapsed ? 'el-icon-s-unfold' : 'el-icon-s-fold',
        ]"
        @click="toggleSidebar"
      />
    </div>
    <breadcrumb class="nav-left" />
    <div class="nav-left nav-refresh">
      <i
        class="trigger el-icon-refresh-right"
        @click="handleRefresh"
        title="重载页面"
      ></i>
    </div>
    <ul v-if="currentUser" class="nav nav-right">
      <li class="profile">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="el-dropdown-link">
            <ag-avatar :src="currentUser.avatar" />
            <span class="ag-display">
              {{ currentUser.name || currentUser.phone }}
            </span>
            <i class="el-icon-arrow-down el-icon--right" />
          </span>
          <template #dropdown>
            <el-dropdown-menu class="profile-dropdown-menu">
              <el-dropdown-item disabled>
                {{ currentUser.adminGroup.name }}
              </el-dropdown-item>
              <el-dropdown-item command="userProfile" divided>
                <i class="el-icon-user" />
                个人资料
              </el-dropdown-item>
              <el-dropdown-item command="userRefresh">
                <i class="el-icon-refresh" />
                刷新资料
              </el-dropdown-item>
              <el-dropdown-item command="userLogout" divided>
                <i class="el-icon-switch-button" />
                退出登陆
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </li>
    </ul>
  </nav>
</template>

<script>
import AgAvatar from '../../../shared/components/Avatar'
import Breadcrumb from '@admin/components/Breadcrumb'
import { useStore } from 'vuex'
import { inject } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useRefreshUser } from '@admin/hooks/useRefreshUser'

export default {
  name: 'HeaderNav',
  components: { AgAvatar, Breadcrumb },
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
    currentUser: {
      type: Object,
      default: null,
    },
  },
  setup() {
    const store = useStore()
    const router = useRouter()
    const route = useRoute()
    const httpClient = useHttpClient()
    const { refreshUser } = useRefreshUser()

    const handleRefresh = inject('reload')

    const toggleSidebar = async () => {
      await store.dispatch('toggleSidebar')
    }

    const logout = async () => {
      const { data } = await httpClient.post('auth/logout')

      if (data) {
        await store.dispatch('auth/logout')

        ElMessage({
          type: 'success',
          duration: 1000,
          message: data.message,
          onClose: () => {
            router.push({
              path: '/login',
              query: { direct: route.fullPath },
            })
          },
        })
      }
    }

    const handleCommand = async (command) => {
      if (command === 'userLogout') {
        await logout()

        return
      }

      if (command === 'userProfile') {
        await router.push({
          path: '/profile',
        })
      }

      if (command === 'userRefresh') {
        await refreshUser()
      }
    }

    return {
      handleRefresh,
      toggleSidebar,
      handleCommand,
    }
  },
}
</script>

<style lang="less">
.ag-nav {
  position: relative;

  @media (min-width: 992px) {
    i.trigger-right {
      display: none !important;
    }
  }
  @media (max-width: 991px) {
    i.trigger-left {
      display: none !important;
    }
  }

  i.trigger {
    font-size: 16px;
    line-height: 50px;
    cursor: pointer;
    transition: all 0.3s, padding 0s;
    padding: 0 17px;

    &:hover {
      background: #e6f7ff;
    }
  }

  i.trigger-right {
    float: right;
  }

  .nav {
    display: flex;
    list-style: none;
    margin: 0;
  }

  .ag-breadcrumb {
    line-height: 50px;
    margin-left: 9px;
    margin-bottom: 0;
  }

  .nav-left {
    float: left;
  }

  .nav-refresh {
    margin-left: 12px;
  }

  .nav-right {
    float: right;
    flex-direction: row;
    align-items: center;
    justify-content: end;

    .profile {
      span.el-dropdown-link {
        display: block;
        padding: 9px 16px;
        cursor: pointer;
        transition: color 0.1s linear 0s, background-color 0.1s linear 0s,
          opacity 0.2s linear 0s !important;

        .ag-display {
          display: inline-block;
          margin-left: 3px;
        }
      }
    }
  }
}

.profile-dropdown-menu {
  .el-dropdown-menu__item.is-disabled {
    text-align: center;
  }
}
</style>
