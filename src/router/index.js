import { createRouter, createWebHistory } from 'vue-router'
import GuestStorefront from '../modules/storefront/GuestStorefront.vue'
import AuthPage from '../modules/auth/AuthPage.vue'
import AuthCallbackPage from '../modules/auth/AuthCallbackPage.vue'

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
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
