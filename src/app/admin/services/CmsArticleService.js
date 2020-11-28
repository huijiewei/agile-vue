import { useHttpClient } from '@core/plugins/HttpClient'

const CmsArticleService = {
  all(query) {
    return useHttpClient().get('cms-articles', query)
  },

  create(cmsArticle) {
    return useHttpClient().post('cms-articles', cmsArticle)
  },

  view(id) {
    return useHttpClient().get('cms-articles/' + id)
  },

  edit(cmsArticle) {
    return useHttpClient().put('cms-articles/' + cmsArticle.id, cmsArticle)
  },

  delete(id) {
    return useHttpClient().delete('cms-articles/' + id)
  },
}

export default CmsArticleService
