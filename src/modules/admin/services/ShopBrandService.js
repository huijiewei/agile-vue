import { useHttpClient } from '@core/plugins/HttpClient'

const ShopBrandService = {
  all(query) {
    return useHttpClient().get('shop-brands', query)
  },

  create(shopBrand) {
    return useHttpClient().post('shop-brands', shopBrand)
  },

  view(id) {
    return useHttpClient().get('shop-brands/' + id)
  },

  edit(shopBrand) {
    return useHttpClient().put('shop-brands/' + shopBrand.id, shopBrand)
  },

  delete(id) {
    return useHttpClient().delete('shop-brands/' + id)
  },
}

export default ShopBrandService
