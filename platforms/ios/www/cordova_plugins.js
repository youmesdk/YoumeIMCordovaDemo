cordova.define('cordova/plugin_list', function(require, exports, module) {
  module.exports = [
    {
      "id": "im.youme.cordovaim.YoumeIMCordovaPlugin",
      "file": "plugins/im.youme.cordovaim/www/YoumeIMCordovaPlugin.js",
      "pluginId": "im.youme.cordovaim",
      "clobbers": [
        "cordova.plugins.YoumeIMCordovaPlugin"
      ]
    }
  ];
  module.exports.metadata = {
    "cordova-plugin-whitelist": "1.3.4",
    "im.youme.cordovaim": "1.0.0"
  };
});