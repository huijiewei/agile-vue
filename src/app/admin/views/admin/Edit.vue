<template>
  <div class="box">
    <div class="box-header">
      <h4>{{ pageTitle }}{{ name }}</h4>
    </div>
    <admin-form
      v-if="admin"
      :submit-text="pageTitle"
      :admin="admin"
      :is-edit="true"
      @on-submit="editAdmin"
    />
    <placeholder-form v-else />
  </div>
</template>

<script>
import AdminForm from '@admin/views/admin/_EditForm'
import PlaceholderForm from '@shared/components/Placeholder/PlaceholderForm'
import { computed, inject, onBeforeMount, ref } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useRoute } from 'vue-router'
import { useStore } from 'vuex'
import { ElMessage } from 'element-plus'
import { useRefreshUser } from '@admin/hooks/useRefreshUser'

export default {
  name: 'AdminEdit',
  components: { PlaceholderForm, AdminForm },
  props: {
    name: String,
  },
  setup() {
    const pageTitle = '编辑管理员'
    const admin = ref(null)

    const route = useRoute()
    const store = useStore()
    const historyBack = inject('historyBack')
    const httpClient = useHttpClient()

    const editAdmin = async (admin, done, fail, always) => {
      const { data, error } = await httpClient.put('admins/' + admin.id, admin)

      if (data) {
        done()

        ElMessage.success('管理员编辑成功')

        await store.dispatch('tabs/deleteCache', 'Admin')

        await historyBack('/admin', false, true)
      }

      if (error) {
        fail(error)
      }

      always()
    }

    onBeforeMount(async () => {
      const { data } = await httpClient.get('admins/' + route.params.id)

      if (data) {
        admin.value = data
      }
    })

    return {
      pageTitle,
      admin,
      editAdmin,
    }
  },
}
</script>
