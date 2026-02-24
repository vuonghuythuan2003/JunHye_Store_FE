<script setup>
import { computed, reactive, ref } from 'vue'
import { useAuth } from '../useAuth'

const tab = ref('signin')
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const signInForm = reactive({
  username: '',
  password: '',
})

const signUpForm = reactive({
  username: '',
  fullName: '',
  phoneNumber: '',
  address: '',
  email: '',
  password: '',
  confirmPassword: '',
})

const forgotForm = reactive({
  email: '',
})

const { currentUser, isAuthenticated, signIn, signUp, forgotPassword, startSocialLogin, logout } = useAuth()

const title = computed(() => {
  if (tab.value === 'signin') return 'Đăng nhập nhanh'
  if (tab.value === 'signup') return 'Tạo tài khoản mới'
  return 'Khôi phục mật khẩu'
})

const resetFeedback = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const handleSignIn = async () => {
  resetFeedback()
  submitting.value = true

  try {
    const result = await signIn(signInForm)
    successMessage.value = result.message
    signInForm.password = ''
  } catch (error) {
    errorMessage.value = error.message || 'Đăng nhập thất bại'
  } finally {
    submitting.value = false
  }
}

const handleSignUp = async () => {
  resetFeedback()

  if (signUpForm.password !== signUpForm.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp'
    return
  }

  submitting.value = true

  try {
    const result = await signUp(signUpForm)
    successMessage.value = result.message
    tab.value = 'signin'
    signInForm.username = signUpForm.username
    signInForm.password = ''
  } catch (error) {
    errorMessage.value = error.message || 'Đăng ký thất bại'
  } finally {
    submitting.value = false
  }
}

const handleForgot = async () => {
  resetFeedback()
  submitting.value = true

  try {
    const result = await forgotPassword(forgotForm)
    successMessage.value = result.message
  } catch (error) {
    errorMessage.value = error.message || 'Không gửi được yêu cầu quên mật khẩu'
  } finally {
    submitting.value = false
  }
}

const handleLogout = async () => {
  resetFeedback()
  submitting.value = true

  try {
    const result = await logout()
    successMessage.value = result.message
  } catch (error) {
    errorMessage.value = error.message || 'Đăng xuất thất bại'
  } finally {
    submitting.value = false
  }
}

const handleSocialLogin = (provider) => {
  resetFeedback()

  try {
    startSocialLogin(provider)
  } catch (error) {
    errorMessage.value = error.message || 'Không thể khởi tạo đăng nhập mạng xã hội'
  }
}
</script>

<template>
  <section class="auth-panel reveal">
    <div class="auth-glow" />

    <div class="auth-header">
      <p class="kicker">Member Access</p>
      <h2>{{ title }}</h2>
      <p class="sub">Kết nối trực tiếp Backend để đăng nhập, đăng ký và quản lý phiên người dùng.</p>
    </div>

    <div class="tabs" role="tablist" aria-label="auth tabs">
      <button class="tab" :class="{ active: tab === 'signin' }" @click="tab = 'signin'; resetFeedback()">Đăng nhập</button>
      <button class="tab" :class="{ active: tab === 'signup' }" @click="tab = 'signup'; resetFeedback()">Đăng ký</button>
      <button class="tab" :class="{ active: tab === 'forgot' }" @click="tab = 'forgot'; resetFeedback()">Quên mật khẩu</button>
    </div>

    <div v-if="!isAuthenticated()" class="social-wrap">
      <p class="social-title">Hoặc tiếp tục với</p>
      <div class="social-grid">
        <button class="social-btn google" type="button" @click="handleSocialLogin('google')">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.6 12.23c0-.77-.07-1.51-.2-2.23H12v4.22h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.96-4.34 2.96-7.54Z" fill="#4285F4"/>
              <path d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.52c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.06v2.6A9.99 9.99 0 0 0 12 22Z" fill="#34A853"/>
              <path d="M6.41 13.88A6.02 6.02 0 0 1 6.1 12c0-.65.11-1.28.31-1.88V7.52H3.06A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.06 4.48l3.35-2.6Z" fill="#FBBC05"/>
              <path d="M12 5.98c1.47 0 2.79.5 3.83 1.47l2.87-2.87A9.96 9.96 0 0 0 12 2 9.99 9.99 0 0 0 3.06 7.52l3.35 2.6c.79-2.36 2.99-4.14 5.59-4.14Z" fill="#EA4335"/>
            </svg>
          </span>
          <span>Google</span>
        </button>
        <button class="social-btn facebook" type="button" @click="handleSocialLogin('facebook')">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.5-4.3 4.4V11H8v3h2v8h3.5Z"/>
            </svg>
          </span>
          <span>Facebook</span>
        </button>
        <button class="social-btn apple" type="button" @click="handleSocialLogin('apple')">
          <span class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.8 12.8c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.6-1.6-3.2-1.6-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.6 2.3-1.6 2.8-.4 7 1.1 9.1.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.6 2.6-.6s1.6.6 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-4.4ZM14.6 6.4c.6-.7 1-1.7.8-2.7-.9 0-1.9.6-2.5 1.3-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3Z"/>
            </svg>
          </span>
          <span>Apple</span>
        </button>
      </div>
    </div>

    <div v-if="isAuthenticated()" class="session-card">
      <p>Bạn đang đăng nhập với:</p>
      <h3>{{ currentUser?.fullName || currentUser?.username || 'Người dùng' }}</h3>
      <span>{{ currentUser?.email || 'Không có email' }}</span>
      <button class="btn btn-outline" :disabled="submitting" @click="handleLogout">
        {{ submitting ? 'Đang xử lý...' : 'Logout' }}
      </button>
    </div>

    <form v-else-if="tab === 'signin'" class="form-grid" @submit.prevent="handleSignIn">
      <label>
        Username
        <input v-model.trim="signInForm.username" required placeholder="nhap.username" />
      </label>
      <label>
        Mật khẩu
        <input v-model="signInForm.password" required type="password" placeholder="••••••••" />
      </label>
      <button class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Đang đăng nhập...' : 'Đăng nhập ngay' }}
      </button>
    </form>

    <form v-else-if="tab === 'signup'" class="form-grid" @submit.prevent="handleSignUp">
      <div class="two-cols">
        <label>
          Username
          <input v-model.trim="signUpForm.username" required placeholder="fashionlover" />
        </label>
        <label>
          Họ tên
          <input v-model.trim="signUpForm.fullName" placeholder="Nguyen Van A" />
        </label>
      </div>

      <div class="two-cols">
        <label>
          Email
          <input v-model.trim="signUpForm.email" required type="email" placeholder="mail@example.com" />
        </label>
        <label>
          Số điện thoại
          <input v-model.trim="signUpForm.phoneNumber" placeholder="090xxxxxxx" />
        </label>
      </div>

      <label>
        Địa chỉ
        <input v-model.trim="signUpForm.address" placeholder="Địa chỉ nhận hàng" />
      </label>

      <div class="two-cols">
        <label>
          Mật khẩu
          <input v-model="signUpForm.password" required type="password" placeholder="Tối thiểu 8 ký tự" />
        </label>
        <label>
          Xác nhận mật khẩu
          <input v-model="signUpForm.confirmPassword" required type="password" placeholder="Nhập lại mật khẩu" />
        </label>
      </div>

      <button class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản' }}
      </button>
    </form>

    <form v-else class="form-grid" @submit.prevent="handleForgot">
      <label>
        Email đăng ký
        <input v-model.trim="forgotForm.email" required type="email" placeholder="mail@example.com" />
      </label>
      <button class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Đang gửi...' : 'Gửi yêu cầu quên mật khẩu' }}
      </button>
    </form>

    <p v-if="successMessage" class="feedback success">{{ successMessage }}</p>
    <p v-if="errorMessage" class="feedback error">{{ errorMessage }}</p>
  </section>
