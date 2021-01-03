import { useHttpClient } from '../../../shared/plugins/HttpClient'

const OpenService = {
  captcha() {
    return useHttpClient().get('open/captcha', null, false, true)
  },
}

export default OpenService
