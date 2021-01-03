const path = require('path')
const assign = require('assign-deep')

const moduleConfig = require(process.env.MODULE_CONFIG)

process.env.VUE_APP_QS_ARRAY_FORMAT = 'none'
process.env.VUE_APP_PUBLIC_PATH = moduleConfig.appPath

const vueConfig = {
  publicPath: moduleConfig.appPath,
  outputDir: moduleConfig.outputDir,
  assetsDir: 'assets',
  devServer: {
    host: 'www.agile.test',
    compress: true,
  },
  pwa: moduleConfig.pwaEnable
    ? {
        name: moduleConfig.appName,
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
      }
    : null,
  chainWebpack: (config) => {
    config.entryPoints.delete('app')

    if (moduleConfig.appEntry) {
      for (const [key, value] of Object.entries(moduleConfig.appEntry)) {
        config.entry(key).add(value).end()
      }
    }

    config.resolve.alias.set('@shared', path.resolve('src/shared')).delete('@')

    if (moduleConfig.appAlias) {
      for (const [key, value] of Object.entries(moduleConfig.appAlias)) {
        config.resolve.alias.set(key, value)
      }
    }

    config.plugin('html').tap((args) => {
      args[0].template = 'public/app' + moduleConfig.appPath + '/index.html'
      args[0].title = moduleConfig.appName
      args[0].chunks = moduleConfig.appChunks

      return args
    })

    config.plugin('copy').tap((args) => {
      args[0][0].from = path.resolve('./public/app' + moduleConfig.appPath)

      args[0][1] = Object.assign({}, args[0][0], {
        from: path.resolve('./public/shared'),
      })

      return args
    })

    if (moduleConfig.chainWebpack) {
      moduleConfig.chainWebpack(config)
    }

    config.optimization.splitChunks({
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true,
        },
        element: {
          test: /[\\/]node_modules[\\/]_?element-plus(.*)/,
          chunks: 'initial',
          name: 'element',
          priority: 20,
          enforce: true,
        },
        shared: {
          test: /[\\/]src\/shared[\\/]/,
          chunks: 'initial',
          name: 'shared',
          priority: 5,
          enforce: true,
        },
      },
    })
  },
}

module.exports = assign(vueConfig, moduleConfig.vueConfig || {})
