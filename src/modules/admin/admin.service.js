import { adminProductsApi, adminCategoriesApi, adminOrdersApi } from './admin.api'
import { clearCacheByPattern } from '../../core/http/httpClient'

const unwrap = (payload) => {
  if (!payload) return null
  if (typeof payload === 'object' && 'data' in payload) return payload.data
  return payload
}

const getMessage = (payload, fallback) => {
  if (!payload) return fallback
  if (typeof payload === 'object' && payload.message) return payload.message
  return fallback
}

export const adminService = {
  // Products
  async getProductsPage({ page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC', keyword, categoryId, status, minPrice, maxPrice } = {}) {
    const params = { page, size, sortBy, sortDirection }
    if (keyword != null) params.keyword = keyword
    if (categoryId != null) params.categoryId = categoryId
    if (status != null) params.status = status
    if (minPrice != null) params.minPrice = minPrice
    if (maxPrice != null) params.maxPrice = maxPrice
    const res = await adminProductsApi.getPage(params)
    return unwrap(res)
  },
  async getProductById(id) {
    const res = await adminProductsApi.getById(id)
    return unwrap(res)
  },
  async createProduct(data) {
    const res = await adminProductsApi.create(data)
    clearCacheByPattern('/v1/products')
    return { data: unwrap(res), message: res?.message || 'Tạo sản phẩm thành công' }
  },
  async updateProduct(id, data) {
    const res = await adminProductsApi.update(id, data)
    clearCacheByPattern('/v1/products')
    return { data: unwrap(res), message: res?.message || 'Cập nhật sản phẩm thành công' }
  },
  async deleteProduct(id) {
    await adminProductsApi.delete(id)
    clearCacheByPattern('/v1/products')
    return { message: 'Xóa sản phẩm thành công' }
  },

  // Categories
  async getCategoriesPage({ page = 0, size = 10, sortBy = 'createdAt', sortDirection = 'DESC', keyword, status } = {}) {
    const params = { page, size, sortBy, sortDirection }
    if (keyword != null) params.keyword = keyword
    if (status != null) params.status = status
    const res = await adminCategoriesApi.getPage(params)
    return unwrap(res)
  },
  async getAllCategories() {
    const res = await adminCategoriesApi.getAll()
    return unwrap(res) || []
  },
  async getCategoryById(id) {
    const res = await adminCategoriesApi.getById(id)
    return unwrap(res)
  },
  async createCategory(data) {
    const res = await adminCategoriesApi.create(data)
    clearCacheByPattern('/v1/categories')
    return { data: unwrap(res), message: res?.message || 'Tạo danh mục thành công' }
  },
  async updateCategory(id, data) {
    const res = await adminCategoriesApi.update(id, data)
    clearCacheByPattern('/v1/categories')
    return { data: unwrap(res), message: res?.message || 'Cập nhật danh mục thành công' }
  },
  async deleteCategory(id) {
    await adminCategoriesApi.delete(id)
    clearCacheByPattern('/v1/categories')
    return { message: 'Xóa danh mục thành công' }
  },

  // Admin orders
  async confirmRefundComplete(orderId) {
    const res = await adminOrdersApi.confirmRefundComplete(orderId)
    return { data: unwrap(res), message: getMessage(res, 'Xác nhận hoàn tiền thành công') }
  },
}
