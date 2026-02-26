import { storefrontApi } from './storefront.api'
import { clearCacheByPattern } from '../../core/http/httpClient'

const unwrap = (payload) => {
  if (!payload) return null
  if (typeof payload === 'object' && 'data' in payload) return payload.data
  return payload
}

const fallbackImages = [
  'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1491553895911-0055eca6402d?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1000&q=80',
  'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1000&q=80',
]

const toPriceVnd = (value) => {
  const amount = Number(value || 0)
  return new Intl.NumberFormat('vi-VN').format(amount) + 'đ'
}

const toTag = (index) => ['New', 'Hot', 'Best Seller', 'Limited'][index % 4]

export const storefrontService = {
  async loadProducts() {
    const response = await storefrontApi.getProducts()
    const data = unwrap(response)

    if (!Array.isArray(data)) return []

    return data.map((item, index) => ({
      productId: item.productId,
      title: item.name,
      price: toPriceVnd(item.price),
      rawPrice: item.price,
      stockQuantity: item.stockQuantity,
      tag: toTag(index),
      image: item.imageUrl || fallbackImages[index % fallbackImages.length],
      description: item.description || 'Sản phẩm thời trang cao cấp',
    }))
  },

  async addToCart(productId, quantity = 1) {
    const response = await storefrontApi.addToCart(productId, quantity)
    const cart = unwrap(response)
    // Clear cart cache after adding item
    clearCacheByPattern('/v1/cart')
    return {
      message: response?.message || 'Đã thêm vào giỏ hàng',
      cart,
    }
  },

  async getCartSummary() {
    const response = await storefrontApi.getCart()
    const cart = unwrap(response)
    return {
      totalItems: cart?.totalItems || 0,
      totalQuantity: cart?.totalQuantity || 0,
      totalPrice: cart?.totalPrice || 0,
    }
  },

  async getAdvancedDetail(productId) {
    const response = await storefrontApi.getProductById(productId)
    const data = unwrap(response)

    return {
      productId: data?.productId,
      title: data?.name,
      description: data?.description,
      categoryName: data?.categoryName,
      stockQuantity: data?.stockQuantity,
      price: toPriceVnd(data?.price),
    }
  },
}
