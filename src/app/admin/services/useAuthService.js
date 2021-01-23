import { useHttpClient } from '@shared/plugins/HttpClient'

export function useAuthService() {
  const httpClient = useHttpClient()

  const login = (credentials) => {
    return httpClient.post('auth/login', credentials, null, false)
  }

  const logout = () => {
    return httpClient.post('auth/logout', null, null, false)
  }

  const account = () => {
    return httpClient.get('auth/account', null, false)
  }
  const profile = (profile = null) => {
    const endpoint = 'auth/profile'

    if (profile === null) {
      return httpClient.get(endpoint)
    }

    return httpClient.put(endpoint, profile)
  }

  return {
    login,
    logout,
    account,
    profile,
  }
}
