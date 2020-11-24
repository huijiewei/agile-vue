import { useHttpClient } from '@core/plugins/HttpClient'

const UserAddressService = {
  all(query) {
    return useHttpClient().get('user-addresses', query)
  },

  delete(id) {
    return useHttpClient().delete('user-addresses/' + id)
  },

  create(userAddress) {
    return useHttpClient().post('user-addresses', userAddress)
  },

  view(id) {
    return useHttpClient().get('user-addresses/' + id)
  },

  edit(userAddress) {
    return useHttpClient().put('user-addresses/' + userAddress.id, userAddress)
  },
}

export default UserAddressService
