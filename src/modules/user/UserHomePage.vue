<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../auth/useAuth'

const router = useRouter()
const { currentUser, isAuthenticated, logout } = useAuth()

const displayName = computed(() => {
  return currentUser.value?.fullName || currentUser.value?.username || 'Người dùng'
})

const email = computed(() => currentUser.value?.email || 'Chưa cập nhật email')

if (!isAuthenticated()) {
  router.replace('/auth')
}

const goStorefront = () => {
  router.push('/')
}

const goAuth = () => {
  router.push('/auth')
}

const handleLogout = async () => {
  await logout()
  goAuth()
}
</script>

<template>
  <main class="user-page">
    <section class="user-card">
      <p class="kicker">Welcome back</p>
      <h1>{{ displayName }}</h1>
      <p class="email">{{ email }}</p>

      <div class="actions">
        <button class="btn btn-outline" @click="goStorefront">Về trang mua sắm</button>
        <button class="btn btn-primary" @click="handleLogout">Đăng xuất</button>
      </div>
    </section>
  </main>
</template>

<style scoped>
.user-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px 12px;
}

.user-card {
  width: min(680px, 100%);
  border: 1px solid var(--border);
  border-radius: 20px;
  background: var(--card-bg);
  padding: 28px;
}

.kicker {
  margin: 0;
  color: var(--text-muted);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: 0.78rem;
}

h1 {
  margin: 10px 0 6px;
}

.email {
  margin: 0;
  color: var(--text-muted);
}

.actions {
  margin-top: 22px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}
</style>
