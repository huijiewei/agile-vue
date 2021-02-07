<template>
  <el-button
    v-loading.fullscreen.lock="exportLoading"
    :type="type"
    :size="size"
    :disabled="disabled"
    element-loading-text="正在导出 Excel"
    element-loading-spinner="el-icon-loading"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<script>
import { reactive, ref } from 'vue'
import { useHttpClient } from '@shared/plugins/HttpClient'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

export default {
  name: 'ExportButton',
  props: {
    api: {
      type: String,
      default: '',
    },
    type: {
      type: String,
      default: 'default',
    },
    size: {
      type: String,
      default: 'small',
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    confirm: {
      type: String,
      default: '你确定导出吗',
    },
  },
  setup(props) {
    const route = useRoute()
    const httpClient = useHttpClient()

    const exportLoading = ref(false)

    const exportExcel = async () => {
      exportLoading.value = true

      const { data } = await httpClient.download(
        'GET',
        props.api,
        Object.assign({}, route.query, {
          page: null,
          size: null,
        })
      )

      if (data === false) {
        ElMessage.warning({
          message: '下载文件失败',
          duration: 1500,
        })
      }

      exportLoading.value = false
    }

    const handleClick = async () => {
      if (props.confirm) {
        ElMessageBox.confirm(props.confirm, '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        })
          .then(async () => {
            await exportExcel()
          })
          .catch(() => {})
      } else {
        await exportExcel()
      }
    }

    return {
      exportLoading,
      handleClick,
    }
  },
}
</script>
