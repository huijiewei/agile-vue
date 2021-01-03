const path = require('path')
const apiMocker = require('mocker-api')

module.exports = {
  appPath: '/mobile',
  appName: 'Agile 移动应用',
  appEntry: {
    mobile: './src/app/mobile/main.js',
  },
  appAlias: {
    '@mobile': path.resolve('src/app/mobile'),
  },
  appChunks: ['vendor', 'shared', 'mobile'],
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
