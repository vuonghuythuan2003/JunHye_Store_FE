import { authApi } from './auth.api'
import { env } from '../../core/config/env'

const AUTH_TOKEN_KEY = 'junhye.auth.token'
const AUTH_USER_KEY = 'junhye.auth.user'

const SOCIAL_URL_BY_PROVIDER = {
  google: env.oauthGoogleUrl,
  facebook: env.oauthFacebookUrl,
  apple: env.oauthAppleUrl,
}

const unwrapApiData = (payload) => {
  if (!payload) return null
  if (typeof payload === 'object' && 'data' in payload) return payload.data
  return payload
}

const getMessage = (payload, fallback) => {
  if (!payload) return fallback
  if (typeof payload === 'object' && payload.message) return payload.message
  return fallback
}

const extractToken = (payload) => {
  const data = unwrapApiData(payload)
  if (!data || typeof data !== 'object') return ''

  return (
    data.accessToken ||
    data.token ||
    data.jwt ||
    data.jwtToken ||
    data.authenticationToken ||
    ''
  )
}

const extractUser = (payload, fallback = null) => {
  const data = unwrapApiData(payload)
  if (!data || typeof data !== 'object') return fallback

  if (data.user && typeof data.user === 'object') return data.user

  const hasIdentity = data.username || data.email || data.userId
  return hasIdentity ? data : fallback
}

export const authService = {
  getToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY) || ''
  },

  getUser() {
    const raw = localStorage.getItem(AUTH_USER_KEY)
    if (!raw) return null

    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },

  saveSession(token, user) {
    if (token) {
      localStorage.setItem(AUTH_TOKEN_KEY, token)
    }

    if (user) {
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user))
    }
  },

  clearSession() {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(AUTH_USER_KEY)
  },

  getSocialLoginUrl(provider) {
    const key = String(provider || '').toLowerCase()
    const oauthUrl = SOCIAL_URL_BY_PROVIDER[key]

    if (!oauthUrl) {
      throw new Error(`Provider ${provider} chưa được hỗ trợ`)
    }

    return oauthUrl
  },

  completeOAuthCallback(query) {
    const getQueryValue = (key) => {
      const value = query?.[key]
      if (Array.isArray(value)) return value[0]
      return value || ''
    }

    const token =
      getQueryValue('token') ||
      getQueryValue('accessToken') ||
      getQueryValue('jwt') ||
      getQueryValue('jwtToken')

    if (!token) {
      throw new Error('Callback không có token. Hãy kiểm tra backend redirect về /auth/callback?token=...')
    }

    const user = {
      username: getQueryValue('username') || 'social-user',
      email: getQueryValue('email') || '',
      fullName: getQueryValue('fullName') || getQueryValue('name') || '',
      provider: getQueryValue('provider') || 'social',
    }

    this.saveSession(token, user)

    return {
      token,
      user,
      message: 'Đăng nhập mạng xã hội thành công',
    }
  },

  async signIn(form) {
    const payload = {
      username: form.username,
      password: form.password,
    }

    const response = await authApi.signIn(payload)
    const token = extractToken(response)
    const user = extractUser(response, {
      username: form.username,
    })

    if (!token) {
      throw new Error('Đăng nhập thành công nhưng không nhận được token từ BE')
    }

    this.saveSession(token, user)

    return {
      token,
      user,
      message: getMessage(response, 'Đăng nhập thành công'),
    }
  },

  async signUp(form) {
    const payload = {
      username: form.username,
      fullName: form.fullName,
      phoneNumber: form.phoneNumber,
      address: form.address,
      email: form.email,
      password: form.password,
      roles: ['USER'],
      status: true,
    }

    const response = await authApi.signUp(payload)

    return {
      data: unwrapApiData(response),
      message: getMessage(response, 'Đăng ký thành công'),
    }
  },

  async forgotPassword(form) {
    const response = await authApi.forgotPassword({ email: form.email })

    return {
      data: unwrapApiData(response),
      message: getMessage(response, 'Yêu cầu quên mật khẩu đã được gửi'),
    }
  },

  async logout() {
    const token = this.getToken()

    try {
      if (token) {
        await authApi.logout(token)
      }
    } finally {
      this.clearSession()
    }

    return {
      message: 'Đã đăng xuất',
    }
  },
}
