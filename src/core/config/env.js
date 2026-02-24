export const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT || 10000),
  backendOrigin: import.meta.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080',
  oauthGoogleUrl: import.meta.env.VITE_OAUTH_GOOGLE_URL || 'http://localhost:8080/oauth2/authorization/google',
  oauthFacebookUrl: import.meta.env.VITE_OAUTH_FACEBOOK_URL || 'http://localhost:8080/oauth2/authorization/facebook',
  oauthAppleUrl: import.meta.env.VITE_OAUTH_APPLE_URL || 'http://localhost:8080/oauth2/authorization/apple',
}
