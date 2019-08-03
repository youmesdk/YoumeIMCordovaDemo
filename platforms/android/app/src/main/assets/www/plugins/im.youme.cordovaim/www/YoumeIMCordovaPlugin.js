cordova.define("im.youme.cordovaim.YoumeIMCordovaPlugin", function(require, exports, module) {
var exec = require('cordova/exec');

exports.coolMethod = function (arg0, success, error) {
    exec(success, error, 'YoumeIMCordovaPlugin', 'coolMethod', [arg0]);
};

});
