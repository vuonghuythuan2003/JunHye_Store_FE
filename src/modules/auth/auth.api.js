import { httpClient } from '../../core/http/httpClient'

export const authApi = {
  signIn(payload) {
    return httpClient('/v1/auth/sign-in', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  signUp(payload) {
    return httpClient('/v1/auth/sign-up', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  forgotPassword(payload) {
    return httpClient('/v1/account/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  resetPassword(payload) {
    return httpClient('/v1/account/reset-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  verifyResetCode(payload) {
    return httpClient('/v1/account/verify-reset-code', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },
  logout(token) {
    return httpClient('/v1/auth/logout', {
      method: 'POST',
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    })
  },

  /** Get current user with roles (requires auth) */
  getMe() {
    return httpClient('/v1/auth/me')
  },
}
