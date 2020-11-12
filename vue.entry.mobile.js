const path = require('path')
const apiMocker = require('mocker-api')

module.exports = {
  appPath: '/mobile',
  appName: 'Agile 移动应用',
  appEntry: {
    mobile: './src/modules/mobile/main.js',
  },
  appAlias: {
    '@mobile': path.resolve('src/modules/mobile'),
  },
  appChunks: ['vendor', 'agile', 'mobile'],
  outputDir: 'dist/mobile',
  pwaEnable: true,
  vueConfig: {
    devServer: {
      port: 8081,
      before(app) {
        apiMocker(app, path.resolve('./mocker/mobile/index.js'))
      },
    },
  },
}
