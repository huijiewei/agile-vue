<template>
  <div class="box">
  </div>
</template>

<script>
import FileUpload from '@admin/components/upload/FileUpload'
import ImageUpload from '@admin/components/upload/ImageUpload'
export default {
  name: 'Home',
  metaInfo: {
    title: '首页',
  },
  data() {
    return {
      file: '',
      files: [],
      message: '',
    }
  },
  methods: {
    handleChange(value) {
      console.log(value)
    },
  },
}
</script>
