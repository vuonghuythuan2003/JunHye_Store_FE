<script setup>
import { computed, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../useAuth'

const tab = ref('signin')
const submitting = ref(false)
const successMessage = ref('')
const errorMessage = ref('')

const signInForm = reactive({
  username: '',
  password: '',
})

const router = useRouter()

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

const { currentUser, isAuthenticated, signIn, signUp, forgotPassword, verifyResetCode, resetPassword, startSocialLogin, logout, isAdmin } = useAuth()

// Forgot password flow: 1 = email, 2 = enter code, 3 = new password
const forgotStep = ref(1)
const verifiedCode = ref('')

const forgotCodeForm = reactive({ code: '' })
const resetPasswordForm = reactive({ newPassword: '', confirmPassword: '' })

const title = computed(() => {
  if (tab.value === 'signin') return 'Đăng nhập nhanh'
  if (tab.value === 'signup') return 'Tạo tài khoản mới'
  return 'Khôi phục mật khẩu'
})

const resetFeedback = () => {
  successMessage.value = ''
  errorMessage.value = ''
}

const resetForgotFlow = () => {
  forgotStep.value = 1
  verifiedCode.value = ''
  forgotCodeForm.code = ''
  resetPasswordForm.newPassword = ''
  resetPasswordForm.confirmPassword = ''
}

const handleSignIn = async () => {
  resetFeedback()
  submitting.value = true

  try {
    const result = await signIn(signInForm)
    successMessage.value = result.message
    signInForm.password = ''
    router.replace(isAdmin() ? '/admin' : '/user')
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
    forgotStep.value = 2
  } catch (error) {
    errorMessage.value = error.message || 'Không gửi được yêu cầu quên mật khẩu'
  } finally {
    submitting.value = false
  }
}

const handleVerifyCode = async () => {
  resetFeedback()
  const code = (forgotCodeForm.code || '').trim().replace(/\D/g, '').slice(0, 6)
  if (code.length !== 6) {
    errorMessage.value = 'Vui lòng nhập đủ 6 chữ số'
    return
  }
  submitting.value = true

  try {
    await verifyResetCode(code)
    verifiedCode.value = code
    forgotStep.value = 3
    successMessage.value = ''
  } catch (error) {
    errorMessage.value = error.message || 'Mã không đúng hoặc đã hết hạn'
  } finally {
    submitting.value = false
  }
}

const handleResetPasswordSubmit = async () => {
  resetFeedback()
  if (resetPasswordForm.newPassword !== resetPasswordForm.confirmPassword) {
    errorMessage.value = 'Mật khẩu xác nhận không khớp'
    return
  }
  if (!resetPasswordForm.newPassword || resetPasswordForm.newPassword.length < 6) {
    errorMessage.value = 'Mật khẩu mới tối thiểu 6 ký tự'
    return
  }
  submitting.value = true

  try {
    const result = await resetPassword(verifiedCode.value, resetPasswordForm.newPassword)
    successMessage.value = result.message
    resetForgotFlow()
    tab.value = 'signin'
  } catch (error) {
    errorMessage.value = error.message || 'Đặt lại mật khẩu thất bại'
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

const socialLoading = ref('')

// Show password toggles (login + signup + forgot step 3)
const showSignInPassword = ref(false)
const showSignUpPassword = ref(false)
const showSignUpConfirm = ref(false)
const showResetNew = ref(false)
const showResetConfirm = ref(false)

const handleSocialLogin = (provider) => {
  resetFeedback()
  socialLoading.value = provider

  try {
    // Show loading message before redirect
    setTimeout(() => {
      startSocialLogin(provider)
    }, 300) // Small delay to show loading state
  } catch (error) {
    socialLoading.value = ''
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
      <button class="tab" :class="{ active: tab === 'signin' }" @click="tab = 'signin'; resetFeedback(); resetForgotFlow()">Đăng nhập</button>
      <button class="tab" :class="{ active: tab === 'signup' }" @click="tab = 'signup'; resetFeedback(); resetForgotFlow()">Đăng ký</button>
      <button class="tab" :class="{ active: tab === 'forgot' }" @click="tab = 'forgot'; resetFeedback()">Quên mật khẩu</button>
    </div>

    <div v-if="!isAuthenticated() && (tab === 'signin' || tab === 'signup')" class="social-wrap">
      <p class="social-title">Hoặc tiếp tục với</p>
      <div class="social-grid">
        <button 
          class="social-btn google" 
          type="button" 
          :disabled="socialLoading !== ''"
          @click="handleSocialLogin('google')"
        >
          <span v-if="socialLoading === 'google'" class="spinner" aria-hidden="true"></span>
          <span v-else class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M21.6 12.23c0-.77-.07-1.51-.2-2.23H12v4.22h5.4a4.62 4.62 0 0 1-2 3.03v2.52h3.24c1.9-1.75 2.96-4.34 2.96-7.54Z" fill="#4285F4"/>
              <path d="M12 22c2.7 0 4.96-.9 6.62-2.43l-3.24-2.52c-.9.6-2.05.95-3.38.95-2.6 0-4.8-1.76-5.59-4.12H3.06v2.6A9.99 9.99 0 0 0 12 22Z" fill="#34A853"/>
              <path d="M6.41 13.88A6.02 6.02 0 0 1 6.1 12c0-.65.11-1.28.31-1.88V7.52H3.06A9.99 9.99 0 0 0 2 12c0 1.61.39 3.13 1.06 4.48l3.35-2.6Z" fill="#FBBC05"/>
              <path d="M12 5.98c1.47 0 2.79.5 3.83 1.47l2.87-2.87A9.96 9.96 0 0 0 12 2 9.99 9.99 0 0 0 3.06 7.52l3.35 2.6c.79-2.36 2.99-4.14 5.59-4.14Z" fill="#EA4335"/>
            </svg>
          </span>
          <span>{{ socialLoading === 'google' ? 'Đang chuyển hướng...' : 'Google' }}</span>
        </button>
        <button 
          class="social-btn facebook" 
          type="button" 
          :disabled="socialLoading !== ''"
          @click="handleSocialLogin('facebook')"
        >
          <span v-if="socialLoading === 'facebook'" class="spinner" aria-hidden="true"></span>
          <span v-else class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M13.5 22v-8h2.7l.4-3h-3.1V9.1c0-.9.3-1.6 1.6-1.6h1.7V4.8c-.3 0-1.4-.1-2.6-.1-2.6 0-4.3 1.5-4.3 4.4V11H8v3h2v8h3.5Z"/>
            </svg>
          </span>
          <span>{{ socialLoading === 'facebook' ? 'Đang chuyển hướng...' : 'Facebook' }}</span>
        </button>
        <button 
          class="social-btn apple" 
          type="button" 
          :disabled="socialLoading !== ''"
          @click="handleSocialLogin('apple')"
        >
          <span v-if="socialLoading === 'apple'" class="spinner" aria-hidden="true"></span>
          <span v-else class="icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <path d="M16.8 12.8c0-2.1 1.7-3.1 1.8-3.2-1-1.4-2.6-1.6-3.2-1.6-1.3-.1-2.6.8-3.3.8-.7 0-1.8-.8-2.9-.8-1.5 0-2.9.9-3.6 2.3-1.6 2.8-.4 7 1.1 9.1.7 1 1.5 2.1 2.6 2.1 1 0 1.4-.6 2.6-.6s1.6.6 2.7.6c1.1 0 1.8-1 2.5-2 .8-1.1 1.1-2.2 1.1-2.3 0 0-2.1-.8-2.1-4.4ZM14.6 6.4c.6-.7 1-1.7.8-2.7-.9 0-1.9.6-2.5 1.3-.6.7-1.1 1.7-.9 2.7 1 .1 2-.5 2.6-1.3Z"/>
            </svg>
          </span>
          <span>{{ socialLoading === 'apple' ? 'Đang chuyển hướng...' : 'Apple' }}</span>
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
        <div class="password-wrap">
          <input
            v-model="signInForm.password"
            required
            :type="showSignInPassword ? 'text' : 'password'"
            placeholder="••••••••"
          />
          <button type="button" class="password-toggle" :aria-label="showSignInPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showSignInPassword = !showSignInPassword">
            <svg v-if="showSignInPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
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
          <div class="password-wrap">
            <input
              v-model="signUpForm.password"
              required
              :type="showSignUpPassword ? 'text' : 'password'"
              placeholder="Tối thiểu 8 ký tự, có chữ hoa, chữ thường và số"
            />
            <button type="button" class="password-toggle" :aria-label="showSignUpPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showSignUpPassword = !showSignUpPassword">
              <svg v-if="showSignUpPassword" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </label>
        <label>
          Xác nhận mật khẩu
          <div class="password-wrap">
            <input
              v-model="signUpForm.confirmPassword"
              required
              :type="showSignUpConfirm ? 'text' : 'password'"
              placeholder="Nhập lại mật khẩu"
            />
            <button type="button" class="password-toggle" :aria-label="showSignUpConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showSignUpConfirm = !showSignUpConfirm">
              <svg v-if="showSignUpConfirm" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
              <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </button>
          </div>
        </label>
      </div>

      <button class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Đang tạo tài khoản...' : 'Đăng ký tài khoản' }}
      </button>
    </form>

    <form v-else-if="tab === 'forgot' && forgotStep === 1" class="form-grid" @submit.prevent="handleForgot">
      <label>
        Email đăng ký
        <input v-model.trim="forgotForm.email" required type="email" placeholder="mail@example.com" />
      </label>
      <button class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Đang gửi...' : 'Gửi yêu cầu quên mật khẩu' }}
      </button>
    </form>

    <form v-else-if="tab === 'forgot' && forgotStep === 2" class="form-grid" @submit.prevent="handleVerifyCode">
      <p class="forgot-step-hint">Nếu email tồn tại trong hệ thống, bạn sẽ nhận mã 6 số qua email. Vui lòng kiểm tra hộp thư.</p>
      <label>
        Mã 6 số
        <input
          v-model="forgotCodeForm.code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          placeholder="Nhập mã từ email"
          @input="forgotCodeForm.code = forgotCodeForm.code.replace(/\D/g, '')"
        />
      </label>
      <button class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Đang xác thực...' : 'Tiếp tục' }}
      </button>
    </form>

    <form v-else-if="tab === 'forgot' && forgotStep === 3" class="form-grid" @submit.prevent="handleResetPasswordSubmit">
      <label>
        Mật khẩu mới
        <div class="password-wrap">
          <input
            v-model="resetPasswordForm.newPassword"
            required
            :type="showResetNew ? 'text' : 'password'"
            placeholder="Tối thiểu 6 ký tự"
          />
          <button type="button" class="password-toggle" :aria-label="showResetNew ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showResetNew = !showResetNew">
            <svg v-if="showResetNew" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </label>
      <label>
        Xác nhận mật khẩu
        <div class="password-wrap">
          <input
            v-model="resetPasswordForm.confirmPassword"
            required
            :type="showResetConfirm ? 'text' : 'password'"
            placeholder="Nhập lại mật khẩu"
          />
          <button type="button" class="password-toggle" :aria-label="showResetConfirm ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'" @click="showResetConfirm = !showResetConfirm">
            <svg v-if="showResetConfirm" class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
              <line x1="1" y1="1" x2="23" y2="23"/>
            </svg>
            <svg v-else class="eye-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </button>
        </div>
      </label>
      <button class="btn btn-primary" :disabled="submitting">
        {{ submitting ? 'Đang xử lý...' : 'Đặt lại mật khẩu' }}
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

.social-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(15, 23, 42, 0.12);
}

.social-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid currentColor;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.6s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
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

.password-wrap {
  position: relative;
  display: grid;
}

.password-wrap input {
  padding-right: 44px;
}

.password-toggle {
  position: absolute;
  top: 50%;
  right: 10px;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.password-toggle:hover {
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
}

.eye-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
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

.feedback-hint {
  margin-top: 8px;
  margin-bottom: 0;
}

.forgot-step-hint {
  margin: 0 0 4px;
  padding: 10px 14px;
  border-radius: 10px;
  background: #d1fae5;
  color: #065f46;
  font-size: 0.92rem;
}

.feedback-hint a {
  color: #6366f1;
  font-weight: 600;
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
