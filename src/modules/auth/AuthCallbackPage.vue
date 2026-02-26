<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './useAuth'

const route = useRoute()
const router = useRouter()
const { completeOAuthCallback } = useAuth()

const status = ref('Đang xử lý đăng nhập mạng xã hội...')
const hasError = ref(false)

onMounted(async () => {
  try {
    if (route.query.error) {
      throw new Error(route.query.message || route.query.error)
    }

    completeOAuthCallback(route.query)
    status.value = 'Đăng nhập thành công. Đang chuyển đến trang người dùng...'
    setTimeout(() => {
      router.replace('/user')
    }, 1000)
  } catch (error) {
    hasError.value = true
    status.value = error.message || 'Không thể xử lý dữ liệu callback từ backend'
  }
})
</script>

<template>
  <main class="callback-wrap">
    <section class="callback-card">
      <div class="dot" :class="{ error: hasError }" />
      <h1>{{ hasError ? 'Đăng nhập thất bại' : 'Social Login' }}</h1>
      <p>{{ status }}</p>
      <RouterLink to="/auth" class="action-link">Quay lại trang đăng nhập</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.callback-wrap {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 16px;
}

.callback-card {
  width: min(560px, 100%);
  border: 1px solid var(--border);
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.86);
  padding: 24px;
  text-align: center;
}

.dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  margin: 0 auto 12px;
  background: #4f46e5;
  animation: pulse 1.2s infinite;
}

.dot.error {
  background: #dc2626;
  animation: none;
}

h1 {
  margin: 0;
}

p {
  color: var(--text-muted);
}

.action-link {
  display: inline-block;
  margin-top: 10px;
  color: var(--text-main);
  font-weight: 600;
}

@keyframes pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.18);
    opacity: 0.7;
  }
}
</style>
