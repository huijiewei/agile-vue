const path = require('path')
const apiMocker = require('mocker-api')

const appPublicPath = '/admin'

const customConfig = {
  publicPath: appPublicPath,
  outputDir: 'dist/admin',
  pwa: {
    name: 'Agile 管理后台',
    manifestOptions: {
      icons: [
        {
          src: 'icons/android-chrome-192x192.png',
          sizes: '192x192',
          type: 'image/png',
        },
        {
          src: 'icons/android-chrome-512x512.png',
          sizes: '512x512',
          type: 'image/png',
        },
      ],
    },
    iconPaths: {
      favicon16: 'icons/favicon-16x16.png',
      favicon32: 'icons/favicon-32x32.png',
      appleTouchIcon: 'icons/apple-touch-icon.png',
      maskIcon: 'icons/safari-pinned-tab.svg',
      msTileImage: 'icons/mstile-144x144.png',
    },
  },
  devServer: {
    port: 8080,
    before(app) {
      apiMocker(app, path.resolve('./mocker/admin/index.js'))
    },
  },
}

module.exports = {
  config: customConfig,
  chainWebpack: (config) => {
    config.entry('admin').add('./src/modules/admin/main.js').end()

    config.resolve.alias.set('@admin', path.resolve('src/modules/admin'))

    config.plugin('html').tap((args) => {
      args[0].template = 'public/admin/index.html'
      args[0].title = 'Agile 管理后台'
      args[0].chunks = ['vendor', 'element', 'agile', 'admin']
      return args
    })

    config.plugin('copy').tap((args) => {
      args[0][0].from = path.resolve('./public/admin')
      return args
    })
  },
}
