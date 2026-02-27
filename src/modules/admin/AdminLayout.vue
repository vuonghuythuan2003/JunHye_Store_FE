<script setup>
import { computed, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../auth/useAuth'

const router = useRouter()
const route = useRoute()
const { currentUser, isAuthenticated, logout } = useAuth()

const showUserMenu = ref(false)
const showMobileSidebar = ref(false)

const displayName = computed(() => currentUser.value?.fullName || currentUser.value?.username || 'Admin')
const avatarInitial = computed(() => (displayName.value ? displayName.value.charAt(0).toUpperCase() : 'A'))

const navItems = [
  { path: '/admin', label: 'Dashboard', icon: 'dashboard' },
  { path: '/admin/products', label: 'Products Management', icon: 'products' },
  { path: '/admin/categories', label: 'Categories Management', icon: 'categories' },
  { path: '/admin/orders', label: 'Orders Management', icon: 'orders' },
  { path: '/admin/customers', label: 'Customers Management', icon: 'customers' },
  { path: '/admin/reports', label: 'Reports', icon: 'reports' },
  { path: '/admin/settings', label: 'Settings', icon: 'settings' },
]

const isActive = (path) => {
  if (path === '/admin') return route.path === '/admin'
  return route.path.startsWith(path)
}

const goStorefront = () => {
  showMobileSidebar.value = false
  router.push('/')
}

const handleLogout = async () => {
  showUserMenu.value = false
  showMobileSidebar.value = false
  try {
    await logout()
  } finally {
    router.replace('/auth')
  }
}

const closeMenus = () => {
  showUserMenu.value = false
  showMobileSidebar.value = false
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex">
    <!-- Mobile overlay -->
    <div
      v-if="showMobileSidebar"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
      aria-hidden="true"
      @click="closeMenus"
    />

    <!-- Fixed sidebar -->
    <aside
      :class="[
        'fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 transition-transform duration-200 ease-out',
        showMobileSidebar ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      ]"
    >
      <div class="p-5 border-b border-slate-200">
        <h1 class="text-lg font-bold text-slate-900 tracking-tight">JunHye Store</h1>
        <p class="text-xs text-slate-500 mt-0.5">Admin Panel</p>
      </div>
      <nav class="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          :class="[
            'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
            isActive(item.path)
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-slate-700 hover:bg-slate-100'
          ]"
          @click="showMobileSidebar = false"
        >
          <span class="w-5 h-5 rounded bg-slate-200/80 flex items-center justify-center text-xs" :class="isActive(item.path) ? 'bg-white/20' : ''">
            {{ item.label.charAt(0) }}
          </span>
          {{ item.label }}
        </router-link>
      </nav>
      <div class="p-3 border-t border-slate-200">
        <button
          type="button"
          @click="goStorefront"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-600 hover:bg-slate-100 transition-colors text-left"
        >
          Về gian hàng
        </button>
        <button
          type="button"
          @click="handleLogout"
          class="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-600 hover:bg-red-50 transition-colors mt-0.5 text-left font-medium"
        >
          Logout
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- Top bar -->
      <header class="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
            @click="showMobileSidebar = true"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h2 class="text-slate-800 font-semibold text-base">{{ route.meta?.title || 'Dashboard' }}</h2>
        </div>

        <div class="flex items-center gap-2">
          <!-- Search -->
          <div class="hidden md:block relative">
            <input
              type="search"
              placeholder="Search..."
              class="w-48 lg:w-56 pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
            />
            <svg class="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <!-- Notifications -->
          <button
            type="button"
            class="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors"
            aria-label="Notifications"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span class="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
          </button>
          <!-- User menu -->
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
              @click="showUserMenu = !showUserMenu"
            >
              <div class="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold">
                {{ avatarInitial }}
              </div>
              <span class="hidden sm:block text-sm font-medium text-slate-700 max-w-[120px] truncate">{{ displayName }}</span>
              <svg class="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              v-if="showUserMenu"
              class="absolute right-0 top-full mt-1 w-48 py-1 bg-white rounded-xl border border-slate-200 shadow-lg z-50"
            >
              <div class="px-3 py-2 border-b border-slate-100">
                <p class="text-sm font-medium text-slate-900 truncate">{{ displayName }}</p>
                <p class="text-xs text-slate-500 truncate">{{ currentUser?.email || 'Admin' }}</p>
              </div>
              <button
                type="button"
                class="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                @click="handleLogout"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main class="flex-1 overflow-auto p-4 lg:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
