<template>
  <upload
    :action="'misc/file-upload-option'"
    :multiple="multiple"
    v-model="value"
    @on-upload-success="onSuccess"
  />
</template>

<script>
import Upload from '@admin/components/upload/_Upload'
import { computed } from 'vue'

export default {
  name: 'FileUpload',
  components: { Upload },
  props: {
    modelValue: {
      type: [Array, String],
      default: null,
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  emits: ['change', 'on-upload-success'],
  setup(props, { emit }) {
    const value = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const onSuccess = (upload) => {
      emit('on-upload-success', upload)
    }

    return {
      value,
      onSuccess,
    }
  },
}
</script>
