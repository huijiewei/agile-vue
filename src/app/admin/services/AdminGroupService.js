import { useHttpClient } from '@core/plugins/HttpClient'

const AdminGroupService = {
  all() {
    return useHttpClient().get('admin-groups')
  },

  delete(id) {
    return useHttpClient().delete('admin-groups/' + id)
  },

  create(adminGroup) {
    return useHttpClient().post('admin-groups', adminGroup)
  },

  view(id) {
    return useHttpClient().get('admin-groups/' + id)
  },

  edit(adminGroup) {
    return useHttpClient().put('admin-groups/' + adminGroup.id, adminGroup)
  },
}

export default AdminGroupService
