<template>
  <div class="box-header">
    <h4>{{ pageTitle }}</h4>
  </div>
  <el-row :gutter="0" style="padding: 5px">
    <el-col :span="24">
      <shop-category-form
        v-if="shopCategory"
        :submit-text="pageTitle"
        :shop-category="shopCategory"
        :category-tree="categoryTree"
        v-model:category-parents="categoryParents"
        :is-edit="true"
        :can-submit="this.$can('shop-category/edit')"
        @on-submit="editShopCategory"
        @on-delete="deleteShopCategory"
      >
      </shop-category-form>
      <placeholder-form v-else />
    </el-col>
  </el-row>
</template>

<script>
import ShopCategoryForm from '@admin/views/shop-category/_EditForm'
import PlaceholderForm from '@shared/components/Placeholder/PlaceholderForm'
import { ref, onBeforeMount } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useRoute, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { useDeleteDialog } from '@admin/hooks/useDeleteDialog'

export default {
  name: 'ShopCategoryEdit',
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
    const { deleteDialog } = useDeleteDialog()

    const pageTitle = '编辑商品分类'
    const shopCategory = ref(null)
    const categoryParents = ref([])

    const loadShopCategory = async (id) => {
      const { data } = await httpClient.get('shop-categories/' + id, {
        withParents: true,
      })

      if (data) {
        let parents = [0]

        if (
          data.parents &&
          Array.isArray(data.parents) &&
          data.parents.length > 0
        ) {
          parents = data.parents.map((parent) => parent.id)
        }

        categoryParents.value = parents

        emit('on-expanded', parents, data.id)

        delete data.parents

        shopCategory.value = data
      }
    }

    onBeforeRouteUpdate(async (to, from, next) => {
      shopCategory.value = null
      next()
      await loadShopCategory(to.params.id)
    })

    onBeforeMount(async () => {
      await loadShopCategory(route.params.id)
    })

    const editShopCategory = async (shopCategory, done, fail, always) => {
      const { data, error } = await httpClient.put(
        'shop-categories/' + shopCategory.id,
        shopCategory
      )

      if (data) {
        done()

        ElMessage.success('修改成功')

        emit('on-updated')

        emit(
          'on-expanded',
          data.parents.map((parent) => parent.id),
          data.id
        )
      }

      if (error) {
        fail(error)
      }

      always()
    }

    const deleteShopCategory = async (shopCategory) => {
      deleteDialog({
        message: `删除商品分类 <strong>${shopCategory.name}</strong>`,
        callback: async () => {
          const { data } = await httpClient.delete(
            'shop-categories/' + shopCategory.id
          )

          if (data) {
            ElMessage.success('删除成功')

            await emit('on-updated')

            emit('on-expanded', categoryParents.value, shopCategory.parentId)

            await router.replace({
              path: '/shop-category',
            })
          }
        },
      })
    }

    return {
      pageTitle,
      shopCategory,
      categoryParents,
      editShopCategory,
      deleteShopCategory,
    }
  },
}
</script>
