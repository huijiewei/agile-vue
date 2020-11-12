import Vue from 'vue'

const CmsArticleService = {
  all(query) {
    return Vue.http.get('cms-articles', query)
  },

  create(cmsArticle) {
    return Vue.http.post('cms-articles', cmsArticle)
  },

  view(id) {
    return Vue.http.get('cms-articles/' + id)
  },

  edit(cmsArticle) {
    return Vue.http.put('cms-articles/' + cmsArticle.id, cmsArticle)
  },

  delete(id) {
    return Vue.http.delete('cms-articles/' + id)
  },
}

export default CmsArticleService
