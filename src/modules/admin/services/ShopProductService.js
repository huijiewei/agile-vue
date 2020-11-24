import { useHttpClient } from '@core/plugins/HttpClient'

const ShopProductService = {
  all(query) {
    return useHttpClient().get('shop-products', query)
  },

  create(shopProduct) {
    return useHttpClient().post('shop-products', shopProduct)
  },

  view(id) {
    return useHttpClient().get('shop-products/' + id)
  },

  edit(shopProduct) {
    return useHttpClient().put('shop-products/' + shopProduct.id, shopProduct)
  },

  delete(id) {
    return useHttpClient().delete('shop-products/' + id)
  },
}

export default ShopProductService
