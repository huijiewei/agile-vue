<template>
  <upload
    ref="upload"
    v-model="value"
    :action="'misc/image-upload-option'"
    :multiple="multiple"
    :preview="preview"
    :cropper="cropper"
    :thumbs="thumbs"
    :default-thumb="defaultThumb"
    @on-upload-success="onSuccess"
  />
</template>

<script>
import Upload from '@admin/components/upload/_Upload'
import { computed } from 'vue'

export default {
  name: 'ImageUpload',
  components: { Upload },
  props: {
    modelValue: {
      type: [Array, String],
      default: null,
    },
    cropper: {
      type: Object,
      default: function () {
        return {
          enable: false,
          aspectRatio: 1,
          size: [200, 200],
        }
      },
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    preview: {
      type: Array,
      default: function () {
        return [88, 88]
      },
    },
    thumbs: {
      type: Array,
      default: null,
    },
    defaultThumb: {
      type: String,
      default: '',
    },
  },
  setup(props, { emit }) {
    const value = computed({
      get: () => props.modelValue,
      set: (value) => emit('update:modelValue', value),
    })

    const onSuccess = (upload) => {
      emit('on-upload-success', upload)

      return true
    }

    return {
      value,
      onSuccess,
    }
  },
}
</script>
