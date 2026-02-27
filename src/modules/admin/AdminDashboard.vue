<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AdminRevenueChart from './components/AdminRevenueChart.vue'
import AdminOrdersPieChart from './components/AdminOrdersPieChart.vue'
import { adminService } from './admin.service'

const router = useRouter()

// Stats (can be replaced with API later)
const stats = ref({
  totalRevenue: 0,
  totalOrders: 0,
  totalCustomers: 0,
  totalProducts: 0,
})

const revenueLabels = ref([])
const revenueData = ref([])
const ordersByStatusLabels = ref(['Pending', 'Paid', 'Delivered', 'Cancelled', 'Refunded'])
const ordersByStatusData = ref([12, 28, 45, 5, 3])

const recentOrders = ref([])
const loadingOrders = ref(false)

const formatPrice = (v) => (v != null ? new Intl.NumberFormat('vi-VN').format(v) + 'đ' : '-')
const formatDate = (d) => {
  if (!d) return '-'
  const date = typeof d === 'string' ? new Date(d) : d
  return new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(date)
}

const statusBadgeClass = (status) => {
  const s = (status || '').toLowerCase()
  if (s === 'delivered' || s === 'completed') return 'bg-emerald-100 text-emerald-800'
  if (s === 'paid' || s === 'confirmed') return 'bg-blue-100 text-blue-800'
  if (s === 'pending') return 'bg-amber-100 text-amber-800'
  if (s === 'cancelled') return 'bg-slate-100 text-slate-700'
  if (s === 'refunded') return 'bg-purple-100 text-purple-800'
  return 'bg-slate-100 text-slate-700'
}

const loadStats = async () => {
  try {
    const [productsRes, categoriesRes] = await Promise.all([
      adminService.getProductsPage({ page: 0, size: 1 }).catch(() => ({ totalElements: 0 })),
      adminService.getAllCategories().catch(() => []),
    ])
    const totalProducts = productsRes?.totalElements ?? 0
    const totalCategories = Array.isArray(categoriesRes) ? categoriesRes.length : 0
    stats.value = {
      totalRevenue: 124500000,
      totalOrders: 93,
      totalCustomers: 48,
      totalProducts,
    }
    revenueLabels.value = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12']
    revenueData.value = [4200000, 8100000, 7200000, 9500000, 11200000, 15800000, 14200000, 18900000, 17500000, 21000000, 19800000, 23500000]
  } catch (_) {
    revenueLabels.value = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
    revenueData.value = [1200000, 1900000, 2800000, 2500000, 3200000, 4100000]
  }
}

const loadRecentOrders = async () => {
  loadingOrders.value = true
  try {
    recentOrders.value = [
      { orderId: 1001, customerName: 'Nguyễn Văn A', date: new Date(), orderStatus: 'Delivered', paymentStatus: 'Paid', totalPrice: 450000 },
      { orderId: 1002, customerName: 'Trần Thị B', date: new Date(Date.now() - 86400000), orderStatus: 'Paid', paymentStatus: 'Paid', totalPrice: 890000 },
      { orderId: 1003, customerName: 'Lê Văn C', date: new Date(Date.now() - 172800000), orderStatus: 'Pending', paymentStatus: 'Pending', totalPrice: 320000 },
      { orderId: 1004, customerName: 'Phạm Thị D', date: new Date(Date.now() - 259200000), orderStatus: 'Cancelled', paymentStatus: 'Refunded', totalPrice: 156000 },
      { orderId: 1005, customerName: 'Hoàng Văn E', date: new Date(Date.now() - 345600000), orderStatus: 'Delivered', paymentStatus: 'Paid', totalPrice: 2100000 },
    ]
  } catch (_) {
    recentOrders.value = []
  } finally {
    loadingOrders.value = false
  }
}

const viewOrder = (order) => {
  router.push({ path: '/admin/orders', query: { id: order.orderId } })
}

onMounted(() => {
  loadStats()
  loadRecentOrders()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Stats cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">Total Revenue</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ formatPrice(stats.totalRevenue) }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">Total Orders</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.totalOrders }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">Total Customers</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.totalCustomers }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-slate-500">Total Products</p>
            <p class="text-2xl font-bold text-slate-900 mt-1">{{ stats.totalProducts }}</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center">
            <svg class="w-6 h-6 text-violet-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Charts row -->
    <div class="grid grid-cols-1 xl:grid-cols-3 gap-6">
      <div class="xl:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 class="text-base font-semibold text-slate-800 mb-4">Revenue over time</h3>
        <AdminRevenueChart :labels="revenueLabels" :data="revenueData" :height="280" />
      </div>
      <div class="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
        <h3 class="text-base font-semibold text-slate-800 mb-4">Orders by status</h3>
        <AdminOrdersPieChart :labels="ordersByStatusLabels" :data="ordersByStatusData" :height="260" />
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div class="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
        <h3 class="text-base font-semibold text-slate-800">Recent Orders</h3>
        <router-link
          to="/admin/orders"
          class="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View all
        </router-link>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 border-b border-slate-200">
            <tr>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Order ID</th>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Customer Name</th>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Date</th>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Order Status</th>
              <th class="text-left py-3 px-4 font-medium text-slate-700">Payment Status</th>
              <th class="text-right py-3 px-4 font-medium text-slate-700">Total Price</th>
              <th class="text-right py-3 px-4 font-medium text-slate-700">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="loadingOrders" class="border-b border-slate-100">
              <td colspan="7" class="py-8 text-center text-slate-500">Loading...</td>
            </tr>
            <tr v-else-if="!recentOrders.length" class="border-b border-slate-100">
              <td colspan="7" class="py-8 text-center text-slate-500">No orders yet.</td>
            </tr>
            <tr
              v-else
              v-for="row in recentOrders"
              :key="row.orderId"
              class="border-b border-slate-100 hover:bg-slate-50/50 transition-colors"
            >
              <td class="py-3 px-4 font-medium text-slate-900">#{{ row.orderId }}</td>
              <td class="py-3 px-4 text-slate-700">{{ row.customerName }}</td>
              <td class="py-3 px-4 text-slate-600">{{ formatDate(row.date) }}</td>
              <td class="py-3 px-4">
                <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', statusBadgeClass(row.orderStatus)]">
                  {{ row.orderStatus }}
                </span>
              </td>
              <td class="py-3 px-4">
                <span :class="['inline-flex px-2 py-0.5 rounded-full text-xs font-medium', statusBadgeClass(row.paymentStatus)]">
                  {{ row.paymentStatus }}
                </span>
              </td>
              <td class="py-3 px-4 text-right font-medium text-slate-900">{{ formatPrice(row.totalPrice) }}</td>
              <td class="py-3 px-4 text-right">
                <button
                  type="button"
                  class="text-blue-600 font-medium hover:underline"
                  @click="viewOrder(row)"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
