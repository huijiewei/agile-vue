<template>
  <div v-if="pages" class="ag-pages">
    <el-pagination
      :background="true"
      :current-page="pages.currentPage"
      :page-sizes="[20, 50, 100, 200]"
      :page-size="pages.perPage"
      layout="total, prev, pager, next, sizes, jumper"
      :total="pages.totalCount"
      @current-change="handleCurrentChange"
      @size-change="handleSizeChange"
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
  setup(props) {
    const route = useRoute()
    const router = useRouter()

    const handleSizeChange = async (size) => {
      await router.push({
        query: Object.assign({}, route.query, { page: 1, size: size }),
      })
    }

    const handleCurrentChange = async (page) => {
      await router.push({
        query: Object.assign({}, route.query, { page: page }),
      })
    }

    return { handleSizeChange, handleCurrentChange }
  },
}
</script>
<style lang="less">
.ag-pages {
  margin-top: 20px;
  text-align: right;
}
</style>
