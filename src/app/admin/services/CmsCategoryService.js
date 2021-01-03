import { useHttpClient } from '../../../shared/plugins/HttpClient'

const CmsCategoryService = {
  create(cmsCategory) {
    return useHttpClient().post('cms-categories', cmsCategory)
  },

  view(id) {
    return useHttpClient().get('cms-categories/' + id, { withParents: true })
  },

  edit(cmsCategory) {
    return useHttpClient().put('cms-categories/' + cmsCategory.id, cmsCategory)
  },

  delete(id) {
    return useHttpClient().delete('cms-categories/' + id)
  },
}

export default CmsCategoryService
