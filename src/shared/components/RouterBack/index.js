import routerHistory from './history'
import writeHistory from './writeHistory'

export { routerHistory, writeHistory }

const RouteBack = {
  install(app, { router, ignoreRoutesWithSameName } = {}) {
    if (!router) {
      console.error('RouterBack: router is required on install')
      return
    }

    app.use(routerHistory, { ignoreRoutesWithSameName })
    router.afterEach(writeHistory)
  },
}

export default RouteBack
