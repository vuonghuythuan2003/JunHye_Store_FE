import { httpClient } from '../../core/http/httpClient'

const unwrap = (payload) => {
  if (!payload) return null
  if (typeof payload === 'object' && 'data' in payload) return payload.data
  return payload
}

// Products (admin uses same API with auth)
export const adminProductsApi = {
  getPage(params = {}) {
    const q = new URLSearchParams(params).toString()
    return httpClient(`/v1/products/page${q ? `?${q}` : ''}`)
  },
  getById(id) {
    return httpClient(`/v1/products/${id}`)
  },
  create(body) {
    return httpClient('/v1/products', { method: 'POST', body: JSON.stringify(body) })
  },
  update(id, body) {
    return httpClient(`/v1/products/${id}`, { method: 'PUT', body: JSON.stringify(body) })
  },
  delete(id) {
    return httpClient(`/v1/products/${id}`, { method: 'DELETE' })
  },
}

// Categories (admin uses same API with auth)
export const adminCategoriesApi = {
  getPage(params = {}) {
    const q = new URLSearchParams(params).toString()
    return httpClient(`/v1/categories/page${q ? `?${q}` : ''}`)
  },
  getAll() {
    return httpClient('/v1/categories')
  },
  getById(id) {
    return httpClient(`/v1/categories/${id}`)
  },
  create(body) {
    return httpClient('/v1/categories', { method: 'POST', body: JSON.stringify(body) })
  },
  update(id, body) {
    return httpClient(`/v1/categories/${id}`, { method: 'PUT', body: JSON.stringify(body) })
  },
  delete(id) {
    return httpClient(`/v1/categories/${id}`, { method: 'DELETE' })
  },
}

// Admin orders (refund confirm only for now)
export const adminOrdersApi = {
  confirmRefundComplete(orderId) {
    return httpClient(`/v1/admin/orders/${orderId}/refund-complete`, { method: 'PUT' })
  },
}
