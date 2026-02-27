<script setup>
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from './useAuth'

const route = useRoute()
const router = useRouter()
const { completeOAuthCallback } = useAuth()

const status = ref('Đang xử lý đăng nhập mạng xã hội...')
const hasError = ref(false)
const isLoading = ref(true)

onMounted(async () => {
  try {
    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 500))
    
    // Check for error from backend
    if (route.query.error) {
      const errorMsg = route.query.message || route.query.error
      // Map common error codes to user-friendly messages
      const errorMessages = {
        'oauth2_login_failed': 'Đăng nhập OAuth thất bại. Vui lòng thử lại.',
        'invalid_user_info_response': 'Không thể lấy thông tin từ Google. Vui lòng thử lại.',
        'social_email_not_found': 'Không tìm thấy email từ tài khoản Google.',
      }
      throw new Error(errorMessages[errorMsg] || errorMsg || 'Đăng nhập thất bại')
    }

    // Check if we have required parameters
    if (!route.query.token && !route.query.error) {
      throw new Error('Thiếu thông tin xác thực. Vui lòng thử đăng nhập lại.')
    }

    status.value = 'Đang xác thực thông tin...'
    const result = completeOAuthCallback(route.query)
    
    status.value = 'Đăng nhập thành công! Đang chuyển hướng...'
    isLoading.value = false
    
    // Redirect after showing success message
    setTimeout(() => {
      router.replace('/user')
    }, 1500)
  } catch (error) {
    isLoading.value = false
    hasError.value = true
    status.value = error.message || 'Không thể xử lý dữ liệu callback từ backend'
    console.error('OAuth callback error:', error)
  }
})
</script>

<template>
  <main class="callback-wrap">
    <section class="callback-card">
      <div v-if="isLoading" class="spinner-large"></div>
      <div v-else class="dot" :class="{ error: hasError, success: !hasError }" />
      <h1>{{ hasError ? 'Đăng nhập thất bại' : isLoading ? 'Đang xử lý...' : 'Đăng nhập thành công' }}</h1>
      <p>{{ status }}</p>
      <RouterLink v-if="!isLoading" to="/auth" class="action-link">
        {{ hasError ? 'Quay lại trang đăng nhập' : 'Tiếp tục' }}
      </RouterLink>
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

.dot.success {
  background: #16a34a;
  animation: pulse 1.2s infinite;
}

.spinner-large {
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  margin: 0 auto 16px;
  animation: spin 0.8s linear infinite;
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
