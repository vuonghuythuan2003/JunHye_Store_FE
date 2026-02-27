<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from './admin.service'

const loading = ref(false)
const page = ref({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 })
const categories = ref([])
const keyword = ref('')
const filterCategoryId = ref(null)
const sortBy = ref('createdAt')
const sortDirection = ref('DESC')
const showForm = ref(false)
const formMode = ref('create')
const editingId = ref(null)
const message = ref('')
const error = ref('')
const form = ref({
  name: '',
  description: '',
  price: null,
  stockQuantity: 0,
  imageUrl: '',
  status: true,
  categoryId: null,
})

const loadCategories = async () => {
  try {
    categories.value = await adminService.getAllCategories()
  } catch (e) {
    categories.value = []
  }
}

const loadPage = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await adminService.getProductsPage({
      page: page.value.number,
      size: page.value.size,
      sortBy: sortBy.value,
      sortDirection: sortDirection.value,
      keyword: keyword.value || undefined,
      categoryId: filterCategoryId.value || undefined,
    })
    page.value = {
      content: res?.content ?? [],
      totalPages: res?.totalPages ?? 0,
      totalElements: res?.totalElements ?? 0,
      number: res?.number ?? 0,
      size: res?.size ?? 10,
    }
  } catch (e) {
    error.value = e.message || 'Không tải được danh sách'
    page.value.content = []
  } finally {
    loading.value = false
  }
}

const openCreate = () => {
  formMode.value = 'create'
  editingId.value = null
  form.value = { name: '', description: '', price: null, stockQuantity: 0, imageUrl: '', status: true, categoryId: categories.value[0]?.categoryId ?? null }
  showForm.value = true
  message.value = ''
  error.value = ''
}

const openEdit = (row) => {
  formMode.value = 'edit'
  editingId.value = row.productId
  form.value = {
    name: row.name,
    description: row.description || '',
    price: row.price,
    stockQuantity: row.stockQuantity ?? 0,
    imageUrl: row.imageUrl || '',
    status: row.status !== false,
    categoryId: row.categoryId,
  }
  showForm.value = true
  message.value = ''
  error.value = ''
}

const submitForm = async () => {
  message.value = ''
  error.value = ''
  if (!form.value.name?.trim()) {
    error.value = 'Tên sản phẩm không được để trống'
    return
  }
  if (form.value.price == null || Number(form.value.price) <= 0) {
    error.value = 'Giá phải lớn hơn 0'
    return
  }
  if (form.value.categoryId == null) {
    error.value = 'Chọn danh mục'
    return
  }
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      price: Number(form.value.price),
      stockQuantity: Number(form.value.stockQuantity) || 0,
      imageUrl: form.value.imageUrl?.trim() || null,
      status: Boolean(form.value.status),
      categoryId: form.value.categoryId,
    }
    if (formMode.value === 'create') {
      await adminService.createProduct(payload)
      message.value = 'Tạo sản phẩm thành công'
    } else {
      await adminService.updateProduct(editingId.value, payload)
      message.value = 'Cập nhật sản phẩm thành công'
    }
    showForm.value = false
    loadPage()
  } catch (e) {
    error.value = e.message || 'Có lỗi xảy ra'
  }
}

const doDelete = async (row) => {
  if (!confirm('Bạn có chắc muốn xóa sản phẩm "' + row.name + '"?')) return
  error.value = ''
  try {
    await adminService.deleteProduct(row.productId)
    loadPage()
  } catch (e) {
    error.value = e.message || 'Không xóa được'
  }
}

const formatPrice = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '-')

