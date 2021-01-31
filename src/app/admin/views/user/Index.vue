<template>
  <div class="box">
    <div class="box-toolbar">
      <div class="box-toolbar-search">
        <search-form v-if="searchFields" :search-fields="searchFields" />
      </div>
      <div class="box-toolbar-button">
        <el-button
          :disabled="!$can('user/create')"
          type="primary"
          size="medium"
          @click="userCreate()"
        >
          新建会员
        </el-button>
        &nbsp;&nbsp;
        <export-button
          :disabled="loading || !$can('user/export')"
          :api="'users/export'"
          type="default"
          size="small"
          :confirm="'你确定导出所有用户吗？'"
        >
          会员导出
        </export-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="users">
      <el-table-column
        fixed
        width="90"
        class-name="text-mono"
        prop="id"
        label="Id"
      />
      <el-table-column
        prop="phone"
        width="130"
        class-name="text-mono"
        label="手机号码"
      />
      <el-table-column
        prop="email"
        min-width="320"
        class-name="text-mono"
        label="电子邮箱"
      />
      <el-table-column prop="name" width="120" label="名称" />
      <el-table-column width="55" align="center" label="头像">
        <template v-slot="scope">
          <ag-avatar :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column
        width="160"
        class-name="text-mono"
        prop="createdIp"
        label="注册 IP"
      />
      <el-table-column
        align="center"
        width="79"
        class-name="text-mono"
        prop="createdFrom.description"
        label="注册来源"
      />
      <el-table-column
        class-name="text-mono"
        prop="createdAt"
        label="创建时间"
        width="160"
      />
      <el-table-column width="135" label="操作" fixed="right" align="right">
        <template v-slot="scope">
          <el-button
            :disabled="!$can('user/edit')"
            plain
            type="primary"
            size="mini"
            @click="userEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            :disabled="!$can('user/delete')"
            plain
            type="danger"
            size="mini"
            @click="userDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    <pagination :pages="pages"></pagination>
  </div>
</template>

<script>
import AgAvatar from '@shared/components/Avatar'
import SearchForm from '@admin/components/SearchForm'
import ExportButton from '@admin/components/ExportButton'
import Pagination from '@admin/components/Pagination'
import { onBeforeMount, ref } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useRoute, onBeforeRouteUpdate, useRouter } from 'vue-router'
import { useDeleteDialog } from '@admin/hooks/useDeleteDialog'
import { ElMessage } from 'element-plus'
import { useSearchForm } from '@admin/hooks/useSearchForm'

export default {
  name: 'User',
  components: { ExportButton, SearchForm, AgAvatar, Pagination },
  setup() {
    const loading = ref(true)
    const users = ref([])
    const pages = ref(null)

    const route = useRoute()
    const router = useRouter()
    const httpClient = useHttpClient()
    const { deleteDialog } = useDeleteDialog()
    const { searchFields, setSearchFields, buildRouteQuery } = useSearchForm()

    const loadUsers = async (query) => {
      loading.value = true

      const { data } = await httpClient.get('users', buildRouteQuery(query))

      if (data) {
        users.value = Object.freeze(data.items)
        pages.value = data.pages

        setSearchFields(data.searchFields)
      }

      loading.value = false
    }

    onBeforeMount(async () => {
      await loadUsers(route.query)
    })

    onBeforeRouteUpdate(async (to, from, next) => {
      await loadUsers(to.query)

      next()
    })

    const userCreate = async () => {
      await router.push({
        path: '/user/create',
      })
    }

    const userEdit = async (user) => {
      await router.push({
        path: `/user/edit/${user.id}`,
      })
    }

    const userDelete = async (user) => {
      deleteDialog({
        message: `删除用户 <strong>${user.name || user.phone}</strong>`,
        callback: async () => {
          loading.value = true

          const { data } = await httpClient.delete('users/' + user.id)

          if (data) {
            users.value = Object.freeze(
              users.value.filter((item) => item.id !== user.id)
            )

            ElMessage.success(data.message)
          }

          loading.value = false
        },
      })
    }

    return {
      loading,
      users,
      pages,
      userCreate,
      userEdit,
      userDelete,
      searchFields,
    }
  },
}
</script>
