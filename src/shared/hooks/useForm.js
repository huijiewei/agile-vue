import { reactive } from 'vue'

export function useForm(data = {}) {
  const defaults = JSON.parse(JSON.stringify(data))

  const errors = reactive({})

  const clearViolations = () => {
    Object.keys(errors).forEach((key) => {
      delete errors[key]
    })
  }

  const getViolations = (error) => {
    if (
      !error ||
      !error.response ||
      !error.response.status ||
      error.response.status !== 422
    ) {
      return null
    }

    let violations = []

    if (Array.isArray(error.response.data.violations)) {
      violations = error.response.data.violations
    }

    if (Array.isArray(error.response.data)) {
      violations = error.response.data
    }

    if (violations.length === 0) {
      return null
    }

    return violations
  }

  const setViolations = (error) => {
    clearViolations()

    Object.keys(newErrors).forEach((key) => {
      errors[key] = newErrors[key]
    })
  }

  return {
    ...defaults,
    errors,
  }
}
