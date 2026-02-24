import { ref } from 'vue'
import { authService } from './auth.service'

const currentUser = ref(authService.getUser())
const accessToken = ref(authService.getToken())

export const useAuth = () => {
  const isAuthenticated = () => Boolean(accessToken.value)

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
    const result = await authService.logout()
    currentUser.value = null
    accessToken.value = ''
    return result
  }

  return {
    currentUser,
    accessToken,
    isAuthenticated,
    signIn,
    signUp,
    forgotPassword,
    startSocialLogin,
    completeOAuthCallback,
    logout,
  }
}
