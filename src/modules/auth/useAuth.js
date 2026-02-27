import { ref } from 'vue'
import { authService } from './auth.service'

const currentUser = ref(authService.getUser())
const accessToken = ref(authService.getToken())

export const useAuth = () => {
  const isAuthenticated = () => Boolean(accessToken.value)

  const isAdmin = () => {
    const user = currentUser.value || authService.getUser()
    if (!user || !user.roles) return false
    const roles = user.roles
    if (!Array.isArray(roles)) return false
    return roles.some((r) => r === 'ADMIN' || (typeof r === 'object' && r && (r.roleName === 'ADMIN' || r.name === 'ADMIN')))
  }

  const refreshUser = () => {
    currentUser.value = authService.getUser()
  }

  const signIn = async (form) => {
    const result = await authService.signIn(form)
    currentUser.value = result.user
    accessToken.value = result.token
    return result
  }

  const signUp = async (form) => {
    return authService.signUp(form)
  }

  const forgotPassword = async (form) => {
    return authService.forgotPassword(form)
  }

  const verifyResetCode = async (code) => {
    return authService.verifyResetCode(code)
  }

  const resetPassword = async (code, newPassword) => {
    return authService.resetPassword(code, newPassword)
  }

  const startSocialLogin = (provider) => {
    const oauthUrl = authService.getSocialLoginUrl(provider)
    window.location.assign(oauthUrl)
  }

  const completeOAuthCallback = (query) => {
    const result = authService.completeOAuthCallback(query)
    currentUser.value = result.user
    accessToken.value = result.token
    return result
  }

  const logout = async () => {
    // Update state immediately
    currentUser.value = null
    accessToken.value = ''
    
    // Then call logout service (which clears session)
    const result = await authService.logout()
    return result
  }

  return {
    currentUser,
    accessToken,
    isAuthenticated,
    isAdmin,
    refreshUser,
    signIn,
    signUp,
    forgotPassword,
    verifyResetCode,
    resetPassword,
    startSocialLogin,
    completeOAuthCallback,
    logout,
  }
}
