<script setup>
import { ref } from 'vue'

const dateFrom = ref('')
const dateTo = ref('')
const reportType = ref('sales')
const loading = ref(false)
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-slate-800">Reports</h3>

    <div class="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">From date</label>
          <input
            v-model="dateFrom"
            type="date"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">To date</label>
          <input
            v-model="dateTo"
            type="date"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
        <div class="sm:col-span-2">
          <label class="block text-sm font-medium text-slate-700 mb-1">Report type</label>
          <select
            v-model="reportType"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="sales">Sales</option>
            <option value="orders">Orders</option>
            <option value="products">Products</option>
            <option value="customers">Customers</option>
          </select>
        </div>
      </div>
      <div class="mt-4">
        <button
          type="button"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Generate report
        </button>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="p-8 text-center text-slate-500">
        <p class="font-medium">Report results will appear here.</p>
        <p class="text-sm mt-1">Connect your backend reports API to show charts and export options.</p>
      </div>
    </div>
  </div>
</template>
