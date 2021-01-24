<template>
  <div class="box">
    <div class="box-header">
      <h4>{{ pageTitle }}</h4>
    </div>
    <admin-group-form
      v-if="adminGroup"
      :submit-text="pageTitle"
      :admin-group="adminGroup"
      :is-edit="true"
      @on-submit="editAdminGroup"
    />
    <placeholder-form v-else :rows="3" />
  </div>
</template>

<script>
import AdminGroupForm from '@admin/views/admin-group/_EditForm'
import PlaceholderForm from '@shared/components/Placeholder/PlaceholderForm'
import { inject, ref, onBeforeMount } from 'vue'
import { useStore } from 'vuex'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { ElMessage } from 'element-plus'
import { useRoute } from 'vue-router'

export default {
  name: 'AdminGroupEdit',
  components: { PlaceholderForm, AdminGroupForm },
  setup() {
    const pageTitle = '编辑管理组'

    const adminGroup = ref(null)

    const route = useRoute()
    const store = useStore()
    const historyBack = inject('historyBack')
    const httpClient = useHttpClient()

    const editAdminGroup = async (adminGroup, done, fail, always) => {
      const { data, error } = await httpClient.put(
        'admin-groups/' + adminGroup.id,
        adminGroup
      )

      if (data) {
        done()

        ElMessage.success('管理组编辑成功')

        await store.dispatch('tabs/deleteCache', 'AdminGroup')
        await historyBack('/admin-group', false, true)
      }

      if (error) {
        fail(error)
      }

      always()
    }

    onBeforeMount(async () => {
      const { data } = await httpClient.get('admin-groups/' + route.params.id)

      if (data) {
        adminGroup.value = data
      }
    })

    return {
      pageTitle,
      adminGroup,
      editAdminGroup,
    }
  },
}
</script>
