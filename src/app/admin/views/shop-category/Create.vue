<template>
  <el-row :gutter="0" style="padding: 5px">
    <div class="box-header">
      <h4>{{ pageTitle }}</h4>
    </div>
    <shop-category-form
      v-if="shopCategory"
      :submit-text="pageTitle"
      :shop-category="shopCategory"
      :category-tree="categoryTree"
      v-model:category-parents="categoryParents"
      :is-edit="false"
      :can-submit="$can('shop-category/create')"
      @on-submit="createShopCategory"
    >
    </shop-category-form>
    <placeholder-form v-else></placeholder-form>
  </el-row>
</template>

<script>
import ShopCategoryForm from '@admin/views/shop-category/_EditForm'
import PlaceholderForm from '@shared/components/Placeholder/PlaceholderForm'
import { ref, onBeforeMount } from 'vue'
import { useRoute, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { ElMessage } from 'element-plus'

export default {
  name: 'ShopCategoryCreate',
  components: { PlaceholderForm, ShopCategoryForm },
  props: {
    categoryTree: {
      type: Array,
    },
  },
  emits: ['on-expanded', 'on-updated'],
  setup(props, { emit }) {
    const route = useRoute()
    const router = useRouter()
    const httpClient = useHttpClient()

    const pageTitle = '新建商品分类'
    const shopCategory = ref(null)
    const categoryParents = ref([])

    const loadShopCategory = async (id) => {
      let parents = [0]

      if (id > 0) {
        const { data } = await httpClient.get(
          'misc/shop-category-path',
          { id: id },
          false
        )

        if (data && Array.isArray(data)) {
          parents = data.map((parent) => parent.id)
        }
      }

      categoryParents.value = parents

      emit('on-expanded', parents, id)

      shopCategory.value = {
        parentId: id,
        name: '',
        icon: '',
        image: '',
        description: '',
      }
    }

    const createShopCategory = async (shopCategory, done, fail, always) => {
      const { data, error } = await httpClient.post(
        'shop-categories',
        shopCategory
      )

      if (data) {
        done()

        ElMessage.success('新建商品分类成功')

        await emit('on-updated')

        await router.replace({
          path: `/shop-category/edit/${data.id}`,
        })
      }

      if (error) {
        fail(error)
      }

      always()
    }

    onBeforeMount(async () => {
      await loadShopCategory(route.params.id)
    })

    onBeforeRouteUpdate(async (to, from, next) => {
      shopCategory.value = null
      next()
      await loadShopCategory(to.params.id)
    })

    return {
      pageTitle,
      shopCategory,
      categoryParents,
      createShopCategory,
    }
  },
}
</script>
