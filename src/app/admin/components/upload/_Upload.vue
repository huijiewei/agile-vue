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
              @click="onPreview(file.url)"
            >
              <i class="el-icon-zoom-in" />
            </span>
            <span
              class="el-upload-list__item-delete"
              @click="onRemove(file.url)"
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
              @click="onPreview(files.url)"
            >
              <i class="el-icon-zoom-in" />
            </span>
            <span
              class="el-upload-list__item-delete"
              @click="onRemove(files.url)"
            >
              <i class="el-icon-delete" />
            </span>
          </span>
        </li>
      </template>
    </ul>
    <el-upload
      :disabled="loading"
      :action="option.url"
      :accept="option.typesLimit.map((type) => '.' + type).join(', ')"
      :multiple="false"
      :show-file-list="false"
      :http-request="httpRequest"
      :before-upload="onBeforeUpload"
      :on-success="onSuccess"
      :on-error="onError"
    >
      <el-button
        native-type="button"
        :disabled="loading"
        size="mini"
        plain
        icon="el-icon-upload"
        >点击上传</el-button
      >
    </el-upload>
    <el-dialog
      append-to-body
      class="image-view-dialog"
      :visible="dialogVisible"
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
      @on-cancel="onImageCropperCancel"
      @on-success="onImageCropperSuccess"
    />
  </div>
</template>

<script>
import Upload from '../../../../shared/utils/upload'
import ImageCropper from '@admin/components/ImageCropper'
import { ref, onBeforeUnmount, onBeforeMount, computed } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { ElMessage } from 'element-plus'

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
  setup(props) {
    const httpClient = useHttpClient()

    const box = props.preview
      ? {
          width: props.preview[0] - 2 + 'px',
          height: props.preview[0] - 2 + 'px',
        }
      : { width: 'auto', height: '32px' }

    const loading = ref(true)

    let timer = null
    let option = ref(Upload.defaultOption())
    let cropperImage = ref(null)
    let uploadFiles = ref(props.multiple ? [] : null)

    const getFileName = (url) => {
      if (!url || url.length === 0) {
        return ''
      }

      return url.split('/').pop().split('#').shift().split('?').shift()
    }

    const humanFileSize = (size) => {
      const i = Math.floor(Math.log(size) / Math.log(1024))
      return (
        (size / Math.pow(1024, i)).toFixed(2) * 1 +
        ' ' +
        ['B', 'kB', 'MB', 'GB', 'TB'][i]
      )
    }

    const getThumbFile = (upload, thumb) => {
      if (thumb !== '' && Array.isArray(upload.thumbs)) {
        const file = upload.thumbs.find((uploadThumb) => {
          return uploadThumb.thumb === thumb
        })

        if (file) {
          return file.url
        }
      }

      return upload.original
    }

    const destroyTimer = () => {
      if (timer) {
        window.clearTimeout(timer)
        timer = null
      }
    }

    const updateOption = async () => {
      destroyTimer()

      loading.value = true

      const { data } = await httpClient.get(
        props.action,
        { thumbs: props.thumbs, cropper: props.cropper.enable },
        false
      )

      if (data) {
        option.value = data
        loading.value = false

        if (data.timeout && data.timeout > 0) {
          timer = window.setTimeout(updateOption, data.timeout * 1000)
        }
      }
    }

    const httpRequest = (opt) => {
      loading.value = true

      Upload.upload(
        opt.action,
        option.value,
        opt.file,
        opt.onSuccess,
        opt.onError
      )
    }

    onBeforeMount(async () => {
      await updateOption()
    })

    onBeforeUnmount(() => {
      destroyTimer()
    })

    const onSuccess = (upload) => {
      loading.value = false

      if (upload.original) {
        if (
          props.cropper.enable &&
          option.value.cropUrl &&
          option.value.cropUrl.length > 0
        ) {
          console.log(1)
          cropperImage.value = upload.original
        } else {
          updateFiles(upload)
        }
      }
    }

    const onError = (error) => {
      loading.value = false

      ElMessage({
        type: 'error',
        message: error,
        duration: 1500,
      })
    }

    const onPreview = (url) => {
      dialogImageUrl.value = url
      dialogVisible.value = true
    }

    const onImageCropperSuccess = (data) => {
      cropperImage.value = null
      this.updateFiles(data)
    }

    const onImageCropperCancel = () => {
      cropperImage.value = null
    }

    const onRemove = (file) => {
      if (Array.isArray(uploadFiles.value)) {
        uploadFiles.value = uploadFiles.value.filter((uploadFile) => {
          return uploadFile !== file
        })
      } else {
        uploadFiles.value = null
      }

      updateValue()
    }

    const files = computed(() => {
      if (props.multiple) {
        return props.value.map((url) => {
          return {
            name: getFileName(url),
            url: url,
          }
        })
      } else {
        return {
          name: getFileName(props.value),
          url: props.value || '',
        }
      }
    })

    const updateValue = () => {
      emit('change', uploadFiles.value)
    }

    const updateFiles = (upload) => {
      const file = getThumbFile(upload, props.defaultThumb)

      if (props.multiple) {
        uploadFiles.value.push(file)
      } else {
        uploadFiles.value = file
      }

      emit('on-upload-success', upload)

      updateValue()
    }

    const onBeforeUpload = (file) => {
      const sizeLimit = option.value.sizeLimit
      if (file.size > sizeLimit) {
        ElMessage({
          type: 'error',
          message: '你选择的文件大小超出上传限制:' + humanFileSize(sizeLimit),
          duration: 1500,
        })

        return false
      }

      return true
    }

    const dialogVisible = ref(false)
    const dialogImageUrl = ref('')

    return {
      box,
      option,
      loading,
      httpRequest,
      onSuccess,
      onError,
      onRemove,
      onPreview,
      onBeforeUpload,
      onImageCropperSuccess,
      onImageCropperCancel,
      files,
      updateFiles,
      dialogVisible,
      dialogImageUrl,
      cropperImage,
    }
  },
  model: {
    prop: 'value',
    event: 'change',
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
