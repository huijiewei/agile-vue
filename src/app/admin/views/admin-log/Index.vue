<template>
  <div class="box">
    <div class="box-toolbar">
      <div class="box-toolbar-search">
        <search-form v-if="searchFields" :search-fields="searchFields" />
      </div>
      <div class="box-toolbar-button"></div>
    </div>
    <el-table v-loading="dataLoading" :data="adminLogs">
      <el-table-column
        fixed
        width="90"
        class-name="text-mono"
        prop="id"
        label="Id"
      />
      <el-table-column width="130" label="管理员">
        <template v-slot="scope">
          <span>{{ scope.row.admin.name || scope.row.admin.phone }}</span>
        </template>
      </el-table-column>
      <el-table-column width="62" align="center" label="状态">
        <template v-slot="scope">
          <el-tag
            size="small"
            :type="scope.row.status.value === 1 ? 'success' : 'danger'"
            >{{ scope.row.status.description }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="type.description"
        align="center"
        width="90"
        label="类型"
      />
      <el-table-column prop="method" width="79" align="center" label="方法" />
      <el-table-column prop="action" width="300" label="操作" />
      <el-table-column prop="params" label="参数" />
      <el-table-column
        width="150"
        class-name="text-mono"
        prop="remoteAddr"
        label="IP 地址"
      />
      <el-table-column
        class-name="text-mono"
        prop="createdAt"
        label="创建时间"
        width="160"
      />
      <el-table-column width="75" label="操作" fixed="right" align="right">
        <template v-slot="scope">
          <el-button
            plain
            type="primary"
            size="mini"
            @click="handleView(scope.row)"
          >
            详情
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :pages="pages"></pagination>
    <el-dialog title="日志详情" v-model="dialogVisible" @closed="handleClosed">
      <el-table :data="viewAdminLog" :show-header="false">
        <el-table-column property="name" width="150" />
        <el-table-column property="value" />
      </el-table>
    </el-dialog>
  </div>
</template>

<script>
import SearchForm from '@admin/components/SearchForm'
import { tabledObject } from '@shared/utils/util'
import Pagination from '@admin/components/Pagination'
import { onBeforeRouteUpdate, useRoute, useRouter } from 'vue-router'
import { onBeforeMount, ref } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useSearchForm } from '@admin/hooks/useSearchForm'

export default {
  name: 'AdminLog',
  components: { SearchForm, Pagination },
  setup() {
    const route = useRoute()
    const httpClient = useHttpClient()
    const { searchFields, setSearchFields, buildRouteQuery } = useSearchForm()

    const dataLoading = ref(true)
    const adminLogs = ref([])
    const pages = ref(null)

    const dialogVisible = ref(false)
    const viewAdminLog = ref([])

    const getAdminLogs = async (query) => {
      dataLoading.value = true

      const { data } = await httpClient.get(
        'admin-logs',
        buildRouteQuery(query)
      )

      if (data) {
        adminLogs.value = Object.freeze(data.items)
        pages.value = data.pages

        setSearchFields(data.searchFields)
      }

      dataLoading.value = false
    }

    onBeforeMount(async () => {
      await getAdminLogs(route.query)
    })

    onBeforeRouteUpdate(async (to) => {
      await getAdminLogs(to.query)
    })

    const handleView = (adminLog) => {
      dialogVisible.value = true
      viewAdminLog.value = tabledObject(adminLog, [
        {
          name: 'Id',
          property: 'id',
        },
        {
          name: '管理员',
          property: 'admin',
          callback: (admin) => {
            return admin.name || admin.phone
          },
        },
        {
          name: '状态',
          property: 'status',
          callback: (status) => {
            return status.description
          },
        },
        {
          name: '类型',
          property: 'type',
          callback: (type) => {
            return type.description
          },
        },
        {
          name: '方法',
          property: 'method',
        },
        {
          name: '操作',
          property: 'action',
        },
        {
          name: '参数',
          property: 'params',
        },
        {
          name: '异常信息',
          property: 'exception',
        },
        {
          name: 'IP 地址',
          property: 'remoteAddr',
        },
        {
          name: '浏览器',
          property: 'userAgent',
        },
        {
          name: '创建时间',
          property: 'createdAt',
        },
      ])
    }

    const handleClosed = () => {
      viewAdminLog.value = []
    }

    return {
      adminLogs,
      pages,
      dataLoading,
      dialogVisible,
      viewAdminLog,
      getAdminLogs,
      searchFields,
      handleView,
      handleClosed,
    }
  },
}
</script>
