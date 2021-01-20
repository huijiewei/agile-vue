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

  const handleViolation = (violations, formRef) => {
    if (violations == null) {
      return
    }

    console.log(formRef.value.$slots.default())

    violations.forEach((violation) => {
      const violationField = violation.field.split('.').pop()
    })
  }

  const handleViolationError = (error, formRef) => {
    let violations = getViolation(error)

    handleViolation(violations, formRef)
  }

  const clearViolation = (formRef) => {}

  return {
    getViolation,
    clearViolation,
    handleViolation,
    handleViolationError,
  }
}
