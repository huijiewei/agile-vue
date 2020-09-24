<template>
  <div class="box">
    <el-row :gutter="20">
      <el-col :span="6">
        <el-input
          placeholder="筛选"
          size="small"
          suffix-icon="el-icon-search"
          v-model="keyword"
        >
        </el-input>
        <hr class="spacer-xs" />
        <div class="text-right">
          <el-button
            :disabled="!$can('district/create')"
            title="创建根地区"
            size="mini"
            @click.native="handleDistrictCreate(0)"
            icon="el-icon-folder-add"
          >
            创建根地区
          </el-button>
        </div>
        <hr class="spacer-xs" />
        <el-tree
          :loading="loading"
          :highlight-current="true"
          :default-expanded-keys="districtExpanded"
          :filter-node-method="filterDistrictNode"
          ref="districtTree"
          node-key="id"
          :lazy="true"
          :load="loadDistricts"
          :props="{
            isLeaf: 'leaf',
          }"
        >
          <div class="district-tree-node" slot-scope="{ node, data }">
            <div class="district-tree-icon">
              <ag-icon v-if="data.icon" :path="data.icon" />
              <i v-else-if="data.code.length < 9" class="el-icon-folder" />
              <i v-else class="el-icon-map-location" />
              <span>{{ data.name }}</span>
            </div>
            <el-button-group class="operate">
              <el-button
                size="mini"
                @click.stop="handleDistrictEdit(data)"
                :disabled="!$can('district/view')"
                icon="el-icon-edit-outline"
                title="查看编辑"
              />
              <el-button
                size="mini"
                @click.stop="handleDistrictCreate(data.id)"
                :disabled="!$can('district/create')"
                icon="el-icon-folder-add"
                title="新建子地区"
              />
            </el-button-group>
          </div>
        </el-tree>
      </el-col>
      <el-col :span="18">
        <router-view @on-expanded="expandedDistrict" />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import flatry from '@core/utils/flatry'
import MiscService from '@admin/services/MiscService'
import AgIcon from '@core/components/Icon'

export default {
  name: 'District',
  watch: {
    keyword(keyword) {
      this.$refs.districtTree.filter(keyword)
    },
  },
  components: { AgIcon },
  data() {
    return {
      loading: true,
      keyword: '',
      districtExpanded: [],
      districtCurrentId: 0,
    }
  },
  methods: {
    expandedDistrict(expanded, currentId) {
      this.districtExpanded = expanded
      this.districtCurrentId = currentId
    },
    handleDistrictCreate(parentId) {
      this.$router.push({
        name: 'DistrictCreate',
        params: { id: parentId },
      })
    },

    handleDistrictEdit(category) {
      this.$router.push({
        name: 'DistrictEdit',
        params: { id: category.id },
      })
    },

    filterDistrictNode(value, data) {
      if (!value) return true
      return data.name.indexOf(value) !== -1
    },

    async loadDistricts(node, resolve) {
      const parentId = (node.data && node.data.id) || 0

      this.loading = true

      const { data } = await flatry(MiscService.districts(parentId))

      const districts = data || []

      districts.forEach((item) => {
        item.leaf = item.code.length === 9
      })

      resolve(districts)

      this.$refs.districtTree.setCurrentKey(this.districtCurrentId)

      this.loading = false
    },
  },
  created() {},
}
</script>
<style lang="scss">
.district-tree-node {
  font-size: 14px;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-right: 7px;

  .district-tree-icon {
    [class^='el-icon-'] {
      margin-right: 3px;
    }
  }

  &:hover {
    .operate {
      display: inline-block;
    }
  }

  .operate {
    display: none;
    font-size: 12px;
    color: #a6a9ad;

    .el-button {
      padding: 3px 5px 2px 5px;
    }
  }
}
</style>
