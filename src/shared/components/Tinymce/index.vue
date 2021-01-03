<template>
  <editor
    :tinymce-script-src="'https://cdn.jsdelivr.net/npm/tinymce@5.6.2/tinymce.min.js'"
    :init="{
      height: 500,
      menubar: false,
      plugins: [
        'preview',
        'code',
        'emoticons',
        'charmap',
        'wordcount',
        'image',
        'imagetools',
        'media',
        'link',
        'codesample',
        'table',
        'lists',
        'searchreplace',
        'autosave',
      ],
      toolbar:
        'undo redo | ' +
        'bold italic forecolor backcolor | alignleft aligncenter ' +
        'alignright alignjustify | bullist numlist outdent indent | ' +
        'table codesample | link image media | ' +
        'charmap emoticons | restoredraft searchreplace code preview',
      language: 'zh_CN',
      language_url:
        'https://cdn.jsdelivr.net/npm/tinymce-i18n@20.4.4/langs5/zh_CN.js',
      images_upload_url: imageUploadOption.url,
      images_upload_handler: imagesUploadHandler,
    }"
    v-bind="$attrs"
  ></editor>
</template>

<script>
import Editor from '@tinymce/tinymce-vue'
import Upload from '../../utils/upload'

export default {
  name: 'Tinymce',
  components: { Editor },
  inheritAttrs: false,
  data() {
    return {
      timer: null,
      imageUploadOption: Upload.defaultOption(),
    }
  },
  async mounted() {
    await this.updateImageUploadOption()
  },
  beforeUnmount() {
    this.destroyTimer()
  },
  methods: {
    destroyTimer() {
      if (this.timer) {
        clearTimeout(this.timer)
        this.timer = null
      }
    },
    imagesUploadHandler(blobInfo, succFun, failFun) {
      Upload.upload(
        this.imageUploadOption.url,
        this.imageUploadOption,
        blobInfo.blob(),
        (upload) => {
          succFun(upload.original)
        },
        failFun
      )
    },
    async updateImageUploadOption() {
      this.destroyTimer()

      const { data } = await this.$http.get(
        'misc/image-upload-option',
        { thumbs: null, cropper: false },
        false
      )

      if (data) {
        this.imageUploadOption = data

        if (data.timeout && data.timeout > 0) {
          this.timer = setTimeout(
            this.updateImageUploadOption,
            data.timeout * 1000
          )
        }
      }
    },
  },
}
</script>
