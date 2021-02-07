<template>
  <el-menu
    :collapse-transition="false"
    :router="true"
    :default-active="getActive"
    :collapse="isCollapsed"
    background-color="#2c343f"
    text-color="#fff"
    active-text-color="#ffd04b"
    @select="handleSelect"
  >
    <template v-for="(menu, index) in getMenus" :key="'m' + 1 + index">
      <sider-menu-item
        v-if="!menu.children"
        :menu="menu"
      />
      <sider-menu-sub
        v-else
        :menu="menu"
        :depth="1"
        :index="index"
      />
    </template>
  </el-menu>
</template>

<script>
import SiderMenuSub from './SiderMenuSub'
import SiderMenuItem from './SiderMenuItem'
import { useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'SiderMenu',
  components: {
    SiderMenuSub,
    SiderMenuItem,
  },
  props: {
    isCollapsed: {
      type: Boolean,
      default: false,
    },
  },
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const handleSelect = (index) => {
      router.push(index)
    }

    const getMenus = computed(() => {
      return store.getters['auth/getGroupMenus']
    })

    const getActive = computed(() => {
      const paths = route.path.split('/').filter((split) => split.length > 0)

      const pathTable = []

      for (let i = paths.length - 1; i >= 0; i--) {
        pathTable.push(paths.slice(0, i + 1))
      }

      for (let i = 0; i < pathTable.length; i++) {
        const url = pathTable[i].join('/')
        const find = store.getters['auth/isRouteInMenus'](url)

        if (find) {
          return '/' + url
        }
      }

      return route.path
    })

    return {
      getMenus,
      getActive,
      handleSelect,
    }
  },
}
</script>
<style lang="less">
.ag {
  .el-menu {
    border-right: none;
  }

  .el-submenu__title i,
  .el-menu-item i {
    color: #ffffff;
  }

  .el-menu-item,
  .el-submenu {
    .ag-icon {
      margin-right: 5px;
    }
  }

  .el-menu-item,
  .el-submenu__title {
    line-height: 50px;
    height: 50px;
  }

  .el-submenu .el-menu-item {
    line-height: 50px;
    height: 50px;
  }

  .el-submenu__icon-arrow {
    margin-top: -4px;
  }

  .el-menu--collapse {
    width: 100%;

    .is-opened {
      background: #fafbfc;
    }
  }

  .el-menu--popup {
    padding: 0;
    background: #fafbfc;
    border-radius: 1px;
    box-shadow: 2px 2px 2px rgba(0, 0, 0, 0.02);
  }

  .el-menu--popup-right-start {
    margin-left: 0;
    margin-right: 0;
  }
}
</style>
