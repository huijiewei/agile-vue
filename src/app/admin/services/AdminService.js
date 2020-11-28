import { useHttpClient } from '@core/plugins/HttpClient'

const AdminService = {
  all() {
    return useHttpClient().get('admins')
  },

  log(query) {
    return useHttpClient().get('admin-logs', query)
  },

  delete(id) {
    return useHttpClient().delete('admins/' + id)
  },

  create(admin) {
    return useHttpClient().post('admins', admin)
  },

  view(id) {
    return useHttpClient().get('admins/' + id)
  },

  edit(admin) {
    return useHttpClient().put('admins/' + admin.id, admin)
  },
}

export default AdminService
