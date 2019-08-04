/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    onDeviceReady: function() {
        this.receivedEvent('deviceready');

        this.init();
        this.registerCallback();
        this.login();
    },

    // Update DOM on a Received Event
    receivedEvent: function(id) {
        var parentElement = document.getElementById(id);
        var listeningElement = parentElement.querySelector('.listening');
        var receivedElement = parentElement.querySelector('.received');

        listeningElement.setAttribute('style', 'display:none;');
        receivedElement.setAttribute('style', 'display:block;');

        console.log('Received Event: ' + id);
    },
    init: function(){
        console.log('call youme im init');
        cordova.plugins.YoumeIMCordovaPlugin.init(
        "YOUME670584CA1F7BEF370EC7780417B89BFCC4ECBF78",
        "yYG7XY8BOVzPQed9T1/jlnWMhxKFmKZvWSFLxhBNe0nR4lbm5OUk3pTAevmxcBn1mXV9Z+gZ3B0Mv/MxZ4QIeDS4sDRRPzC+5OyjuUcSZdP8dLlnRV7bUUm29E2CrOUaALm9xQgK54biquqPuA0ZTszxHuEKI4nkyMtV9sNCNDMBAAE=",
        0,
        code => {
            alert("call init success");
        }, _errCode => {
            alert("call init fail：" + _errCode);
        })

    },
    login: function(){
        // create random user id for test
        var rnd = Math.random();
        var i = parseInt(rnd * 10000);

        cordova.plugins.YoumeIMCordovaPlugin.login("userid_"+ i,"password", "", code => {
            alert("login success");
        }, _errCode => {
            alert("login fail：" + _errCode);
        })
    },
    logout: function(){
        cordova.plugins.YoumeIMCordovaPlugin.logout(() => {
            alert("logout success");
        }, _errCode => {
            alert("logout fail：" + _errCode);
        })
    },
    sendTextMessage: function(strRecvId, iChatType, strMsgContent, strAttachParam){
        cordova.plugins.YoumeIMCordovaPlugin.sendTextMessage(strRecvId, iChatType, strMsgContent, strAttachParam, (msg) => {
                    alert("send success");
                    console.log(msg)
                }, msg => {
                    alert("send fail：" + msg);
                })
    },
    registerCallback:function(){
        cordova.plugins.YoumeIMCordovaPlugin.registerReconnectCallback((msg)=>{
            console.log('on reconnect:'+msg)
        })
        cordova.plugins.YoumeIMCordovaPlugin.registerKickOffCallback((msg)=>{
            console.log('on kickOff:'+msg)
        })
        cordova.plugins.YoumeIMCordovaPlugin.registerMsgEventCallback((msg)=>{
            console.log('on recv msg:'+msg)
            let msgObject = JSON.parse(msg)
            if(msgObject.msgType == 1)//text message
            {

            }else if(msgObject.msgType == 6) //audio message
            {

            }
        })
    }
};

app.initialize();