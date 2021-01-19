export function useFormError() {
  const getViolation = (error) => {
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

  const handleViolation = (violations, formError) => {
    clearViolation(formError)

    if (violations == null) {
      return
    }

    violations.forEach((violation) => {
      const violationField = violation.field.split('.').pop()

      formError[violationField] = violation.message
    })
  }

  const handleViolationError = (error, formError) => {
    let violations = getViolation(error)

    handleViolation(violations, formError)
  }

  const clearViolation = (formError) => {
    Object.keys(formError).forEach((key) => {
      delete formError[key]
    })
  }

  return {
    getViolation,
    clearViolation,
    handleViolation,
    handleViolationError,
  }
}
