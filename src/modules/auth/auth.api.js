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
}
