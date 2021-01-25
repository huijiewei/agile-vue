<template>
  <div class="box">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-input
          placeholder="筛选"
          size="small"
          suffix-icon="el-icon-search"
          v-model="keyword"
          :clearable="true"
        >
        </el-input>
        <hr class="spacer-xs" />
        <div class="text-right">
          <el-button
            :disabled="!$can('shop-category/create')"
            title="创建根分类"
            size="mini"
            @click="categoryCreate(0)"
            icon="el-icon-folder-add"
          >
            创建根分类
          </el-button>
        </div>
        <hr class="spacer-xs" />
        <el-tree
          v-loading="loading"
          :data="categoryTree"
          :loading="loading"
          :highlight-current="true"
          :default-expanded-keys="categoryExpanded"
          :filter-node-method="filterCategoryNode"
          ref="treeRef"
          node-key="id"
        >
          <template #default="{ data }">
            <div class="category-tree-node">
              <div class="category-tree-icon">
                <ag-icon v-if="data.icon" :path="data.icon" />
                <i v-else-if="data.children" class="el-icon-folder" />
                <i v-else class="el-icon-document" />
                <span>{{ data.name }}</span>
              </div>
              <el-button-group class="operate">
                <el-button
                  size="mini"
                  @click.stop="categoryEdit(data)"
                  :disabled="!$can('shop-category/view')"
                  icon="el-icon-edit-outline"
                  title="查看编辑"
                />
                <el-button
                  size="mini"
                  @click.stop="categoryCreate(data.id)"
                  :disabled="!$can('shop-category/create')"
                  icon="el-icon-folder-add"
                  title="新建子分类"
                />
              </el-button-group>
            </div>
          </template>
        </el-tree>
      </el-col>
      <el-col :span="18">
        <router-view
          :category-tree="categoryTree"
          @on-expanded="onCategoryTreeExpanded"
          @on-updated="onCategoryTreeUpdated"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AgIcon from '@shared/components/Icon'
import { useRouter } from 'vue-router'
import { ref, onBeforeMount, watch } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'

export default {
  name: 'ShopCategory',
  components: { AgIcon },
  setup() {
    const router = useRouter()
    const httpClient = useHttpClient()

    const loading = ref(true)
    const keyword = ref('')
    const categoryTree = ref([])
    const categoryExpanded = ref([])
    const treeRef = ref()

    const categoryCreate = (parentId) => {
      router.push({
        path: `/shop-category/create/${parentId}`,
      })
    }

    const categoryEdit = (category) => {
      router.push({
        path: `/shop-category/edit/${category.id}`,
      })
    }

    const filterCategoryNode = (value, data) => {
      if (!value) {
        return true
      }

      return data.name.indexOf(value) !== -1
    }

    const loadCategoryTree = async () => {
      loading.value = true

      const { data } = await httpClient.get(
        'misc/shop-category-tree',
        null,
        false
      )

      if (data) {
        categoryTree.value = Object.freeze(data)
      }

      loading.value = false
    }

    const setAllExpand = (state) => {
      const nodes = treeRef.value.store.nodesMap

      for (const key in nodes) {
        if (nodes.hasOwnProperty(key)) {
          nodes[key].expanded = state
        }
      }
    }

    const onCategoryTreeExpanded = (expanded, currentId) => {
      categoryExpanded.value = expanded
      treeRef.value.setCurrentKey(currentId)
    }

    const onCategoryTreeUpdated = async () => {
      await loadCategoryTree()
    }

    watch(keyword, (keyword) => {
      if (!keyword) {
        setAllExpand(false)
      }

      treeRef.value.filter(keyword)
    })

    onBeforeMount(async () => {
      await loadCategoryTree()
    })

    return {
      loading,
      keyword,
      categoryTree,
      categoryExpanded,
      categoryCreate,
      categoryEdit,
      treeRef,
      filterCategoryNode,
      onCategoryTreeExpanded,
      onCategoryTreeUpdated,
    }
  },
}
</script>
