const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = {
  entry: './src/modules/website/entry.client.js',
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
  },
  plugins: [new VueSSRClientPlugin()],
}
