import { useHttpClient } from '@core/plugins/HttpClient'

const ShopCategoryService = {
  create(shopCategory) {
    return useHttpClient().post('shop-categories', shopCategory)
  },

  view(id) {
    return useHttpClient().get('shop-categories/' + id, { withParents: true })
  },

  edit(shopCategory) {
    return useHttpClient().put(
      'shop-categories/' + shopCategory.id,
      shopCategory
    )
  },

  delete(id) {
    return useHttpClient().delete('shop-categories/' + id)
  },
}

export default ShopCategoryService
