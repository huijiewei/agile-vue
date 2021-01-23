import { reactive, ref, nextTick } from 'vue'

export function useForm(data = {}) {
  const form = reactive(data)
  const errors = reactive({})
  const loading = ref(false)

  const clearErrors = () => {
    Object.keys(errors).forEach((key) => {
      errors[key] = ''
    })
  }

  const setErrors = async (error) => {
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

    await nextTick()

    violations.forEach((violation) => {
      errors[violation.field.split('.').pop()] = violation.message
    })
  }

  const handleSubmit = async (onSubmit) => {
    loading.value = true

    await onSubmit()

    loading.value = false
  }

  return {
    form,
    errors,
    loading,
    setErrors,
    handleSubmit,
  }
}
