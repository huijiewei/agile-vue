<template>
  <div class="ag-tab">
    <div class="tab-left tab-item" @click="handleScroll(220)">
      <i class="el-icon-arrow-left"></i>
    </div>
    <div class="tab-right tab-item" @click="handleScroll(-200)">
      <i class="el-icon-arrow-right"></i>
    </div>
    <div ref="tabScrollRef" class="tab-scroll" @wheel.prevent="handleWheel">
      <ul
        ref="tabContentRef"
        class="tab-list"
        :style="{ left: tabContentLeft + 'px' }"
      >
        <li
          v-for="(tab, idx) in getViewedTabs"
          :ref="
            (el) => {
              tabRefs[idx] = el
            }
          "
          class="tab-item"
          :class="isActive(tab) ? 'active' : ''"
          :key="tab.path"
          @click="openTab(tab)"
          @contextmenu.prevent="handleContextMenu(tab, idx, $event)"
        >
          <span>{{ tab.parent ? tab.parent.title : tab.title }}</span>
          <i
            v-if="!tab.affix"
            class="el-icon-close el-icon--right"
            @click.stop="closeTab(tab)"
          ></i>
        </li>
      </ul>
    </div>
    <div
      :ref="
        (el) => {
          tabRefs[-1] = el
        }
      "
      class="tab-close tab-item"
      @click.stop="handleContextMenu(null, -1, $event)"
      @contextmenu.prevent="handleContextMenu(null, -1, $event)"
    >
      <i class="el-icon-arrow-down"></i>
    </div>
    <ul
      ref="contextMenu"
      :style="{ left: contextMenuLeft + 'px', top: contextMenuTop + 'px' }"
      v-show="contextMenuShow"
      class="context-menu"
    >
      <li
        v-if="contextMenuTab && isActive(contextMenuTab)"
        @click="handleTabRefresh"
      >
        <i class="el-icon-refresh-right"></i>
        重载页面
      </li>
      <li
        v-if="contextMenuTab && !contextMenuTab.affix"
        @click="handleTabClose"
      >
        <i class="el-icon-close"></i>
        关闭页面
      </li>
      <li @click="handleCloseOther">
        <i class="el-icon-circle-close"></i>
        关闭其他
      </li>
      <li @click="handleCloseAll">
        <i class="el-icon-error"></i>
        全部关闭
      </li>
    </ul>
  </div>
</template>

<script>
import { computed, inject, nextTick, ref } from 'vue'
import { useStore } from 'vuex'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'

