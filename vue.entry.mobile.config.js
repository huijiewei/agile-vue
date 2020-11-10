const path = require('path')
const apiMocker = require('mocker-api')

const customConfig = {
  publicPath: '/mobile',
  outputDir: 'dist/mobile',
  pwa: {
    name: 'Agile 移动应用',
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
      apiMocker(app, path.resolve('./mocker/mobile/index.js'))
    },
  },
}

module.exports = {
  config: customConfig,
  chainWebpack: (config) => {
    config.entry('mobile').add('./src/modules/mobile/main.js').end()

    config.resolve.alias.set('@mobile', path.resolve('src/modules/mobile'))

    config.plugin('html').tap((args) => {
      args[0].template = 'public/mobile/index.html'
      args[0].title = 'Agile 移动应用'
      args[0].chunks = ['vendor', 'agile', 'mobile']
      return args
    })

    config.plugin('copy').tap((args) => {
      args[0][0].from = path.resolve('./public/mobile')
      return args
    })
  },
}
