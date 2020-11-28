const PermissionCheck = {
  install(app, { store }) {
    app.config.globalProperties.$can = (actionId) => {
      return store.getters['auth/isRouteInAcl'](actionId)
    }
  },
}

module.exports = PermissionCheck
