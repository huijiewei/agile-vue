<template>
  <el-form
    :inline="true"
    :model="form"
    size="small"
    autocomplete="off"
    @submit="onSubmit"
    @reset="onReset"
  >
    <template v-for="item in getOtherFields" :key="item.field">
      <hr v-if="item.type === 'br'" class="br" />
      <el-form-item v-else>
        <el-select
          v-if="item.type === 'select'"
          v-model="form[item.field]"
          :multiple="item.multiple"
          :clearable="true"
          :placeholder="item.label"
        >
          <el-option
            v-for="option in item.options"
            :key="item.field + '-' + option.value"
            :label="option.description"
            :value="option.value.toString()"
          />
        </el-select>
        <el-date-picker
          v-if="item.type === 'date'"
          v-model="form[item.field]"
          type="date"
          :style="{ width: '139px' }"
          :editable="false"
          :format="'YYYY-MM-DD'"
          :placeholder="item.label"
        />
        <el-date-picker
          v-if="item.type === 'dateTimeRange'"
          v-model="form[item.field]"
          :type="item.rangeType"
          :style="{ width: '260px' }"
          :start-placeholder="item.labelStart"
          :end-placeholder="item.labelEnd"
          :editable="false"
          unlink-panels
          :format="'YYYY-MM-DD'"
          :shortcuts="shortcuts[item.field]"
        />
      </el-form-item>
    </template>
    <el-form-item v-if="getKeywordFields.length > 0">
      <el-input v-model="keywordValue" placeholder="请输入内容" clearable>
        <template #prepend>
          <el-select v-model="keywordField" :style="{ width: '100px' }">
            <el-option
              v-for="item in getKeywordFields"
              :key="'kof-' + item.field"
              :label="item.label"
              :value="item.field"
            />
          </el-select>
        </template>
      </el-input>
    </el-form-item>
    <el-form-item>
      <el-button :plain="true" type="default" native-type="submit">
        搜索
      </el-button>
      <el-button :plain="true" type="info" native-type="reset">
        重置
      </el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { computed, ref, watch, inject, reactive, onBeforeMount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export default {
  name: 'SearchForm',
  props: {
    searchFields: {
      type: Array,
      default: () => {
        return []
      },
    },
  },
  setup(props) {
    const form = reactive({})
    const formInit = ref(false)

    const keywordField = ref('')
    const keywordValue = ref('')

    const shortcuts = ref({})
    const shortcutsInit = ref(false)

    const route = useRoute()
    const router = useRouter()

    const getKeywordFields = computed(() => {
      if (props.searchFields === null) {
        return []
      }

      return props.searchFields.filter((item) => item.type === 'keyword')
    })

    const getOtherFields = computed(() => {
      if (props.searchFields === null) {
        return []
      }

      return props.searchFields.filter((item) => item.type !== 'keyword')
    })

    onBeforeMount(() => {
      if (!formInit.value) {
        updateForm()
      }

      if (!shortcutsInit.value) {
        updateShortcuts()
      }
    })

    watch(
      () => props.searchFields,
      async () => {
        updateForm()
        updateShortcuts()
      }
    )

    watch(
      () => route.query,
      async () => {
        updateForm()
      }
    )

    const updateForm = () => {
      keywordField.value = ''
      keywordValue.value = ''

      const routeQuery = route.query

      const keywordFields = getKeywordFields.value

      for (const field of keywordFields) {
        if (routeQuery.hasOwnProperty(field.field)) {
          keywordField.value = field.field
          keywordValue.value = routeQuery[field.field]
          form[field.field] = routeQuery[field.field]
        } else {
          form[field.field] = ''
        }
      }

      if (keywordField.value === '' && keywordFields.length > 0) {
        keywordField.value = keywordFields[0].field
      }

      for (const field of getOtherFields.value) {
        if (field.type === 'br') {
          continue
        }

        if (field.type === 'select' && field.multiple) {
          if (routeQuery.hasOwnProperty(field.field)) {
            const routeQueryValue = routeQuery[field.field]

            form[field.field] = Array.isArray(routeQueryValue)
              ? routeQueryValue
              : [routeQueryValue.toString()]
          } else {
            form[field.field] = []
          }
        } else {
          if (routeQuery.hasOwnProperty(field.field)) {
            form[field.field] = routeQuery[field.field]
          } else {
            form[field.field] = ''
          }
        }
      }

      formInit.value = true
    }

    const updateShortcuts = () => {
      const shortcutsData = {}

      for (const otherField of getOtherFields.value) {
        if (otherField.type !== 'dateTimeRange') {
          continue
        }

        if (!otherField.shortcuts || otherField.shortcuts.length === 0) {
          continue
        }

        shortcutsData[otherField.field] = []

        otherField.shortcuts.forEach((shortcut) => {
          shortcutsData[otherField.field].push({
            text: shortcut.text,
            value: [shortcut.start, shortcut.end],
          })
        })
      }

      shortcuts.value = shortcutsData
      shortcutsInit.value = true
    }

    const isPageQuery = (query) => {
      return query === 'page' || query === 'size'
    }

    const isKeywordField = (field) => {
      return (
        getKeywordFields.value.find((keywordField) => {
          return keywordField.field === field
        }) !== undefined
      )
    }

    const handleRefresh = inject('reload')

    const getQueryFields = () => {
      const queryFields = {}

      Object.keys(form).forEach((key) => {
        if (!isKeywordField(key)) {
          const value = form[key]

          if (value && value.length > 0) {
            queryFields[key] = value
          }
        }
      })

      Object.keys(route.query).forEach((key) => {
        if (!form.hasOwnProperty(key) && !isPageQuery(key)) {
          queryFields[key] = route.query[key]
        }
      })

      if (keywordField.value !== '' && keywordValue.value !== '') {
        queryFields[keywordField.value] = keywordValue.value
      }

      return queryFields
    }

    const getDefaultQuery = () => {
      const defaultQuery = {}

      Object.keys(route.query).forEach((key) => {
        if (!form.hasOwnProperty(key) && !isPageQuery(key)) {
          defaultQuery[key] = route.query[key]
        }
      })

      return defaultQuery
    }

    const formSubmit = async (query) => {
      if (JSON.stringify(route.query) === JSON.stringify(query)) {
        handleRefresh()
      } else {
        await router.push({
          path: route.path,
          query: query,
        })
      }
    }

    const onSubmit = async () => {
      await formSubmit(getQueryFields())
    }

    const onReset = async () => {
      await formSubmit(getDefaultQuery())
    }

    return {
      form,
      formInit,
      keywordField,
      keywordValue,
      shortcuts,
      shortcutsInit,
      getKeywordFields,
      getOtherFields,
      onSubmit,
      onReset,
    }
  },
}
</script>
