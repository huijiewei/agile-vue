import { useHttpClient } from '@shared/plugins/HttpClient'

const AuthService = {
  login(credentials) {
    return useHttpClient().post('auth/login', credentials)
  },
  logout() {
    return useHttpClient().post('auth/logout', null, null, false)
  },
  account() {
    return useHttpClient().get('auth/account', null, false)
  },
  profile(profile = null) {
    const endpoint = 'auth/profile'

    if (profile === null) {
      return useHttpClient().get(endpoint)
    }

    return useHttpClient().put(endpoint, profile)
  },
}

export default AuthService
