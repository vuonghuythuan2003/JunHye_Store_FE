import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components for better code splitting and initial load performance
const GuestStorefront = () => import('../modules/storefront/GuestStorefront.vue')
const AuthPage = () => import('../modules/auth/AuthPage.vue')
const AuthCallbackPage = () => import('../modules/auth/AuthCallbackPage.vue')
const UserHomePage = () => import('../modules/user/UserHomePage.vue')
const ConnectionTest = () => import('../components/ConnectionTest.vue')
const AdminLayout = () => import('../modules/admin/AdminLayout.vue')
const AdminDashboard = () => import('../modules/admin/AdminDashboard.vue')
const AdminProducts = () => import('../modules/admin/AdminProducts.vue')
const AdminCategories = () => import('../modules/admin/AdminCategories.vue')
const AdminOrders = () => import('../modules/admin/AdminOrders.vue')
const AdminCustomers = () => import('../modules/admin/AdminCustomers.vue')
const AdminReports = () => import('../modules/admin/AdminReports.vue')
const AdminSettings = () => import('../modules/admin/AdminSettings.vue')
const ResetPasswordPage = () => import('../modules/auth/ResetPasswordPage.vue')

const routes = [
  {
    path: '/',
    name: 'storefront',
    component: GuestStorefront,
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthPage,
  },
  {
    path: '/auth/callback',
    name: 'auth-callback',
    component: AuthCallbackPage,
  },
  {
    path: '/auth/reset-password',
    name: 'reset-password',
    component: ResetPasswordPage,
  },
  {
    path: '/user',
    name: 'user-home',
    component: UserHomePage,
  },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      { path: '', name: 'admin-dashboard', component: AdminDashboard, meta: { title: 'Dashboard' } },
      { path: 'products', name: 'admin-products', component: AdminProducts, meta: { title: 'Products Management' } },
      { path: 'categories', name: 'admin-categories', component: AdminCategories, meta: { title: 'Categories Management' } },
      { path: 'orders', name: 'admin-orders', component: AdminOrders, meta: { title: 'Orders Management' } },
      { path: 'customers', name: 'admin-customers', component: AdminCustomers, meta: { title: 'Customers Management' } },
      { path: 'reports', name: 'admin-reports', component: AdminReports, meta: { title: 'Reports' } },
      { path: 'settings', name: 'admin-settings', component: AdminSettings, meta: { title: 'Settings' } },
    ],
  },
  {
    path: '/test-connection',
    name: 'test-connection',
    component: ConnectionTest,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

// Require auth for admin routes; admin path also requires ADMIN role from BE
function hasAdminRole(user) {
  if (!user || !user.roles) return false
  const roles = user.roles
  if (!Array.isArray(roles)) return false
  return roles.some((r) => r === 'ADMIN' || (typeof r === 'object' && r && (r.roleName === 'ADMIN' || r.name === 'ADMIN')))
}

router.beforeEach(async (to, from, next) => {
  if (to.matched.some((r) => r.meta?.requiresAuth)) {
    const token = localStorage.getItem('junhye.auth.token')
    if (!token) {
      next({ path: '/auth', query: { redirect: to.fullPath } })
      return
    }
    if (to.path.startsWith('/admin')) {
      const { authService } = await import('../modules/auth/auth.service')
      const cachedUser = authService.getUser()
      if (cachedUser && hasAdminRole(cachedUser)) {
        next()
        return
      }
      try {
        await authService.fetchCurrentUser()
      } catch (e) {
        next({ path: '/auth', query: { redirect: to.fullPath } })
        return
      }
      const user = authService.getUser()
      if (!hasAdminRole(user)) {
        next({ path: '/', query: { error: 'forbidden_admin' } })
        return
      }
    }
  }
  next()
})
