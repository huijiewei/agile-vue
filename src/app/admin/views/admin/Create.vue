<template>
  <div class="box">
    <div class="box-header">
      <h4>{{ pageTitle }}</h4>
    </div>
    <admin-form
      v-if="admin"
      :submit-text="pageTitle"
      :admin="admin"
      @on-submit="createAdmin"
    />
    <placeholder-form v-else />
  </div>
</template>

<script>
import AdminForm from '@admin/views/admin/_EditForm'
import PlaceholderForm from '@shared/components/Placeholder/PlaceholderForm'
import { reactive, inject } from 'vue'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { useHttpClient } from '@shared/plugins/HttpClient'

export default {
  name: 'AdminCreate',
  components: { PlaceholderForm, AdminForm },
  setup() {
    const pageTitle = '新建管理员'
    const admin = reactive({
      phone: '',
      email: '',
      name: '',
      avatar: '',
      adminGroupId: 0,
    })

    const store = useStore()
    const historyBack = inject('historyBack')
    const httpClient = useHttpClient()

    const createAdmin = async (admin, done, fail, always) => {
      const { data, error } = await httpClient.post('admins', admin)

      if (data) {
        done()

        ElMessage.success('新建管理员成功')

        await store.dispatch('tabs/deleteCache', 'Admin')
        await historyBack('/admin', true, true)
      }

      if (error) {
        fail(error)
      }

      always()
    }

    return {
      pageTitle,
      admin,
      createAdmin,
    }
  },
}
</script>
