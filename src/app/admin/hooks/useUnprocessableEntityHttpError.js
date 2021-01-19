export function useUnprocessableEntityHttpError() {
  const clearViolation = (formRef) => {
    formRef.value.$children.forEach((child) => {
      child.$data.validateMessage = ''
      child.$data.validateState = 'success'
    })
  }

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
    console.log(formRef.value)
    formRef.value.$slots.default().forEach((child) => {
      console.log(child)
      if (child.props && child.props.prop) {
        const childProp = child.props.prop && child.props.prop.split('.')[0]

        const activeViolation = violations.find((violation) => {
          const violationFieldPath = violation.field.split('.')

          return childProp === violationFieldPath.pop()
        })

        console.log(activeViolation)

        if (activeViolation) {
          child.error = activeViolation.message
        } else {
          child.error = ''
        }
      }
    })
  }

  const handleViolationError = (error, formRef) => {
    let violations = getViolation(error)

    if (violations == null) {
      return
    }

    handleViolation(violations, formRef)
  }

  return {
    getViolation,
    clearViolation,
    handleViolation,
    handleViolationError,
  }
}
