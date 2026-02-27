<script setup>
import { ref } from 'vue'

const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
const totalPages = ref(1)
const customers = ref([])
const loading = ref(false)
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h3 class="text-lg font-semibold text-slate-800">Customers Management</h3>
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <input
            v-model="search"
            type="search"
            placeholder="Search customers..."
            class="w-56 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
          <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <select
          v-model="statusFilter"
          class="py-2 pl-3 pr-8 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
        >
          <option value="all">All status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-8 text-center text-slate-500">
        <p class="font-medium">Customers list will be loaded from API.</p>
        <p class="text-sm mt-1">Connect your backend GET /api/v1/admin/customers (or users) to display data here.</p>
      </div>
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600">
        <span>Page {{ page }} of {{ totalPages }}</span>
        <div class="flex gap-2">
          <button type="button" class="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">Previous</button>
          <button type="button" class="px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
