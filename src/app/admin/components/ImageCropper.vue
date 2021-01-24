<template>
  <el-dialog
    width="70%"
    :custom-class="'image-cropper-dialog'"
    :model-value="true"
    :show-close="false"
    :center="true"
    :append-to-body="true"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <vue-cropper
      ref="cropperRef"
      :src="image"
      :view-mode="2"
      :initial-aspect-ratio="aspectRatio"
      :aspect-ratio="aspectRatio"
      :zoomable="false"
      :rotatable="false"
      :movable="false"
      :check-orientation="false"
      :auto-crop-area="0.6"
      :min-crop-box-width="cropperSize[0] * 2"
      :min-crop-box-height="cropperSize[1] * 2"
      :ready="onReady"
      :img-style="{ width: '100%' }"
      alt="Source Image"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="onCancel">取 消</el-button>
        <el-button :disabled="loading" type="primary" @click="onSubmit"
          >确 定</el-button
        >
      </div>
    </template>
  </el-dialog>
</template>

<script>
import VueCropper from '@shared/components/VueCropper'
import 'cropperjs/dist/cropper.css'
import Request from '../../../shared/utils/request'
import { ElMessage } from 'element-plus'
import { ref } from 'vue'

export default {
  name: 'ImageCropper',
  components: { VueCropper },
  props: {
    image: {
      type: String,
      default: '',
    },
    aspectRatio: {
      type: Number,
      default: 1,
    },
    cropperSize: {
      type: Array,
      default: function () {
        return [100, 100]
      },
    },
    cropUrl: {
      type: String,
      default: '',
    },
  },
  emits: ['on-cancel', 'on-success'],
  setup(props, { emit }) {
    const loading = ref(true)
    const cropperRef = ref()

    const onReady = () => {
      loading.value = false
    }

    const onSubmit = async () => {
      loading.value = true

      const request = new Request({
        withCredentials: true,
        onSuccess: (response) => {
          emit('on-success', response.data)
        },
        onError: (error) => {
          const message =
            error.response.data.detail ||
            error.response.data.title ||
            error.response.data.message ||
            error.response.statusText ||
            error.message

          ElMessage({
            type: 'error',
            message: message,
            duration: 1500,
          })

          loading.value = false
        },
      })

      const data = cropperRef.value.getData()

      await request.post(props.cropUrl, {
        file: props.image,
        x: data.x,
        y: data.y,
        w: data.width,
        h: data.height,
      })
    }

    const onCancel = () => {
      emit('on-cancel')
    }

    return {
      loading,
      cropperRef,
      onReady,
      onSubmit,
      onCancel,
    }
  },
}
</script>

<style lang="less">
.image-cropper-dialog {
  .el-dialog__header {
    display: none;
  }
  .el-dialog__body {
    padding: 15px;
  }
  .el-dialog__footer {
    border-top: 1px solid #e5e5e5;
  }
}
</style>
