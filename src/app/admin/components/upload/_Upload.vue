<template>
  <div
    class="upload-widget"
    :class="preview ? 'upload-widget-preview' : 'upload-widget-general'"
  >
    <ul class="el-upload-list el-upload-list--picture-card">
      <template v-if="multiple">
        <li
          class="el-upload-list__item is-ready"
          v-if="files.length === 0"
          :style="{
            width: box.width,
            minWidth: box.height,
            height: box.height,
          }"
        >
          <div class="blank">
            <i
              :class="preview ? 'el-icon-picture-outline' : 'el-icon-document'"
            />
          </div>
        </li>
        <li
          class="el-upload-list__item is-ready"
          v-else
          :style="{ width: box.width, height: box.height }"
          v-for="file of files"
          v-bind:key="file.name"
        >
          <img
            class="preview"
            v-if="preview"
            :alt="file.name"
            :src="file.url"
          />
          <span class="generate" v-else>{{ file.name }}</span>
          <span class="el-upload-list__item-actions">
            <span
              v-if="preview"
              class="el-upload-list__item-preview"
              @click="handlePreview(file.url)"
            >
              <i class="el-icon-zoom-in" />
            </span>
            <span
              class="el-upload-list__item-delete"
              @click="handleRemove(file.url)"
            >
              <i class="el-icon-delete" />
            </span>
          </span>
        </li>
      </template>
      <template v-else>
        <li
          class="el-upload-list__item is-ready"
          v-if="files.url.length === 0"
          :style="{
            width: box.width,
            minWidth: box.height,
            height: box.height,
          }"
        >
          <div class="blank">
            <i
              :class="preview ? 'el-icon-picture-outline' : 'el-icon-document'"
            />
          </div>
        </li>
        <li
          class="el-upload-list__item is-ready"
          v-else
          :style="{ width: box.width, height: box.height }"
        >
          <img
            class="preview"
            v-if="preview"
            :alt="files.name"
            :src="files.url"
          />
          <span class="generate" v-else>{{ files.name }}</span>
          <span class="el-upload-list__item-actions">
            <span
              v-if="preview"
              class="el-upload-list__item-preview"
              @click="handlePreview(files.url)"
            >
              <i class="el-icon-zoom-in" />
            </span>
            <span
              class="el-upload-list__item-delete"
              @click="handleRemove(files.url)"
            >
              <i class="el-icon-delete" />
            </span>
          </span>
        </li>
      </template>
    </ul>
    <el-upload
      :disabled="buttonDisabled"
      :action="option.url"
      :accept="option.typesLimit.map((type) => '.' + type).join(', ')"
      :multiple="false"
      :show-file-list="false"
      :http-request="httpRequest"
      :before-upload="handleBeforeUpload"
      :on-success="handleSuccess"
      :on-error="handleError"
    >
      <el-button
        :disabled="buttonDisabled"
        size="mini"
        plain
        icon="el-icon-upload"
        >点击上传</el-button
      >
    </el-upload>
    <el-dialog
      append-to-body
      class="image-view-dialog"
      v-model:visible="dialogVisible"
      center
    >
      <img class="image-view" :src="dialogImageUrl" alt="" />
      <div>
        图片链接：<span>{{ dialogImageUrl }}</span>
      </div>
    </el-dialog>
    <image-cropper
      v-if="cropperImage"
      :image="cropperImage"
      :crop-url="option.cropUrl"
      :aspect-ratio="cropper.aspectRatio"
      :cropper-size="cropper.size"
      @on-cancel="handleImageCropperCancel"
      @on-success="handleImageCropperSuccess"
    />
  </div>
</template>

<script>
import Upload from '../../../../shared/utils/upload'
import ImageCropper from '@admin/components/ImageCropper'

