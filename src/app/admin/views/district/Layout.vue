<template>
  <div class="box">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-input
          placeholder="搜索"
          size="small"
          suffix-icon="el-icon-search"
          v-model.trim="keyword"
          clearable
        >
        </el-input>
        <hr class="spacer-xs" />
        <div class="text-right">
          <el-button
            :disabled="!$can('district/create')"
            title="创建根地区"
            size="mini"
            @click="districtCreate('0')"
            icon="el-icon-folder-add"
          >
            创建根地区
          </el-button>
        </div>
        <hr class="spacer-xs" />
        <el-tree
          v-show="isSearched"
          v-loading="loading"
          :data="searchedData"
          :highlight-current="true"
          :default-expand-all="true"
          ref="searchRef"
          node-key="id"
        >
          <template #default="{ data }">
            <div class="ag-tree-node">
              <div class="ag-tree-icon">
                <ag-icon v-if="data.icon" :path="data.icon" />
                <i v-else-if="data.code.length < 9" class="el-icon-folder" />
                <i v-else class="el-icon-map-location" />
                <span v-bind:title="'地区代码：' + data.code">{{
                  data.name
                }}</span>
              </div>
              <el-button-group class="operate">
                <el-button
                  size="mini"
                  @click.stop="districtEdit(data)"
                  :disabled="!$can('district/view')"
                  icon="el-icon-edit-outline"
                  title="查看编辑"
                />
                <el-button
                  v-if="!data.leaf"
                  size="mini"
                  @click.stop="districtCreate(data.id)"
                  :disabled="!$can('district/create')"
                  icon="el-icon-folder-add"
                  title="新建子地区"
                />
              </el-button-group>
            </div>
          </template>
        </el-tree>
        <el-tree
          v-show="!isSearched"
          v-loading="loading"
          :highlight-current="true"
          :default-expanded-keys="districtExpanded"
          ref="treeRef"
          node-key="id"
          accordion
          :lazy="true"
          :load="loadDistricts"
          :props="{
            isLeaf: 'leaf',
          }"
        >
          <template #default="{ data }">
            <div class="ag-tree-node">
              <div class="ag-tree-icon">
                <ag-icon v-if="data.icon" :path="data.icon" />
                <i v-else-if="data.code.length < 9" class="el-icon-folder" />
                <i v-else class="el-icon-map-location" />
                <span v-bind:title="'地区代码：' + data.code">{{
                  data.name
                }}</span>
              </div>
              <el-button-group class="operate">
                <el-button
                  size="mini"
                  @click.stop="districtEdit(data)"
                  :disabled="!$can('district/view')"
                  icon="el-icon-edit-outline"
                  title="查看编辑"
                />
                <el-button
                  v-if="!data.leaf"
                  size="mini"
                  @click.stop="districtCreate(data.id)"
                  :disabled="!$can('district/create')"
                  icon="el-icon-folder-add"
                  title="新建子地区"
                />
              </el-button-group>
            </div>
          </template>
        </el-tree>
      </el-col>
      <el-col :span="18">
        <el-row :gutter="0">
          <el-col :span="24">
            <router-view
              @on-expanded="onDistrictExpanded"
              @on-updated="onDistrictUpdated"
            />
          </el-col>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import AgIcon from '@shared/components/Icon'
import { ref, watch } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useRouter } from 'vue-router'

export default {
  name: 'District',
  components: { AgIcon },
  setup() {
    const router = useRouter()
    const httpClient = useHttpClient()

    const loading = ref(true)
    const keyword = ref('')
    const treeRef = ref()
    const searchRef = ref()
    const isSearched = ref(false)
    const searchedData = ref([])
    const districtExpanded = ref([])
    const districtCurrentId = ref(0)
    const currentNode = ref(null)
    const currentResolve = ref(null)

    watch(keyword, async (keyword) => {
      if (!keyword) {
        isSearched.value = false

        return
      }

      if (keyword.length < 2) {
        return
      }

      isSearched.value = true
      loading.value = true

      const { data } = await httpClient.get(
        'misc/district-search-tree',
        { keyword: keyword },
        false
      )

      if (data) {
        searchedData.value = data
      }

      loading.value = false
    })

    const loadDistricts = async (node, resolve) => {
      const parentId = (node.data && node.data.id) || 0

      console.log(parentId)

      if (parentId === 0) {
        currentNode.value = node
        currentResolve.value = resolve
      }

      loading.value = true

      const { data } = await httpClient.get(
        'misc/districts',
        { parentId: parentId },
        false
      )

      console.log(data)

      resolve(data || [])

      // treeRef.value.setCurrentKey(districtCurrentId.value)

      loading.value = false
    }

    const onDistrictExpanded = (expanded, currentId) => {
      console.log(expanded, currentId)
      districtExpanded.value = expanded
      districtCurrentId.value = currentId
      //treeRef.value.setCurrentKey(currentId)
      //searchRef.value.setCurrentKey(currentId)
    }

    const onDistrictUpdated = async (currentId, expandId, collapseId) => {
      if (expandId === null || expandId === 0) {
        currentNode.value.childNodes = []
        await loadDistricts(currentNode.value, currentResolve.value)
        return
      }

      districtCurrentId.value = currentId

      if (collapseId > 0 && collapseId !== expandId) {
        const collapse = treeRef.value.getNode(collapseId)

        collapse.loaded = false
        collapse.collapse()
      }

      const expand = treeRef.value.getNode(expandId)

      expand.loaded = false
      expand.expand()
    }

    const districtCreate = async (parentId) => {
      await router.push({
        path: `/district/create/${parentId}`,
      })
    }

    const districtEdit = async (district) => {
      await router.push({
        path: `/district/edit/${district.id}`,
      })
    }

    return {
      loading,
      keyword,
      treeRef,
      searchRef,
      isSearched,
      searchedData,
      districtExpanded,
      onDistrictExpanded,
      onDistrictUpdated,
      loadDistricts,
      districtCreate,
      districtEdit,
    }
  },
}
</script>
