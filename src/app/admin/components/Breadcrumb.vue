<template>
  <el-breadcrumb class="ag-breadcrumb">
    <el-breadcrumb-item :to="{ path: '/home' }">
      <i class="el-icon-s-home" />&nbsp;
      <span>管理后台</span>
    </el-breadcrumb-item>
    <el-breadcrumb-item
      v-for="(breadcrumb, index) in breadcrumbs"
      :key="'bc-' + index"
    >
      <span>{{ breadcrumb.title }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script>
import { ref, watch, onMounted } from 'vue'
import { useRoute } from 'vue-router'

export default {
  name: 'Breadcrumb',
  setup() {
    const route = useRoute()

    const breadcrumbs = ref([])
    const documentTitle = '%s - ' + '管理后台'

    const updateBreadcrumbs = () => {
      const title = route.meta.title

      breadcrumbs.value = [{ title: title }]

      document.title = documentTitle.replace('%s', title)
    }

    onMounted(updateBreadcrumbs)

    watch(
      () => route.path,
      () => {
        updateBreadcrumbs()
      }
    )

    return {
      breadcrumbs,
      documentTitle,
      updateBreadcrumbs,
    }
  },
}
</script>

<style lang="less">
.ag-breadcrumb {
  margin-bottom: 15px;

  .is-link {
    font-weight: normal;
  }
}
</style>
