import { ElMessageBox } from 'element-plus'

const DeleteDialog = {
  install(app) {
    app.config.globalProperties.$deleteDialog = (option) => {
      const dialogOption = Object.assign(
        {
          title: '你确定吗？',
          message: '记录将被删除',
          callback: null,
          promptLabel: '',
          promptValue: '',
        },
        option
      )

      const message =
        '<h3>' +
        dialogOption.title +
        '</h3><div class="message">' +
        dialogOption.message +
        '</div>'

      const boxOptions = {
        showClose: false,
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        iconClass: 'el-icon-warning-outline',
        customClass: 'delete-dialog',
        dangerouslyUseHTMLString: true,
        center: false,
      }

      const messageBox =
        dialogOption.promptValue.length > 0
          ? ElMessageBox.prompt(message, '', {
              ...boxOptions,
              inputPlaceholder: '' + dialogOption.promptLabel,
              inputValidator: (value) => {
                return dialogOption.promptValue === value
              },
              inputErrorMessage: dialogOption.promptLabel + '不匹配',
            })
          : ElMessageBox.confirm(message, '', boxOptions)

      messageBox
        .then(() => {
          dialogOption.callback()
        })
        .catch(() => {})
    }
  },
}

export default DeleteDialog
