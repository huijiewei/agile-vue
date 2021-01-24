<template>
  <div class="box">
    <div class="box-header">
      <h4>{{ pageTitle }}</h4>
    </div>
    <admin-group-form
      v-if="adminGroup"
      :submit-text="pageTitle"
      :admin-group="adminGroup"
      @on-submit="createAdminGroup"
    />
    <placeholder-form v-else :rows="3" />
  </div>
</template>

<script>
import AdminGroupForm from '@admin/views/admin-group/_EditForm'
import PlaceholderForm from '@shared/components/Placeholder/PlaceholderForm'
import { inject, reactive } from 'vue'
import { useStore } from 'vuex'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { ElMessage } from 'element-plus'

export default {
  name: 'AdminGroupCreate',
  components: { PlaceholderForm, AdminGroupForm },
  setup() {
    const pageTitle = '新建管理组'

    const adminGroup = reactive({
      name: '',
      permissions: [],
    })

    const store = useStore()
    const historyBack = inject('historyBack')
    const httpClient = useHttpClient()

    const createAdminGroup = async (adminGroup, done, fail, always) => {
      const { data, error } = await httpClient.post('admin-groups', adminGroup)

      if (data) {
        done()

        ElMessage.success('新建管理组成功')

        await store.dispatch('tabs/deleteCache', 'AdminGroup')
        await historyBack('/admin-group', true, true)
      }

      if (error) {
        fail(error)
      }

      always()
    }

    return {
      pageTitle,
      adminGroup,
      createAdminGroup,
    }
  },
}
</script>
