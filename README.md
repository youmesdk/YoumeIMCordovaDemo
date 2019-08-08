# YoumeIMCordovaDemo
Youme IM Cordova Demo

# Status
- Basic function for android platform is ready
- iOS support is coming

# Run demo for android
```
npm install -g cordova
cordova platform add android
cordova run android
```

# Run demo for iOS
* need install xcode before running
```
sudo npm install -g cordova
sudo npm install -g ios-deploy --unsafe-perm=true
cordova platform add ios
cordova run ios
```

# Update plugin
```
cordova plugin remove im.youme.cordovaim
cordova plugin add /PathTo/YoumeIMCordovaPlugin
```

# Core files for this demo
`www/index.html` is UI HTML

`www/demo/main.js` is Demo logic control
