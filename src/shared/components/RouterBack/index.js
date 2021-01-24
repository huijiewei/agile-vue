import routerHistory from './history'
import writeHistory from './writeHistory'

export { routerHistory, writeHistory }

export default {
  install(app, { router, ignoreRoutesWithSameName } = {}) {
    if (!router) {
      console.error('RouterBack: router is required on install')
      return
    }

    app.use(routerHistory, { ignoreRoutesWithSameName })
    router.afterEach(writeHistory)
  },
}
