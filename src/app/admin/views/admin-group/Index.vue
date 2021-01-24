<template>
  <div class="box">
    <div class="box-toolbar">
      <div class="box-toolbar-button">
        <el-button
          :disabled="!$can('admin-group/create')"
          type="primary"
          size="medium"
          @click="adminGroupCreate()"
        >
          新建管理组
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="adminGroups">
      <el-table-column width="90" class-name="text-mono" prop="id" label="Id" />
      <el-table-column prop="name" label="名称" />
      <el-table-column width="130" fixed="right" label="操作" align="right">
        <template v-slot="scope">
          <el-button
            :disabled="!$can('admin-group/edit')"
            plain
            type="primary"
            size="mini"
            @click="adminGroupEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            :disabled="!$can('admin-group/delete')"
            plain
            type="danger"
            size="mini"
            @click="adminGroupDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import AdminGroupService from '@admin/services/AdminGroupService'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useDeleteDialog } from '@admin/hooks/useDeleteDialog'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { ElMessage } from 'element-plus'

export default {
  name: 'AdminGroup',
  setup() {
    const router = useRouter()

    const httpClient = useHttpClient()
    const { deleteDialog } = useDeleteDialog()

    const loading = ref(true)
    const adminGroups = ref([])

    const loadAdminGroups = async () => {
      const { data } = await httpClient.get('admin-groups')

      if (data) {
        adminGroups.value = Object.freeze(data.items)
      }

      loading.value = false
    }

    const adminGroupCreate = () => {
      router.push({ path: '/admin-group/create' })
    }

    const adminGroupEdit = (adminGroup) => {
      router.push({
        path: `/admin-group/edit/${adminGroup.id}`,
      })
    }

    const adminGroupDelete = (adminGroup) => {
      deleteDialog({
        message: `删除管理组 <strong>${adminGroup.name}</strong>`,
        callback: async () => {
          loading.value = true

          const { data } = await httpClient.delete(
            'admin-groups/' + adminGroup.id
          )

          if (data) {
            adminGroups.value = Object.freeze(
              adminGroups.value.filter((item) => item.id !== adminGroup.id)
            )

            ElMessage({
              type: 'success',
              message: data.message,
            })
          }

          loading.value = false
        },
      })
    }

    loadAdminGroups()

    return {
      loading,
      adminGroups,
      adminGroupCreate,
      adminGroupEdit,
      adminGroupDelete,
    }
  },
}
</script>
