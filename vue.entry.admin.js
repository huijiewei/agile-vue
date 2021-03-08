const path = require('path')
const apiMocker = require('mocker-api')
const webpack = require('webpack')

module.exports = {
  appPath: '/admin',
  appName: 'Agile 管理后台',
  appEntry: {
    admin: './src/app/admin/main.js',
  },
  appAlias: {
    '@admin': path.resolve('src/app/admin'),
  },
  appChunks: ['vendor', 'element', 'shared', 'admin'],
  outputDir: 'dist/admin',
  pwaEnable: true,
  chainWebpack: (config) => {
    config
      .plugin('NormalModuleReplacement')
      .use(webpack.NormalModuleReplacementPlugin, [
        /element-plus[\/\\]lib[\/\\]locale[\/\\]lang[\/\\]en/,
        'element-plus/lib/locale/lang/zh-cn',
      ])
  },
  vueConfig: {
    devServer: {
      port: 8080,
      before(app) {
        apiMocker(app, path.resolve('./mocker/admin/index.js'))
      },
    },
  },
}
