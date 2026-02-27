<script setup>
import { ref } from 'vue'
import { adminService } from './admin.service'

const orderId = ref('')
const loading = ref(false)
const message = ref('')
const error = ref('')

const search = ref('')
const statusFilter = ref('all')
const page = ref(1)
const totalPages = ref(1)
const orders = ref([])
const loadingList = ref(false)

const confirmRefund = async () => {
  const id = orderId.value?.trim()
  if (!id) {
    error.value = 'Enter order ID'
    return
  }
  const numId = Number(id)
  if (!Number.isInteger(numId) || numId <= 0) {
    error.value = 'Order ID must be a positive integer'
    return
  }
  loading.value = true
  message.value = ''
  error.value = ''
  try {
    await adminService.confirmRefundComplete(numId)
    message.value = 'Refund confirmed successfully.'
    orderId.value = ''
  } catch (e) {
    error.value = e.message || 'Failed to confirm refund'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h3 class="text-lg font-semibold text-slate-800">Orders Management</h3>
      <div class="flex flex-wrap items-center gap-3">
        <div class="relative">
          <input
            v-model="search"
            type="search"
            placeholder="Search by Order ID..."
            class="w-52 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
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
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>
    </div>

    <!-- Refund confirmation card -->
    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-xl">
      <h4 class="font-semibold text-slate-800 mb-1">Confirm refund complete</h4>
      <p class="text-sm text-slate-500 mb-4">
        Enter order ID to confirm that the refund has been completed for the customer (calls PUT /api/v1/admin/orders/:id/refund-complete).
      </p>
      <div class="flex flex-wrap gap-2 items-end">
        <div class="flex-1 min-w-[120px]">
          <label class="block text-sm font-medium text-slate-700 mb-1">Order ID</label>
          <input
            v-model="orderId"
            type="number"
            min="1"
            placeholder="e.g. 1"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
            @keyup.enter="confirmRefund"
          />
        </div>
        <button
          type="button"
          :disabled="loading"
          @click="confirmRefund"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Processing...' : 'Confirm refund' }}
        </button>
      </div>
      <p v-if="message" class="text-emerald-600 text-sm mt-3">{{ message }}</p>
      <p v-if="error" class="text-red-600 text-sm mt-3">{{ error }}</p>
    </div>

    <!-- Orders table placeholder -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200">
        <h4 class="font-semibold text-slate-800">All orders</h4>
        <p class="text-sm text-slate-500 mt-0.5">Connect GET /api/v1/admin/orders to load orders with pagination and filters.</p>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Order ID</th>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Customer</th>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Date</th>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Status</th>
              <th class="text-right py-3 px-4 font-medium text-slate-700">Total</th>
              <th class="text-right py-3 px-4 font-medium text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colspan="6" class="py-12 text-center text-slate-500">No orders to display. Add an admin orders API to load data.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" class="flex items-center justify-between px-4 py-3 border-t border-slate-200 text-sm text-slate-600 bg-slate-50/50">
        <span>Page {{ page }} of {{ totalPages }}</span>
        <div class="flex gap-2">
          <button type="button" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white">Previous</button>
          <button type="button" class="px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-white">Next</button>
        </div>
      </div>
    </div>
  </div>
</template>
