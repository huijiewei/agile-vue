<template>
  <div class="box">
    <div class="box-toolbar">
      <div class="box-toolbar-button">
        <el-button
          :disabled="!$can('admin/create')"
          type="primary"
          size="medium"
          @click="adminCreate()"
        >
          新建管理员
        </el-button>
      </div>
    </div>
    <el-table v-loading="loading" :data="admins">
      <el-table-column
        width="90"
        class-name="text-mono"
        prop="id"
        label="Id"
        fixed
      />
      <el-table-column
        width="130"
        prop="phone"
        class-name="text-mono"
        label="手机号码"
      />
      <el-table-column
        width="300"
        prop="email"
        class-name="text-mono"
        label="电子邮箱"
      />
      <el-table-column width="120" prop="name" label="名称" />
      <el-table-column width="55" align="center" label="头像">
        <template v-slot="scope">
          <ag-avatar :src="scope.row.avatar" />
        </template>
      </el-table-column>
      <el-table-column
        align="center"
        width="120"
        prop="adminGroup.name"
        label="所属管理组"
      />
      <el-table-column prop="createdAt" label="创建时间" min-width="160" />
      <el-table-column width="135" fixed="right" label="操作" align="right">
        <template v-slot="scope">
          <el-button
            :disabled="!$can('admin/edit')"
            plain
            type="primary"
            size="mini"
            @click="adminEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            :disabled="!$can('admin/delete')"
            plain
            type="danger"
            size="mini"
            @click="adminDelete(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
import AgAvatar from '../../../../shared/components/Avatar'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useRouter } from 'vue-router'
import { useDeleteDialog } from '@admin/hooks/useDeleteDialog'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

export default {
  name: 'Admin',
  components: { AgAvatar },
  emits: ['click'],
  setup() {
    const httpClient = useHttpClient()
    const router = useRouter()
    const { deleteDialog } = useDeleteDialog()

    const loading = ref(true)
    const admins = ref([])

    const loadAdmins = async () => {
      const { data } = await httpClient.get('admins')

      if (data) {
        admins.value = Object.freeze(data.items)
      }

      loading.value = false
    }

    loadAdmins()

    const adminCreate = () => {
      router.push('/admin/create')
    }

    const adminEdit = (admin) => {
      router.push(`/admin/edit/${admin.id}`)
    }

    const adminDelete = (admin) => {
      deleteDialog({
        message: `输入管理员电话 <strong>${admin.phone}</strong> 以确认删除`,
        promptLabel: '管理员电话',
        promptValue: admin.phone,
        callback: async () => {
          loading.value = true

          const { data } = await httpClient.delete('admins/' + admin.id)

          if (data) {
            admins.value = Object.freeze(
              admins.value.filter((item) => item.id !== admin.id)
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

    return {
      loading,
      admins,
      adminCreate,
      adminEdit,
      adminDelete,
    }
  },
}
</script>
