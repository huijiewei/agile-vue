<template>
  <image-upload
    :multiple="false"
    v-model="value"
    :thumbs="['200x200']"
    :default-thumb="'200x200'"
    :cropper="{ enable: true }"
  />
</template>

<script>
import ImageUpload from '@admin/components/upload/ImageUpload'
import { computed } from 'vue'

export default {
  name: 'AvatarUpload',
  components: { ImageUpload },
  props: {
    modelValue: {
      type: [Array, String],
      default: null,
    },
  },
  setup(props, { emit }) {
    const value = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    return {
      value,
    }
  },
}
</script>
