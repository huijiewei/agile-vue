import { useHttpClient } from '@shared/plugins/HttpClient'
import { useStore } from 'vuex'

export function useRefreshUser() {
  const store = useStore()
  const httpClient = useHttpClient()

  const refreshUser = async () => {
    const { data } = await httpClient.get('auth/account', null, false)

    if (data) {
      await store.dispatch('auth/account', data)
    }
  }

  return {
    refreshUser,
  }
}
