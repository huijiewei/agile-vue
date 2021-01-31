import { ref } from 'vue'

export function useSearchForm() {
  const searchFields = ref(null)

  const setSearchFields = (fields) => {
    if (fields) {
      searchFields.value = fields || []
    }
  }

  const buildRouteQuery = (query) => {
    return searchFields.value !== null
      ? query
      : Object.assign({}, query, { withSearchFields: true })
  }

  return {
    searchFields,
    setSearchFields,
    buildRouteQuery,
  }
}
