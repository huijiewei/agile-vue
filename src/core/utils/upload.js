import Request from '@core/utils/request'

const Upload = {
  defaultOption: () => {
    return {
      url: '',
      cropUrl: '',
      timeout: 0,
      params: [],
      headers: [],
      dataType: '',
      paramName: '',
      imageProcess: '',
      responseParse: '',
      sizeLimit: 0,
      typesLimit: [],
    }
  },
  upload: (url, option, file, onSuccess, onError) => {
    const request = new Request({
      onSuccess: (response) => {
        const result =
          option.dataType === 'xml'
            ? new DOMParser().parseFromString(response.data, 'application/xml')
            : response.data

        // eslint-disable-next-line no-new-func
        const responseParse = new Function('result', option.responseParse)

        const upload = responseParse(result)

        onSuccess(upload)
      },
      onError: (error) => {
        const message =
          error.response.data.detail ||
          error.response.data.title ||
          error.response.data.message ||
          error.response.statusText ||
          error.message

        onError(message)
      },
    })

    const headers = option.headers

    if (headers && Array.isArray(headers)) {
      request.httpClient.interceptors.request.use((config) => {
        for (const key in headers) {
          if (!headers.hasOwnProperty(key)) {
            continue
          }

          config.headers[key] = headers[key]
        }

        return config
      }, undefined)
    }

    const params = option.params

    const formData = new FormData()

    if (params) {
      for (const key in params) {
        if (!params.hasOwnProperty(key)) {
          continue
        }

        const value = params[key]

        if (value.toString().indexOf('${filename}') !== -1) {
          let randomFileName =
            Math.random().toString(36).substring(3, 15) +
            '.' +
            file.name.split('.').pop()

          formData.append(
            key,
            value.toString().replace('${filename}', randomFileName)
          )
        } else {
          formData.append(key, value)
        }
      }
    }

    formData.append(option.paramName, file, file.name)

    request.post(url, formData, null, false)
  },
}

export default Upload
