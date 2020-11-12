const path = require('path')
const assign = require('assign-deep')
const vueConfig = require('./vue.config')

const clientConfig = require('./vue.entry.website.client')
const serverConfig = require('./vue.entry.website.server')

const customConfig = {
  publicPath: '',
  outputDir: 'dist/website',
  configureWebpack:
    process.env.TARGET_ENV === 'server' ? serverConfig : clientConfig,
  devServer: {
    port: 8082,
  },
}

module.exports = assign(vueConfig, customConfig)