onMounted(() => {
  loadCategories()
  loadPage()
})
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <input
            v-model="keyword"
            type="text"
            placeholder="Search products..."
            class="rounded-lg border border-slate-200 px-3 py-2 pl-9 text-sm w-48 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            @keyup.enter="loadPage"
          />
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="filterCategoryId"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          @change="loadPage"
        >
          <option :value="null">All categories</option>
          <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">{{ c.name }}</option>
        </select>
        <select
          v-model="sortBy"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          @change="loadPage"
        >
          <option value="createdAt">Newest first</option>
          <option value="name">Name A-Z</option>
          <option value="price">Price</option>
        </select>
        <select
          v-if="sortBy === 'price'"
          v-model="sortDirection"
          class="rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          @change="loadPage"
        >
          <option value="ASC">Low to high</option>
          <option value="DESC">High to low</option>
        </select>
        <button
          type="button"
          @click="loadPage"
          class="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-200"
        >
          Search
        </button>
      </div>
      <button
        type="button"
        @click="openCreate"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 shadow-sm"
      >
        Add new product
      </button>
    </div>

    <p v-if="error" class="text-red-600 text-sm mb-4">{{ error }}</p>
    <p v-if="message" class="text-green-600 text-sm mb-4">{{ message }}</p>

    <!-- Modal form -->
    <div
      v-if="showForm"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      @click.self="showForm = false"
    >
      <div class="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
        <h4 class="text-lg font-semibold text-slate-800 mb-4">{{ formMode === 'create' ? 'Thêm sản phẩm' : 'Sửa sản phẩm' }}</h4>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tên sản phẩm *</label>
            <input v-model="form.name" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea v-model="form.description" rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Giá *</label>
              <input v-model.number="form.price" type="number" min="0" step="1000" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-slate-700 mb-1">Tồn kho</label>
              <input v-model.number="form.stockQuantity" type="number" min="0" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">URL ảnh</label>
            <input v-model="form.imageUrl" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Danh mục *</label>
            <select v-model="form.categoryId" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm">
              <option :value="null">-- Chọn --</option>
              <option v-for="c in categories" :key="c.categoryId" :value="c.categoryId">{{ c.name }}</option>
            </select>
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.status" type="checkbox" id="prod-status" />
            <label for="prod-status" class="text-sm text-slate-700">Đang bán</label>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="showForm = false" class="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Hủy</button>
          <button type="button" @click="submitForm" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Lưu</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <div v-if="loading" class="p-8 text-center text-slate-500">Loading...</div>
      <div v-else-if="!page.content?.length" class="p-8 text-center text-slate-500">No products yet. Add your first product.</div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left py-3 px-4 font-medium text-slate-700">Name</th>
            <th class="text-left py-3 px-4 font-medium text-slate-700">Price</th>
            <th class="text-left py-3 px-4 font-medium text-slate-700">Stock</th>
            <th class="text-left py-3 px-4 font-medium text-slate-700">Status</th>
            <th class="text-right py-3 px-4 font-medium text-slate-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in page.content" :key="row.productId" class="border-b border-slate-100 hover:bg-slate-50/50">
            <td class="py-3 px-4 font-medium text-slate-900">{{ row.name }}</td>
            <td class="py-3 px-4">{{ formatPrice(row.price) }}</td>
            <td class="py-3 px-4">{{ row.stockQuantity ?? 0 }}</td>
            <td class="py-3 px-4">
              <span :class="row.status ? 'text-emerald-600' : 'text-slate-400'">{{ row.status ? 'Active' : 'Inactive' }}</span>
            </td>
            <td class="py-3 px-4 text-right">
              <button type="button" @click="openEdit(row)" class="text-blue-600 hover:underline font-medium mr-3">Edit</button>
              <button type="button" @click="doDelete(row)" class="text-red-600 hover:underline font-medium">Delete</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="page.totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600 bg-slate-50/50">
        <span>Page {{ page.number + 1 }} of {{ page.totalPages }} ({{ page.totalElements }} products)</span>
        <div class="flex gap-2">
          <button
            type="button"
            :disabled="page.number <= 0"
            @click="page.number--; loadPage()"
            class="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-white"
          >
            Previous
          </button>
          <button
            type="button"
            :disabled="page.number >= page.totalPages - 1"
            @click="page.number++; loadPage()"
            class="px-3 py-1.5 rounded-lg border border-slate-200 disabled:opacity-50 hover:bg-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
