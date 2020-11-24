import { useHttpClient } from '@core/plugins/HttpClient'

const DistrictService = {
  create(district) {
    return useHttpClient().post('districts', district)
  },

  view(id) {
    return useHttpClient().get('districts/' + id, { withParents: true })
  },

  edit(district) {
    return useHttpClient().put('districts/' + district.id, district)
  },

  delete(id) {
    return useHttpClient().delete('districts/' + id)
  },
}

export default DistrictService
