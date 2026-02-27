<script setup>
import { ref, onMounted } from 'vue'
import { adminService } from './admin.service'

const loading = ref(false)
const page = ref({ content: [], totalPages: 0, totalElements: 0, number: 0, size: 10 })
const keyword = ref('')
const showForm = ref(false)
const formMode = ref('create')
const editingId = ref(null)
const message = ref('')
const error = ref('')
const form = ref({ name: '', description: '', imageUrl: '', status: true })

const loadPage = async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await adminService.getCategoriesPage({
      page: page.value.number,
      size: page.value.size,
      sortBy: 'createdAt',
      sortDirection: 'DESC',
      keyword: keyword.value || undefined,
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
  form.value = { name: '', description: '', imageUrl: '', status: true }
  showForm.value = true
  message.value = ''
  error.value = ''
}

const openEdit = (row) => {
  formMode.value = 'edit'
  editingId.value = row.categoryId
  form.value = {
    name: row.name,
    description: row.description || '',
    imageUrl: row.imageUrl || '',
    status: row.status !== false,
  }
  showForm.value = true
  message.value = ''
  error.value = ''
}

const submitForm = async () => {
  message.value = ''
  error.value = ''
  if (!form.value.name?.trim()) {
    error.value = 'Tên danh mục không được để trống'
    return
  }
  try {
    const payload = {
      name: form.value.name.trim(),
      description: form.value.description?.trim() || null,
      imageUrl: form.value.imageUrl?.trim() || null,
      status: Boolean(form.value.status),
    }
    if (formMode.value === 'create') {
      await adminService.createCategory(payload)
      message.value = 'Tạo danh mục thành công'
    } else {
      await adminService.updateCategory(editingId.value, payload)
      message.value = 'Cập nhật danh mục thành công'
    }
    showForm.value = false
    loadPage()
  } catch (e) {
    error.value = e.message || 'Có lỗi xảy ra'
  }
}

const doDelete = async (row) => {
  if (!confirm('Bạn có chắc muốn xóa danh mục "' + row.name + '"?')) return
  error.value = ''
  try {
    await adminService.deleteCategory(row.categoryId)
    loadPage()
  } catch (e) {
    error.value = e.message || 'Không xóa được'
  }
}

onMounted(loadPage)
</script>

<template>
  <div>
    <div class="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div class="flex flex-wrap items-center gap-3">
        <input
          v-model="keyword"
          type="text"
          placeholder="Tìm theo tên..."
          class="rounded-lg border border-slate-300 px-3 py-2 text-sm w-48 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          @keyup.enter="loadPage"
        />
        <button
          type="button"
          @click="loadPage"
          class="px-4 py-2 bg-slate-200 text-slate-800 rounded-lg text-sm font-medium hover:bg-slate-300"
        >
          Tìm kiếm
        </button>
      </div>
      <button
        type="button"
        @click="openCreate"
        class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700"
      >
        Thêm danh mục
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
      <div class="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
        <h4 class="text-lg font-semibold text-slate-800 mb-4">{{ formMode === 'create' ? 'Thêm danh mục' : 'Sửa danh mục' }}</h4>
        <div class="space-y-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Tên danh mục *</label>
            <input v-model="form.name" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">Mô tả</label>
            <textarea v-model="form.description" rows="2" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"></textarea>
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1">URL ảnh</label>
            <input v-model="form.imageUrl" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm" />
          </div>
          <div class="flex items-center gap-2">
            <input v-model="form.status" type="checkbox" id="cat-status" />
            <label for="cat-status" class="text-sm text-slate-700">Kích hoạt</label>
          </div>
        </div>
        <div class="flex justify-end gap-2 mt-6">
          <button type="button" @click="showForm = false" class="px-4 py-2 border border-slate-300 rounded-lg text-sm hover:bg-slate-50">Hủy</button>
          <button type="button" @click="submitForm" class="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm hover:bg-indigo-700">Lưu</button>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div v-if="loading" class="p-8 text-center text-slate-500">Đang tải...</div>
      <div v-else-if="!page.content?.length" class="p-8 text-center text-slate-500">Chưa có danh mục nào.</div>
      <table v-else class="w-full text-sm">
        <thead class="bg-slate-50 border-b border-slate-200">
          <tr>
            <th class="text-left py-3 px-4 font-medium text-slate-700">Tên</th>
            <th class="text-left py-3 px-4 font-medium text-slate-700">Mô tả</th>
            <th class="text-left py-3 px-4 font-medium text-slate-700">Trạng thái</th>
            <th class="text-right py-3 px-4 font-medium text-slate-700">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="row in page.content" :key="row.categoryId" class="border-b border-slate-100 hover:bg-slate-50/50">
            <td class="py-3 px-4">{{ row.name }}</td>
            <td class="py-3 px-4 max-w-xs truncate">{{ row.description || '-' }}</td>
            <td class="py-3 px-4">
              <span :class="row.status ? 'text-green-600' : 'text-slate-400'">{{ row.status ? 'Bật' : 'Tắt' }}</span>
            </td>
            <td class="py-3 px-4 text-right">
              <button type="button" @click="openEdit(row)" class="text-indigo-600 hover:underline mr-2">Sửa</button>
              <button type="button" @click="doDelete(row)" class="text-red-600 hover:underline">Xóa</button>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="page.totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
        <span>Trang {{ page.number + 1 }} / {{ page.totalPages }} ({{ page.totalElements }} danh mục)</span>
        <div class="flex gap-2">
          <button
            type="button"
            :disabled="page.number <= 0"
            @click="page.number--; loadPage()"
            class="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
          >
            Trước
          </button>
          <button
            type="button"
            :disabled="page.number >= page.totalPages - 1"
            @click="page.number++; loadPage()"
            class="px-3 py-1 rounded border border-slate-300 disabled:opacity-50 hover:bg-slate-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
