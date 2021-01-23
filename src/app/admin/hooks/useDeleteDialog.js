import { ElMessageBox } from 'element-plus'

export function useDeleteDialog() {
  const deleteDialog = (options) => {
    const dialogOptions = Object.assign(
      {
        title: '你确定吗？',
        message: '记录将被删除',
        callback: null,
        promptLabel: '',
        promptValue: '',
      },
      options
    )

    if (dialogOptions.promptValue.length > 0) {
      ElMessageBox.prompt(
        '<h3>' +
          dialogOptions.title +
          '</h3><div class="message">' +
          dialogOptions.message +
          '</div>',
        {
          showClose: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          iconClass: 'el-icon-warning-outline',
          customClass: 'delete-dialog',
          dangerouslyUseHTMLString: true,
          center: false,
          inputPlaceholder: '' + dialogOptions.promptLabel,
          inputValidator: (value) => {
            return dialogOptions.promptValue === value
          },
          inputErrorMessage: dialogOptions.promptLabel + '不匹配',
        }
      ).then((action) => {
        if (action === 'confirm') {
          dialogOptions.callback()
        }
      })
    } else {
      ElMessageBox.confirm(
        '<h3>' +
          dialogOptions.title +
          '</h3><div class="message">' +
          dialogOptions.message +
          '</div>',
        {
          showClose: false,
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          iconClass: 'el-icon-warning-outline',
          customClass: 'delete-dialog',
          dangerouslyUseHTMLString: true,
          center: false,
        }
      ).then((action) => {
        if (action === 'confirm') {
          dialogOptions.callback()
        }
      })
    }
  }

  return {
    deleteDialog,
  }
}