export default {
  name: 'Upload',
  components: { ImageCropper },
  props: {
    value: {
      type: [Array, String],
      default: null,
    },
    action: {
      type: String,
      default: '',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
    preview: {
      type: Array,
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
    thumbs: {
      type: Array,
      default: null,
    },
    defaultThumb: {
      type: String,
      default: '',
    },
  },
  model: {
    prop: 'value',
    event: 'change',
  },
  data() {
    return {
      box: { width: 'auto', height: '32px' },
      timer: null,
      option: Upload.defaultOption(),
      buttonDisabled: true,
      uploadFiles: this.multiple ? [] : null,
      cropperImage: null,
      dialogVisible: false,
      dialogImageUrl: '',
    }
  },
  computed: {
    files: function () {
      if (this.multiple) {
        return this.value.map((url) => {
          return {
            name: this.getFilename(url),
            url: url,
          }
        })
      } else {
        return {
          name: this.getFilename(this.value),
          url: this.value,
        }
      }
    },
  },
  async mounted() {
    if (this.preview) {
      this.box = {
        width: this.preview[0] - 2 + 'px',
        height: this.preview[1] - 2 + 'px',
      }
    }

    await this.updateOption()
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

    getFilename(url) {
      if (!url || url.length === 0) {
        return ''
      }

      return url.split('/').pop().split('#').shift().split('?').shift()
    },

    async updateOption() {
      this.destroyTimer()

      this.buttonDisabled = true

      const { data } = await this.$http.get(
        this.action,
        { thumbs: this.thumbs, cropper: this.cropper.enable },
        false
      )

      if (data) {
        this.option = data
        this.buttonDisabled = false

        if (data.timeout && data.timeout > 0) {
          this.timer = setTimeout(this.updateOption, data.timeout * 1000)
        }
      }
    },

    updateFiles(upload) {
      const file = this.getThumbFile(upload, this.defaultThumb)

      if (this.multiple) {
        this.uploadFiles.push(file)
      } else {
        this.uploadFiles = file
      }

      this.$emit('on-upload-success', upload)

      this.updateValue()
    },

    updateValue() {
      this.$emit('change', this.uploadFiles)
    },

    httpRequest(option) {
      this.buttonDisabled = true

      Upload.upload(
        option.action,
        this.option,
        option.file,
        option.onSuccess,
        option.onError
      )
    },

    humanFileSize(size) {
      const i = Math.floor(Math.log(size) / Math.log(1024))
      return (
        (size / Math.pow(1024, i)).toFixed(2) * 1 +
        ' ' +
        ['B', 'kB', 'MB', 'GB', 'TB'][i]
      )
    },

    handleBeforeUpload(file) {
      const sizeLimit = this.option.sizeLimit
      if (file.size > sizeLimit) {
        this.$message({
          type: 'error',
          message:
            '你选择的文件大小超出上传限制:' + this.humanFileSize(sizeLimit),
          duration: 1500,
        })

        return false
      }

      return true
    },

    handleSuccess(upload) {
      this.buttonDisabled = false

      if (upload.original) {
        if (
          this.cropper.enable &&
          this.option.cropUrl &&
          this.option.cropUrl.length > 0
        ) {
          this.cropperImage = upload.original
        } else {
          this.updateFiles(upload)
        }
      }
    },

    getThumbFile(upload, thumb) {
      if (thumb !== '' && Array.isArray(upload.thumbs)) {
        const file = upload.thumbs.find((uploadThumb) => {
          return uploadThumb.thumb === thumb
        })

        if (file) {
          return file.url
        }
      }

      return upload.original
    },

    handleError(message) {
      this.buttonDisabled = false

      this.$message({
        type: 'error',
        message: message,
        duration: 1500,
      })
    },

    handleRemove(file) {
      if (Array.isArray(this.uploadFiles)) {
        this.uploadFiles = this.uploadFiles.filter((uploadFile) => {
          return uploadFile !== file
        })
      } else {
        this.uploadFiles = ''
      }

      this.updateValue()
    },

    handlePreview(file) {
      this.dialogImageUrl = file
      this.dialogVisible = true
    },

    handleImageCropperSuccess(data) {
      this.cropperImage = null
      this.updateFiles(data)
    },

    handleImageCropperCancel() {
      this.cropperImage = null
    },
  },
}
</script>
<style lang="less">
.image-view-dialog {
  .el-dialog {
    width: auto;
    max-width: 50%;
  }

  .el-dialog__body {
    text-align: center;
  }

  .image-view {
    width: auto;
    max-width: 100%;
    margin: 0 auto;
  }
}

.upload-widget {
  line-height: 1em;

  .el-upload-list--picture-card .el-upload-list__item-actions {
    font-size: 16px;
  }
  .el-upload-list--picture-card .el-upload-list__item {
    border-radius: 2px;
    margin: 0 6px 6px 0;
    border: none;
    background: #f5f7fa;

    .blank {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 100%;
      height: 100%;
      background: #f5f7fa;
      color: #909399;
    }

    .generate {
      line-height: 32px;
      padding: 0 6px;
    }

    .preview {
      width: 100%;
      height: 100%;
    }
  }
  &.upload-widget-preview {
    .blank {
      i {
        font-size: 39px;
      }
    }
  }
}
</style>
