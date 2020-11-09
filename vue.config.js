const path = require('path')
const assign = require('assign-deep')

const moduleConfig = require(process.env.MODULE_CONFIG)

process.env.VUE_APP_QS_ARRAY_FORMAT = 'none'
process.env.VUE_APP_PUBLIC_PATH = moduleConfig.config.publicPath

const config = {
  assetsDir: 'assets',
  devServer: {
    host: 'www.agile.test',
    compress: true,
  },
  chainWebpack: (config) => {
    config.entryPoints.delete('app')

    config.resolve.alias.set('@core', path.resolve('src/core')).delete('@')

    config.plugin('copy').tap((args) => {
      args[0][1] = Object.assign({}, args[0][0], {
        from: path.resolve('./public/common'),
      })
      return args
    })

    moduleConfig.chainWebpack(config)

    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'initial',
          name: 'vendor',
          priority: 10,
          enforce: true,
        },
        element: {
          test: /[\\/]node_modules[\\/]_?element-ui(.*)/,
          name: 'element',
          priority: 20,
          enforce: true,
        },
        agile: {
          test: /[\\/]src\/core[\\/]/,
          name: 'agile',
          priority: 5,
          enforce: true,
        },
      },
    })
  },
}

module.exports = assign(config, moduleConfig.config)
