import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components for better code splitting and initial load performance
const GuestStorefront = () => import('../modules/storefront/GuestStorefront.vue')
const AuthPage = () => import('../modules/auth/AuthPage.vue')
const AuthCallbackPage = () => import('../modules/auth/AuthCallbackPage.vue')
const UserHomePage = () => import('../modules/user/UserHomePage.vue')
const ConnectionTest = () => import('../components/ConnectionTest.vue')

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
    path: '/user',
    name: 'user-home',
    component: UserHomePage,
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
