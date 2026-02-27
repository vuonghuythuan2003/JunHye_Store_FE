<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { authService } from './auth.service'

const router = useRouter()

const code = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const onCodeInput = (e) => {
  const v = (e.target.value || '').replace(/\D/g, '').slice(0, 6)
  code.value = v
  e.target.value = v
}

const handleReset = async () => {
  errorMessage.value = ''
  successMessage.value = ''

  const codeStr = String(code.value || '').trim()
  if (codeStr.length !== 6 || !/^\d{6}$/.test(codeStr)) {
    errorMessage.value = 'Mã phải là 6 chữ số.'
    return
  }
  if (newPassword.value.length < 8) {
    errorMessage.value = 'Mật khẩu tối thiểu 8 ký tự, có chữ hoa, chữ thường và số.'
    return
  }
  if (newPassword.value !== confirmPassword.value) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp.'
    return
  }

  submitting.value = true
  try {
    const result = await authService.resetPassword(codeStr, newPassword.value)
    successMessage.value = result.message || 'Đặt lại mật khẩu thành công.'
    setTimeout(() => router.replace('/auth'), 2000)
  } catch (err) {
    errorMessage.value = err.message || 'Mã không đúng hoặc đã hết hạn.'
  } finally {
    submitting.value = false
  }
}

const goAuth = () => router.push('/auth')
</script>

<template>
  <main class="reset-page">
    <section class="reset-card">
      <h1>Đặt lại mật khẩu</h1>
      <p class="hint">
        Nhập mã 6 số đã gửi đến email của bạn và mật khẩu mới. Chưa có mã? <RouterLink to="/auth">Gửi yêu cầu quên mật khẩu</RouterLink>.
      </p>
      <form class="form" @submit.prevent="handleReset">
        <label>
          Mã 6 số
          <input
            :value="code"
            type="text"
            inputmode="numeric"
            maxlength="6"
            placeholder="000000"
            class="code-input"
            @input="onCodeInput"
          />
        </label>
        <label>
          Mật khẩu mới
          <input
            v-model="newPassword"
            type="password"
            required
            minlength="8"
            placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số"
          />
        </label>
        <label>
          Xác nhận mật khẩu
          <input
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Nhập lại mật khẩu"
          />
        </label>
        <button type="submit" class="btn btn-primary" :disabled="submitting">
          {{ submitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}
        </button>
      </form>
      <p v-if="successMessage" class="feedback success">{{ successMessage }}</p>
      <p v-if="errorMessage" class="feedback error">{{ errorMessage }}</p>
      <RouterLink to="/auth" class="back-link">← Quay lại đăng nhập</RouterLink>
    </section>
  </main>
</template>

<style scoped>
.reset-page {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
}

.reset-card {
  width: min(420px, 100%);
  padding: 28px;
  border-radius: 16px;
  border: 1px solid var(--border);
  background: var(--card-bg);
}

h1 {
  margin: 0 0 16px;
  font-size: 1.35rem;
}

.hint {
  color: var(--text-muted);
  margin: 0 0 16px;
  font-size: 0.9rem;
}

.form {
  display: grid;
  gap: 14px;
  margin-bottom: 14px;
}

label {
  display: grid;
  gap: 6px;
  font-weight: 500;
}

input {
  height: 42px;
  padding: 0 12px;
  border: 1px solid var(--border);
  border-radius: 10px;
  outline: none;
}

.code-input {
  font-size: 1.25rem;
  letter-spacing: 0.5em;
  text-align: center;
}

input:focus {
  border-color: #6366f1;
}

.btn-primary {
  padding: 10px 18px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
  color: #fff;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.feedback {
  margin: 0 0 12px;
  padding: 10px 12px;
  border-radius: 10px;
  font-size: 0.9rem;
}

.feedback.success {
  background: #d1fae5;
  color: #065f46;
}

.feedback.error {
  background: #fee2e2;
  color: #991b1b;
}

.back-link {
  display: inline-block;
  margin-top: 8px;
  color: var(--text-main);
  font-weight: 600;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}
</style>
