<script setup>
import { ref } from 'vue'

const storeName = ref('JunHye Store')
const currency = ref('VND')
const timezone = ref('Asia/Ho_Chi_Minh')
const saveLoading = ref(false)
const message = ref('')
</script>

<template>
  <div class="space-y-6">
    <h3 class="text-lg font-semibold text-slate-800">Settings</h3>

    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200">
        <h4 class="font-medium text-slate-800">Store settings</h4>
        <p class="text-sm text-slate-500 mt-0.5">Basic information for your store.</p>
      </div>
      <div class="p-5 space-y-4 max-w-xl">
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Store name</label>
          <input
            v-model="storeName"
            type="text"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Currency</label>
          <select
            v-model="currency"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="VND">VND</option>
            <option value="USD">USD</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-slate-700 mb-1">Timezone</label>
          <select
            v-model="timezone"
            class="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
          >
            <option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div class="pt-2">
          <button
            type="button"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Save changes
          </button>
          <p v-if="message" class="text-sm text-green-600 mt-2">{{ message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>
