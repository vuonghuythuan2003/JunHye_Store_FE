import { httpClient } from '../../core/http/httpClient'

export const storefrontApi = {
  getProducts() {
    return httpClient('/v1/products')
  },

  getProductById(productId) {
    return httpClient(`/v1/products/${productId}`)
  },

  addToCart(productId, quantity = 1) {
    return httpClient('/v1/cart/items', {
      method: 'POST',
      body: JSON.stringify({
        productId,
        quantity,
      }),
    })
  },

  getCart() {
    return httpClient('/v1/cart')
  },
}
