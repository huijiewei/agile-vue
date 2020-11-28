import { useHttpClient } from '@core/plugins/HttpClient'

const UserService = {
  all(query) {
    return useHttpClient().get('users', query)
  },

  delete(id) {
    return useHttpClient().delete('users/' + id)
  },

  create(user) {
    return useHttpClient().post('users', user)
  },

  view(id) {
    return useHttpClient().get('users/' + id)
  },

  edit(user) {
    return useHttpClient().put('users/' + user.id, user)
  },
}

export default UserService
