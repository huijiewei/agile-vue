const VueSSRClientPlugin = require('vue-server-renderer/client-plugin')

module.exports = {
  entry: './src/app/website/entry.client.js',
  optimization: {
    runtimeChunk: {
      name: 'manifest',
    },
  },
  plugins: [new VueSSRClientPlugin()],
}
