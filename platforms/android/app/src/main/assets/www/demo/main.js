/**
 * @fileOverview 游密 IM SDK for Web Demo
 * @author benz@youme.im
 * @date 2019/8/5 modify by fish
 *
 * 每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */

 var demo = {
     // Application Constructor
     initialize: function() {
         document.addEventListener('deviceready', this.onDeviceReady.bind(this), false);
     },

     // deviceready Event Handler
     //
     // Bind any cordova events here. Common events are:
     // 'pause', 'resume', etc.
     onDeviceReady: function() {
         window.vc = new VConsole();
         {
             var ERROR_NAME = {
                 // 通用
                 NotLoginError: '请先登录',
                 InvalidParamError: '无效的参数',
                 InvalidLoginError: '无效的登录',
                 UsernameOrTokenError: '用户名或token错误',
                 LoginTimeoutError: '登录超时',
                 ServiceOverloadError: '服务过载，消息传输过于频繁',
                 MessageTooLongError: '消息长度超出限制，最大长度1400',
                 // 录音
                 UnsupportedVoiceFormatError: '不支持的音频格式',
                 DeviceNotSupportedError: '设备不支持录音',
                 AlreadyReadyError: '已经录过音或加载过音频了，要重新录音请重新 new 一个新实例',
                 CanceledError: '已经取消了录音或录音出错了，要重新录音请重新 new 一个新实例',
                 NotAllowedError: '没有录音权限',
                 RecorderNotStartedError: '没有启动录音却企图完成录音',
                 RecorderBusyError: '录音系统正忙，可能有其他实例正在录音中',
                 RecordTooShortError: '录音时长太短',
                 WXObjectIsEmptyError: '未传入微信wx对象',
                 WXObjectNoConfigError: '微信wx对象尚未初始化',
                 WXNoPermissionError: '微信wx对象没有提供录音相关接口权限'
             };

             function getErrorMsg(errorName) {
                 return ERROR_NAME[errorName] || errorName;
             }

             // 用 id 获取 dom
             function E(id) {
                 return document.getElementById(id);
             }

             // 聊天框的各种 html 模板
             var noticeTpl = E('tpl-notice').innerHTML;
             var leftTextTpl = E('tpl-left-text').innerHTML;
             var rightTextTpl = E('tpl-right-text').innerHTML;
             var leftVoiceTpl = E('tpl-left-voice').innerHTML;
             var rightVoiceTpl = E('tpl-right-voice').innerHTML;

             // 聊天框 Dom
             var chatDom = E('chat');

             // 所有消息的列表，{ id: Message }
             var msgHash = {};

             // 添加一条消息到聊天框
             function addDomToList(html, id) {
                 var li = document.createElement('li');
                 li.innerHTML = html;
                 if (id) {
                     li.setAttribute('data-id', id);
                 }
                 chatDom.appendChild(li);

                 // 超过 300 条，删除第一条
                 if (chatDom.childNodes.length > 300) {
                     var first = chatDom.firstChild;
                     var dataId = first.getAttribute('data-id');
                     if (dataId && msgHash.hasOwnProperty(dataId)) {
                         delete msgHash[dataId];
                     }
                     chatDom.removeChild(first);
                 }

                 // 页面滚动到底部
                 li.scrollIntoView(true);
             }

             // 添加提示消息
             function addNotice(text) {
                 var html = noticeTpl.replace('{{text}}', text);
                 addDomToList(html);
             }

             // 打出 console
             /*var oLog = window.console.log;
             window.console.log = function (message) {
                 oLog.apply(window.console, arguments);
                 addNotice(message.toString());
             };*/

             // 添加文本消息
             function addTextItem(msgObj) {
                 var html = msgObj.isFromMe ? rightTextTpl : leftTextTpl;
                 html = html.replace(/{{name}}/g, msgObj.senderId)
                     .replace('{{text}}', msgObj.msgContent);
                 addDomToList(html);
             }

             // 添加语音消息
             function addVoiceItem(msgObj) {
                 var html = msgObj.isFromMe ? rightVoiceTpl : leftVoiceTpl;
                 html = html.replace(/{{name}}/g, msgObj.senderId)
                     .replace(/{{time}}/g, msgObj.audioTime)
                     .replace(/{{id}}/g, msgObj.msgId)
                     .replace(/{{width}}/g, Math.round(msgObj.audioTime * 10) + 30);
                 addDomToList(html, msgObj.msgId);

                 // 绑定语音消息 Dom 的点击事件（播放）
                 E('btn-voice-' + msgObj.msgId).onclick = function () {
                     var msg = msgHash[msgObj.msgId];

                     showPlayUI();

                     cordova.plugins.YoumeIMCordovaPlugin.startPlayAudio(msg.audioPath,()=>{
                         showEndPlayUI();
                     },(code)=>{
                         console.log('startPlayAudio failed: ' + code);
                         showEndPlayUI();
                     })
                 };

                var showPlayUI = function () {
                     E('btn-voice-' + msgObj.msgId).className += ' voice-playing';
                 };
                 var showEndPlayUI = function () {
                     var b = E('btn-voice-' + msgObj.msgId);
                     b.className = b.className.replace(/\s*voice-playing/g, '');
                 };

                 // 把 msgObj 存起来
                 msgHash[msgObj.msgId] = msgObj;
             }

             // 添加消息（判断消息类型并选择 addTextItem 或 addVoiceItem）
             function addChatItem(msgObj) {
                 switch (msgObj.msgType) {
                     case 1:
                         addTextItem(msgObj);
                         break;
                     case 5:
                         addVoiceItem(msgObj);
                         break;
                     default:
                         addNotice('收到未知消息类型：' + msgObj.msgType);
                 }
             }

             // 记录当前房间号
             var curRoomId = '';

             // Initialize IM SDK
             console.log('call youme im init');
             cordova.plugins.YoumeIMCordovaPlugin.init(
                 "YOUME670584CA1F7BEF370EC7780417B89BFCC4ECBF78",
                 "yYG7XY8BOVzPQed9T1/jlnWMhxKFmKZvWSFLxhBNe0nR4lbm5OUk3pTAevmxcBn1mXV9Z+gZ3B0Mv/MxZ4QIeDS4sDRRPzC+5OyjuUcSZdP8dLlnRV7bUUm29E2CrOUaALm9xQgK54biquqPuA0ZTszxHuEKI4nkyMtV9sNCNDMBAAE=",
                 0,
                 code => {
                     console.log("call init success");
                 }, _errCode => {
                     console.log("call init fail: " + _errCode);
             })

             // 快捷填写测试账号
             var testUsers = {
                 sanji: '10001',
                 zoro3000: '10002',
                 youme_test201701: '201701',
                 youme_test201702: '201702'
             };
             E('login-sanji').onclick
                 = E('login-zoro3000').onclick
                 = E('login-youme_test201701').onclick
                 = E('login-youme_test201702').onclick
                 = function (e) {
                 var userId = e.target.value;
                 var token = testUsers[userId];
                 E('login-user-id').value = userId;
                 E('login-user-token').value = token;
             };

             // 登录并加入房间
             var login = function () {
                 var userId = E('login-user-id').value;
                 var token = E('login-user-token').value;
                 var roomId = E('login-room-id').value;

                 if (!userId) {
                     alert('请输入用户ID。');
                     return;
                 }
                 if (!token) {
                     alert('请输入token。');
                     return;
                 }

                 //register message listener
                 cordova.plugins.YoumeIMCordovaPlugin.registerReconnectCallback(msg=>{
                     var json = JSON.parse(msg)
                     if(json.event === 'onStartReconnect'){
                         // sdk start reconnect
                     }else if(json.event === 'onRecvReconnectResult'){
                         if(json.result === 0){ //result 0- reconnect success，1- reconnect fail，try again，2- reconnect failed
                             console.log('reconnect success');
                         }
                     }
                 })

                 cordova.plugins.YoumeIMCordovaPlugin.registerKickOffCallback(msg=>{
                     console.log('be kick off')
                     kickoff();
                 })

                 cordova.plugins.YoumeIMCordovaPlugin.registerMsgEventCallback(msg=>{
                     //recv remote message
                     var msgObj = JSON.parse(msg)
                     msgObj.isFromMe = false;//always from remote user
                     addChatItem(msgObj);
                 })

                 accountLogining();
                 window.lastLoginUserId = userId;
                 cordova.plugins.YoumeIMCordovaPlugin.login(userId,"123456", "", code => {

                    // on login success, you can set message trans type
                    //  0 message will delivery directly; 1 means just cc to app server, not delivery directly
                    cordova.plugins.YoumeIMCordovaPlugin.switchTransType(0);

                     accountLogin(userId);
                     // if have roomId, join chat room
                     if (roomId) {
                         joining(roomId);
                         cordova.plugins.YoumeIMCordovaPlugin.joinChatRoom(roomId, _roomId => {
                             joinSucess(_roomId);
                             console.log("join chat room success, roomId: " + _roomId);
                         }, _roomId => {
                             console.log("join chat room fail, roomid：" + _roomId);
                             joinFailed(_roomId);
                         })
                         curRoomId = roomId;
                     }
                 }, _errCode => {
                     if(_errCode == 7){
                         accountLogin(userId);
                         console.log('already login')
                     }else{
                         accountLoginFail(_errCode)
                     }
                 })

             };
             E('btn-login').onclick = login;
             E('login-user-id').onkeydown = function (e) {
                 if (e.key === 'Enter' || e.key === 'Tab') {
                     if (e.key === 'Enter' && !e.target.value) {
                         alert('用户ID 不能为空');
                     }
                     E('login-user-token').focus();
                     E('login-user-token').select();
                 }
             };
             E('login-user-token').onkeydown = function (e) {
                 if (e.key === 'Enter' || e.key === 'Tab') {
                     if (e.key === 'Enter' && !e.target.value) {
                         alert('Token 不能为空');
                     }
                     E('login-room-id').focus();
                     E('login-room-id').select();
                 }
             };
             E('login-room-id').onkeydown = function (e) {
                 if (e.key === 'Enter') {
                     login();
                 }
                 if (e.key === 'Tab') {
                     E('btn-login').focus();
                 }
             };

             // 退出登录
             E('btn-user-logout').onclick = function () {
                 cordova.plugins.YoumeIMCordovaPlugin.logout( () => {
                     accountLogout();
                     console.log("logout success");
                 }, _code => {
                     alert("logout failed:" + _code);
                 })
             };

             // 加入房间
             E('btn-room-join').onclick = function () {
                 var roomId = E('text-room-id').value;
                 cordova.plugins.YoumeIMCordovaPlugin.joinChatRoom(roomId, _roomId => {
                     console.log("join chat room success, roomId: " + _roomId);
                 }, _roomId => {
                     alert("join chat room fail, roomid：" + _roomId);
                 })
                 curRoomId = roomId;
             };

             // 退出房间
             E('btn-room-leave').onclick = function () {
                 cordova.plugins.YoumeIMCordovaPlugin.leaveChatRoom(curRoomId, _roomId => {
                     console.log("join chat room success, roomId: " + _roomId);
                     leaveSuccess(_roomId);
                 }, _roomId => {
                     console.log("join chat room fail, roomid：" + _roomId);
                     leaveFailed(_roomId);
                 })
             };

             // 切换到文字输入
             E('btn-to-text').onclick = function () {
                 E('voice-ctrl').style.display = 'none';
                 E('text-ctrl').style.display = 'flex';
             };

             // 切换到语音输入
             E('btn-to-voice').onclick = function () {
                 E('voice-ctrl').style.display = 'flex';
                 E('text-ctrl').style.display = 'none';
             };

             // 发送文字消息
             var sendText = function () {
                 var text = E('text-msg').value;

                 cordova.plugins.YoumeIMCordovaPlugin.sendTextMessage(
                     curRoomId, // receiver id
                     2,  // 1 private chat, 2 room chat
                     text, // msg content
                     '',   // custom extra param
                     (msg) => {
                         console.log("send success:" + msg);
                         var msgObj = {
                             isFromMe: true,
                             senderId: window.lastLoginUserId,
                             msgContent: text,
                             msgType: 1
                         }
                         addChatItem(msgObj);

                     }, msg => {
                         addNotice(msg);
                     }
                 )

                 E('text-msg').value = '';
                 E('text-msg').focus();
             };
             E('btn-send').onclick = sendText;
             E('text-msg').onkeydown = function (e) {
                 if (e.key === 'Enter') {
                     sendText();
                 }
             };


             // 按下录音键（按住说话）
             var holdDown = function (e) {
                 isInCancelArea = false;

                 E('btn-hold-speak').className = 'active';

                 cordova.plugins.YoumeIMCordovaPlugin.startRecordAudioMessage(
                     curRoomId, // receiver id
                     2,  // 1 private chat, 2 room chat
                     'attach my txt', // msg content
                     false,   // custom extra param
                     (msg) => {
                         console.log("start record success:" + msg);
                         E('btn-hold-speak').className = 'active speaking';
                         E('btn-hold-speak-text').innerHTML = '松开 完成';
                         E('speak-display-recording').style.display = 'block';
                         E('speak-display-leave-to-cancel').style.display = 'none';
                     }, msg => {
                         addNotice(msg);
                     }
                 )

                 e.preventDefault();
             };
             E('btn-hold-speak').addEventListener('touchstart', holdDown);
             E('btn-hold-speak').addEventListener('mousedown', holdDown);

             // 手指（或鼠标）在界面上移动
             var isInCancelArea = false;
             var inCancel = function () {
                 if (isInCancelArea) { return; }
                 isInCancelArea = true;
                 E('speak-display-recording').style.display = 'none';
                 E('speak-display-leave-to-cancel').style.display = 'block';
                 E('btn-hold-speak-text').innerHTML = '松开 取消';
             };
             var inFinish = function () {
                 if (!isInCancelArea) { return; }
                 isInCancelArea = false;
                 E('speak-display-recording').style.display = 'block';
                 E('speak-display-leave-to-cancel').style.display = 'none';
                 E('btn-hold-speak-text').innerHTML = '松开 完成';
             };
             var inWhere = function (pageY) {
                 if (pageY < window.innerHeight * 0.83) {
                     inCancel();
                 } else {
                     inFinish();
                 }
             };
             E('btn-hold-speak').addEventListener('touchmove', function (e) { inWhere(e.touches[0].pageY); e.preventDefault();});
             E('btn-hold-speak').addEventListener('mousemove', function (e) { inWhere(e.pageY); e.preventDefault();});

             // 在取消区域松手
             var holdUpCancel = function () {
                 E('btn-hold-speak').className = '';
                 E('btn-hold-speak-text').innerHTML = '按住 说话';
                 // cancel audio record
                 cordova.plugins.YoumeIMCordovaPlugin.cancelAudioMessage();
             };

             // 在完成区域松手
             var holdUpFinish = function () {
                 E('btn-hold-speak').className = '';
                 E('btn-hold-speak-text').innerHTML = '按住 说话';
                 // stop record and send audio to room
                 cordova.plugins.YoumeIMCordovaPlugin.stopAndSendAudioMessage(
                     audioMsgInfo =>{
                         // TODO ready for display
                         var jsonMsg = JSON.parse(audioMsgInfo);
                         var msgObj = {
                             isFromMe: true,
                             senderId: window.lastLoginUserId,
                             audioTime: jsonMsg.audioTime ,
                             msgId: jsonMsg.msgId ,
                             audioPath: jsonMsg.audioPath ,
                             msgType: 5
                         }
                         addChatItem(msgObj);
                     },
                     errorCode =>{
                         addNotice('send audio message failed: '+errorCode);
                     }
                 );
             };

             var holdUpWhere = function (e) {
                 if (isInCancelArea) {
                     holdUpCancel();
                 } else {
                     holdUpFinish();
                 }
                 e.preventDefault();
             };
             E('btn-hold-speak').addEventListener('touchend', holdUpWhere);
             E('btn-hold-speak').addEventListener('mouseup', holdUpWhere);

             // UI绑定：已登录
             var accountLogin =  function (userid)  {
                 E('user-logged').style.display = 'block';
                 E('user-no-log').style.display = 'none';
                 E('login-form').style.display = 'none';
                 E('dsp-user-name').innerHTML = userid;
                 addNotice('已登录到 ' + userid);
             };

             // UI绑定：正在登录中
             var accountLogining = function ()  {
                 E('user-logged').style.display = 'none';
                 E('user-no-log').style.display = 'none';
                 E('btn-login').setAttribute('disabled', true);
                 E('btn-login').value = '登录中...';
             };

             // UI绑定：退出登录
             var accountLogout = function ()  {
                 E('user-logged').style.display = 'none';
                 E('user-no-log').style.display = 'block';
                 E('login-form').style.display = 'flex';
                 E('btn-login').removeAttribute('disabled');
                 E('btn-login').value = '登录';
                 addNotice('退出登录');
             };

             // UI绑定：登录失败
             var accountLoginFail = function ( msg)  {
                 E('user-logged').style.display = 'none';
                 E('user-no-log').style.display = 'block';
                 E('login-form').style.display = 'flex';
                 E('btn-login').removeAttribute('disabled');
                 E('btn-login').value = '登录';
                 addNotice('登录失败：' + msg);
             };

             // UI绑定：被踢下线
             var kickoff =  function ()  {
                 alert('你被踢下线了');
                 addNotice('你被踢下线了');
                 E('user-logged').style.display = 'none';
                 E('user-no-log').style.display = 'block';
                 E('login-form').style.display = 'flex';
                 E('btn-login').removeAttribute('disabled');
                 E('btn-login').value = '登录';
             };

             // UI绑定：正在请求加入房间
             var joining = function (roomId)  {
                 E('room-joined').style.display = 'none';
                 E('room-no-join').style.display = 'none';
                 E('room-joining').style.display = 'block';
                 E('dsp-room-joining-name').innerHTML = roomId;
             };

             // UI绑定：加入房间
             var joinSucess = function ( roomId)  {
                 E('room-joined').style.display = 'block';
                 E('room-no-join').style.display = 'none';
                 E('room-joining').style.display = 'none';
                 E('dsp-room-name').innerHTML = roomId;
                 E('dsp-room-joining-name').innerHTML = roomId;
                 E('text-room-id').value = roomId;
                 addNotice('加入房间：' + roomId);
             };

             // UI绑定：退出房间
             var leaveSuccess = function (roomId)  {
                 E('room-joined').style.display = 'none';
                 E('room-no-join').style.display = 'block';
                 E('room-joining').style.display = 'none';
                 addNotice('退出房间：' + roomId);
             };

             // UI绑定：加入房间失败
             var joinFailed = function (roomId)  {
                 E('room-joined').style.display = 'none';
                 E('room-no-join').style.display = 'block';
                 E('room-joining').style.display = 'none';
                 addNotice('加入房间 ' + roomId + ' 失败：');
             };

             // UI绑定：退出房间失败
             var leaveFailed = function ( roomId)  {
                 E('room-joined').style.display = 'block';
                 E('room-no-join').style.display = 'none';
                 E('room-joining').style.display = 'none';
                 E('dsp-room-name').innerHTML = roomId;
                 E('dsp-room-joining-name').innerHTML = roomId;
                 E('text-room-id').value = roomId;
                 addNotice('退出房间 ' + roomId + ' 失败：');
             };

             // 打开 vConsole
             E('v-console-switch').onclick = function () {
                 window.vc.show();
             };

             // 版本
             addNotice('Ver 8');

         }
     },

     // Update DOM on a Received Event
     receivedEvent: function(id) {

     }
 };

 demo.initialize();