</template>

<style scoped>
.auth-panel {
  position: relative;
  margin-top: 42px;
  padding: 24px;
  border-radius: 22px;
  border: 1px solid var(--border);
  background: linear-gradient(130deg, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0.58));
  overflow: hidden;
}

.auth-glow {
  position: absolute;
  top: -70px;
  right: -60px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(99, 102, 241, 0.28), transparent 62%);
  pointer-events: none;
}

.auth-header {
  position: relative;
}

.kicker {
  margin: 0;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
}

h2 {
  margin: 8px 0;
}

.sub {
  margin: 0 0 14px;
  color: var(--text-muted);
}

.tabs {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
}

.social-wrap {
  margin: 8px 0 14px;
}

.social-title {
  margin: 0 0 8px;
  color: var(--text-muted);
  font-size: 0.92rem;
}

.social-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.social-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: #fff;
  cursor: pointer;
  font-weight: 700;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.icon {
  width: 18px;
  height: 18px;
  display: inline-flex;
}

.icon svg {
  width: 100%;
  height: 100%;
}

.social-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.social-btn.google {
  color: #b91c1c;
}

.social-btn.facebook {
  color: #1d4ed8;
}

.social-btn.apple {
  color: #111827;
}

.tab {
  border: 1px solid var(--border);
  border-radius: 999px;
  padding: 8px 14px;
  background: #fff;
  cursor: pointer;
  font-weight: 600;
}

.tab.active {
  border-color: transparent;
  color: #fff;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.form-grid {
  display: grid;
  gap: 12px;
}

.two-cols {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

label {
  display: grid;
  gap: 6px;
  font-weight: 500;
}

input {
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 0 12px;
  outline: none;
  background: rgba(255, 255, 255, 0.88);
}

input:focus {
  border-color: #818cf8;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.16);
}

.session-card {
  display: grid;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 14px;
  background: #fff;
  padding: 16px;
}

.session-card p {
  margin: 0;
  color: var(--text-muted);
}

.session-card h3 {
  margin: 0;
}

.session-card span {
  color: var(--text-muted);
  margin-bottom: 6px;
}

.btn {
  width: fit-content;
  border: none;
  border-radius: 999px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
}

.btn-primary {
  color: #fff;
  background: linear-gradient(90deg, #6366f1, #8b5cf6);
}

.btn-outline {
  border: 1px solid var(--border-strong);
  background: transparent;
}

.feedback {
  margin-top: 12px;
  padding: 10px 14px;
  border-radius: 10px;
  font-weight: 500;
}

.feedback.success {
  color: #065f46;
  background: #d1fae5;
}

.feedback.error {
  color: #991b1b;
  background: #fee2e2;
}

@media (max-width: 760px) {
  .two-cols {
    grid-template-columns: 1fr;
  }

  .social-grid {
    grid-template-columns: 1fr;
  }
}
</style>
