import { reactive, ref, toRaw } from 'vue'

export function useForm(
  options = {
    data: {},
    validator: null,
    onSubmit: null,
    onSuccess: null,
    onError: null,
    beforeSubmit: null,
  }
) {
  const defaults = JSON.parse(JSON.stringify(options.data))

  const errors = reactive({})
  const form = reactive(options.data)
  const loading = ref(false)

  const reset = (...fields) => {
    if (fields.length === 0) {
      Object.assign(form, defaults)
    } else {
      Object.assign(
        form,
        Object.keys(defaults)
          .filter((key) => fields.includes(key))
          .reduce((carry, key) => {
            carry[key] = defaults[key]
            return carry
          }, {})
      )
    }
  }

  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      delete errors[key]
    })
  }

  const setErrors = (error) => {
    clearErrors()

    if (
      !error ||
      !error.response ||
      !error.response.status ||
      error.response.status !== 422
    ) {
      return
    }

    let violations = []

    if (Array.isArray(error.response.data.violations)) {
      violations = error.response.data.violations
    }

    if (Array.isArray(error.response.data)) {
      violations = error.response.data
    }

    if (violations.length === 0) {
      return
    }

    violations.forEach((violation) => {
      errors[violation.field.split('.').pop()] = violation.message
    })
  }

  const submit = async () => {
    if (options.validator) {
      const valid = await options.validator()

      if (!valid) {
        return
      }
    }

    loading.value = true

    let rawData = toRaw(form)

    if (options.beforeSubmit) {
      rawData = options.beforeSubmit(rawData)
    }

    const { data, error } = await options.onSubmit(rawData)

    if (data && options.onSuccess) {
      options.onSuccess(data)
    }

    if (error) {
      setErrors(error)

      if (options.onError) {
        options.onError(errors)
      }
    }

    loading.value = false
  }

  return {
    form,
    errors,
    loading,
    reset,
    submit,
  }
}
