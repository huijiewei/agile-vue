import axios from 'axios'
import { loadProgressBar } from 'axios-progress-bar'
import 'axios-progress-bar/dist/nprogress.css'
import { throttleAdapterEnhancer } from 'axios-extensions'
import flatry from '@core/utils/flatry'

class Request {
  constructor(options) {
    const opt = {
      ...{
        baseUrl: '',
        timeout: 10 * 1000,
        withCredentials: false,
        paramsSerializer: null,
        beforeRequest: (config) => {
          return config
        },
        onSuccess: (response) => Promise.resolve(response),
        onError: (error) => Promise.reject(error),
      },
      ...options,
    }

    const axiosConfig = {
      baseURL: opt.baseUrl,
      timeout: opt.timeout,
      withCredentials: opt.withCredentials,
      paramsSerializer: opt.paramsSerializer,
      adapter: throttleAdapterEnhancer(axios.defaults.adapter),
    }

    const axiosInstance = axios.create(axiosConfig)

    loadProgressBar({ showSpinner: false }, axiosInstance)

    axiosInstance.interceptors.request.use(
      (config) => {
        return opt.beforeRequest(config)
      },
      (error) => {
        return opt.onError(error)
      }
    )

    axiosInstance.interceptors.response.use(
      (response) => {
        return opt.onSuccess(response)
      },
      (error) => {
        return opt.onError(error)
      }
    )

    this.axios = axiosInstance
  }

  request(
    method,
    url,
    params = null,
    data = null,
    historyBack = false,
    cancelIgnore = false
  ) {
    const config = {
      url: url,
      method: method,
      historyBack: historyBack,
      cancelIgnore: cancelIgnore,
    }

    if (params) {
      config.params = params
    }

    if (data) {
      config.data = data
    }

    return flatry(this.axios.request(config))
  }

  get(url, params = null, historyBack = true, cancelIgnore = false) {
    return this.request('GET', url, params, null, historyBack, cancelIgnore)
  }

  post(url, data = null, params = null, historyBack = false) {
    return this.request('POST', url, params, data, historyBack)
  }

  put(url, data = null, params = null, historyBack = false) {
    return this.request('PUT', url, params, data, historyBack)
  }

  path(url, data = null, params = null, historyBack = false) {
    return this.request('PATH', url, params, data, historyBack)
  }

  delete(url, params = null, historyBack = false) {
    return this.request('DELETE', url, params, null, historyBack)
  }

  download(method, url, params = null, data = null, historyBack = false) {
    const config = {
      url: url,
      method: method,
      timeout: 120 * 1000,
      responseType: 'blob',
      historyBack: historyBack,
    }

    if (params) {
      config.params = params
    }

    if (data) {
      config.data = data
    }

    return flatry(
      this.axios.request(config).then((response) => {
        let filename = response.headers['x-suggested-filename']

        if (!filename) {
          filename = response.headers['content-disposition'].match(
            /filename="(.+)"/
          )[1]
        }

        if (filename) {
          const url = window.URL.createObjectURL(
            new Blob([response.data], {
              type: response.headers['content-type'],
            })
          )
          const link = document.createElement('a')
          link.href = url
          link.setAttribute('download', decodeURIComponent(filename))
          link.click()
          window.URL.revokeObjectURL(url)

          return true
        } else {
          return false
        }
      })
    )
  }
}

export default Request