export default {
  name: 'HeaderTab',
  setup() {
    const store = useStore()
    const route = useRoute()
    const router = useRouter()

    const tabRefs = ref([])
    const tabScrollRef = ref(null)
    const tabContentRef = ref(null)

    const contextMenuShow = ref(false)
    const contextMenuLeft = ref(0)
    const contextMenuTop = ref(0)
    const contextMenuTab = ref(null)

    const tabContentLeft = ref(0)

    const getAffixTabs = (routes, basePath = '') => {
      const tabs = []

      routes.forEach((route) => {
        if (route.meta && route.meta.affix) {
          tabs.push({
            name: route.name,
            path: basePath + route.path,
            query: route.query || {},
            title: route.meta.title,
            affix: true,
          })
        }

        if (route.children) {
          const children = getAffixTabs(
            route.children,
            route.path.charAt(route.path.length - 1) === '/'
              ? route.path.substr(0, route.path.length - 1)
              : route.path
          )

          if (children.length >= 1) {
            tabs.push(...children)
          }
        }
      })

      return tabs
    }

    const initTabs = () => {
      const affixTabs = getAffixTabs(router.options.routes, '')

      for (const tab of affixTabs) {
        store.dispatch('tabs/open', tab)
      }
    }

    const addTab = (route) => {
      const tab = {
        name: route.name,
        path: route.path,
        query: route.query,
        title: route.meta.title,
        affix: route.meta && route.meta.affix,
        parent: route.meta && route.meta.parent,
      }

      store.dispatch('tabs/open', tab)
    }

    const moveToCurrentTable = async () => {
      await nextTick()

      const scrollWidth = tabScrollRef.value.offsetWidth
      const contentWidth = tabContentRef.value.offsetWidth

      getViewedTabs.value.forEach((tab, idx) => {
        if (isActive(tab)) {
          const elem = tabRefs.value[idx]

          if (contentWidth < scrollWidth) {
            tabContentLeft.value = 0
          } else if (elem.offsetLeft < -tabContentLeft.value) {
            // 标签在可视区域左侧
            tabContentLeft.value = -elem.offsetLeft
          } else if (
            elem.offsetLeft > -tabContentLeft.value &&
            elem.offsetLeft + elem.offsetWidth <
              -tabContentLeft.value + scrollWidth
          ) {
            // 标签在可视区域
            tabContentLeft.value = Math.min(
              0,
              scrollWidth - elem.offsetWidth - elem.offsetLeft
            )
          } else {
            // 标签在可视区域右侧
            tabContentLeft.value = -(
              elem.offsetLeft -
              (scrollWidth - elem.offsetWidth)
            )
          }
        }
      })
    }

    const handleScroll = (delta) => {
      const scrollWidth = tabScrollRef.value.offsetWidth
      const contentWidth = tabContentRef.value.offsetWidth

      if (delta > 0) {
        tabContentLeft.value = Math.min(0, tabContentLeft.value + delta)
      } else {
        if (scrollWidth < contentWidth) {
          if (tabContentLeft.value >= -(contentWidth - scrollWidth)) {
            tabContentLeft.value = Math.max(
              tabContentLeft.value + delta,
              scrollWidth - contentWidth
            )
          }
        } else {
          tabContentLeft.value = 0
        }
      }
    }

    const openTab = (tab) => {
      store.dispatch('tabs/current', tab)

      router.push({
        path: tab.path,
        query: tab.query,
      })
    }

    const closeTab = async (tab) => {
      const next = await store.dispatch('tabs/close', tab)

      if (isActive(tab)) {
        openTab(next)
      }
    }

    const handleTabClose = () => {
      if (contextMenuTab.value) {
        closeTab(contextMenuTab.value)
      }
    }

    const handleTabRefresh = inject('reload')

    const handleCloseAll = async () => {
      const next = await store.dispatch('tabs/closeAll')

      if (next !== null) {
        openTab(next)
      }
    }

    const handleCloseOther = async () => {
      const tab = contextMenuTab.value
        ? contextMenuTab.value
        : store.getters['tabs/getCurrent']

      await store.dispatch('tabs/closeOther', tab)

      openTab(tab)
    }

    const handleWheel = (e) => {
      const delta = e.wheelDelta ? e.wheelDelta : -(e.detail || 0) * 30

      handleScroll(delta)
    }

    const handleContextMenu = (tab, idx) => {
      const elem = tabRefs.value[idx]

      contextMenuLeft.value = elem.offsetLeft + elem.offsetWidth / 2
      contextMenuTop.value = elem.offsetHeight + 9

      contextMenuTab.value = tab

      contextMenuShow.value = true

      document.body.addEventListener('click', closeContextMenu)
    }

    const closeContextMenu = () => {
      contextMenuShow.value = false

      document.body.removeEventListener('click', closeContextMenu)
    }

    const getViewedTabs = computed(() => {
      return store.getters['tabs/getViewed']
    })

    const isActive = (tab) => {
      return tab.path === store.getters['tabs/getCurrent'].path
    }

    onBeforeRouteUpdate(async (to) => {
      addTab(to)
      await moveToCurrentTable()
    })

    initTabs()
    addTab(route)
    moveToCurrentTable()

    return {
      getViewedTabs,
      isActive,
      openTab,
      closeTab,
      tabRefs,
      tabScrollRef,
      tabContentRef,
      tabContentLeft,
      handleWheel,
      handleScroll,
      handleTabClose,
      handleTabRefresh,
      handleCloseAll,
      handleCloseOther,
      contextMenuShow,
      contextMenuLeft,
      contextMenuTop,
      contextMenuTab,
      closeContextMenu,
      handleContextMenu,
    }
  },
}
</script>

<style lang="less">
.context-menu {
  position: absolute;
  margin: 0;
  background: #fff;
  z-index: 2003;
  list-style-type: none;
  padding: 0;
  border-radius: 2px;
  box-shadow: 2px 2px 3px 0 rgba(0, 0, 0, 0.3);

  li {
    margin: 0;
    padding: 7px 15px 7px 13px;
    font-size: 12px;
    cursor: pointer;

    &:hover {
      background: #ecf5ff;
      color: #3a8ee6;
    }
  }
}

.ag-tab {
  font-size: 13px;
  background-color: #f4f8fb;
  padding: 7px 16px;
  height: 27px;
  user-select: none;
  position: relative;

  .tab-scroll {
    overflow-x: hidden;
    white-space: nowrap;
    position: absolute;
    left: 32px;
    right: 64px;
    top: 0;
    bottom: 0;
    padding: 7px 0;
  }

  .tab-list {
    position: absolute;
    list-style: none;
    margin: 0;
    padding: 0;
    transition: left 0.5s;

    .tab-item {
      cursor: pointer;
      border: none;
      color: #6f727d;
      display: inline-block;

      &:hover {
        color: #409eff;
      }

      &.active {
        background: #3a8ee6;
        color: #ffffff;

        &:hover {
          span {
            color: #ebeef5;
          }
        }

        i {
          border-radius: 50%;

          &:hover {
            background-color: #3a98f0;
          }
        }
      }

      &:not(:first-child) {
        margin-left: 6px;
      }
    }
  }

  .tab-item {
    padding: 5px 9px;
    background-color: #ffffff;
    border-radius: 2px;
  }

  .tab-left,
  .tab-right,
  .tab-close {
    position: absolute;
    cursor: pointer;

    [class^='el-icon-'] {
      font-weight: bolder;
    }
  }

  .tab-left,
  .tab-right {
    background-color: #f4f8fb;
  }

  .tab-left {
    left: 0;
  }

  .tab-right {
    right: 32px;
  }

  .tab-close {
    right: 0;
    background-color: #ffffff;

    &.el-dropdown {
      font-size: 13px;
    }
  }
}
</style>
