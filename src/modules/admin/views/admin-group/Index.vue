<template>
  <div class="box">
    <div class="box-toolbar">
      <div class="box-toolbar-button">
        <el-button
          :disabled="!$can('admin-group/create')"
          type="primary"
          size="medium"
          @click="handleAdminGroupCreate()"
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
            @click="handleAdminGroupEdit(scope.row)"
          >
            编辑
          </el-button>
          <el-button
            :disabled="!$can('admin-group/delete')"
            plain
            type="danger"
            size="mini"
            @click="handleAdminGroupDelete(scope.row)"
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

export default {
  name: 'AdminGroup',
  setup(ctx) {
    const router = useRouter()

    const loading = ref(true)
    const adminGroups = ref([])

    const loadAdminGroups = async () => {
      const { data } = await AdminGroupService.all()

      if (data) {
        adminGroups.value = Object.freeze(data.items)
      }

      loading.value = false
    }

    const handleAdminGroupCreate = () => {
      router.push({ path: '/admin-group/create' })
    }

    const handleAdminGroupEdit = (adminGroup) => {
      router.push({
        path: `/admin-group/edit/${adminGroup.id}`,
      })
    }

    const handleAdminGroupDelete = (adminGroup) => {
      ctx.root.$deleteDialog({
        message: `删除管理组 <strong>${adminGroup.name}</strong>`,
        callback: async () => {
          this.loading = true

          const { data } = await AdminGroupService.delete(adminGroup.id)

          if (data) {
            this.adminGroups = Object.freeze(
              this.adminGroups.filter((item) => item.id !== adminGroup.id)
            )

            this.$message({
              type: 'success',
              message: data.message,
            })
          }

          this.loading = false
        },
      })
    }

    loadAdminGroups()

    return {
      loading,
      adminGroups,
      handleAdminGroupCreate,
      handleAdminGroupEdit,
      handleAdminGroupDelete,
    }
  },
}
</script>
