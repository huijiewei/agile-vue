<template>
  <div v-if="pages" class="ag-pages">
    <el-pagination
      :background="true"
      :current-page="pages.currentPage"
      :page-sizes="[20, 50, 100, 200]"
      :page-size="pages.perPage"
      layout="total, prev, pager, next, sizes, jumper"
      :total="pages.totalCount"
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
    />
  </div>
</template>

<script>
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'Pagination',
  props: {
    pages: {
      type: Object,
      default: () => {
        return null
      },
    },
  },
  setup() {
    const route = useRoute()
    const router = useRouter()

    const onSizeChange = async (size) => {
      await router.push({
        path: route.path,
        query: { ...route.query, ...{ page: 1, size: size } },
      })
    }

    const onCurrentChange = async (page) => {
      await router.push({
        path: route.path,
        query: { ...route.query, ...{ page: page } },
      })
    }

    return { onSizeChange, onCurrentChange }
  },
}
</script>
<style lang="less">
.ag-pages {
  margin-top: 20px;
  text-align: right;
}
</style>
