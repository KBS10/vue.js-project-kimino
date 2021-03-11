import '@babel/polyfill'
import Vue from 'vue'
import './plugins/vuetify'
import App from './App.vue'
import router from './router'
import store from './store'
import './registerServiceWorker'

Vue.config.productionTip = false

export const eventBus = new Vue({
  methods: {
    listEdit(memo, index) {
      this.$emit('listEdit', memo, index)
    }
  }
})

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')

// ================== 서비스 워커 설정 =====================
let swRegistration = null; // 서비스 워크로부터 성공 했을 시 활성되는 변수.
// applicationServerPublicKey === 내 퍼블릭 키 (파이어베이스 서버 키)
const applicationServerPublicKey = 'AAAALyEFKgM:APA91bG9Mm1abdGsdzPF3xlmwHS0Q-Z6FvoUyiu0HhLICr2cY-MrnZaPZCMvAd6nXRIrge3Jz6fz5iP7asGnGRAtc3WIT8zmit72i1X9bHDWWU9CE0Zxzj_742h07BAczRS18Kx5ZTUn';
let alarmAllow = false; // 사용자로 부터 알람 허가 버튼

// // 웹 앱에서 VAPID 키를 사용하는 경우 URL 안전 base64 문자열을 Uint8Array로 변환하여 구독 호출에 전달해야한다. (web-push)
// function urlBase64ToUint8Array(base64String) {
//   const padding = '='.repeat((4 - base64String.length % 4) % 4);
//   const base64 = (base64String + padding)
//   .replace(/-/g, '+')
//   .replace(/_/g, '/');

//   const rawData = window.atob(base64);
//   const outputArray = new Uint8Array(rawData.length);

//   for (let i = 0; i < rawData.length; ++i) {
//     outputArray[i] = rawData.charCodeAt(i);
//   }
//   return outputArray;
// }
// const convertedVPkey = urlB64ToUint8Array(applicationServerPublicKey);

// registration.pushManager.subscribe({
//   userVisibleOnly: true,
//   applicationServerKey: convertedVPkey
// });
// 여기까지가 web-push

if ('serviceWorker' in navigator && 'PushManager' in window) {
  console.log('Service Worker and Push is supported');

  // 서비스 워커 로딩 후 > service-worker.js파일로 들어간 후 접속 / 오류로 판단하여 다음 문장 실행
  navigator.serviceWorker.register('service-worker.js')
    .then(function (swReg) {
      // 서비스워크를 불러왔을 시 수행되는 문장. (vue의 mounted 구간 같음. 생명주기로 봤을 땐 컴포넌트들이 붙기 전 상황.)
      console.log('Service Worker is registered', swReg);
      swRegistration = swReg;
      initialiseUI();
    })
    .catch(function (error) {
      console.error('Service Worker Error', error);
    });
} else {
  console.warn('Push messaging is not supported');
}

function initialiseUI() {
  // Set the initial subscription value
  //   self.addEventListener('push', function (event) {
  //     console.log('[Service Worker] Push Received.');
  //     // console.log(`[Service Worker] Push had this data: "${event.data.text()}"`);

  //     const title = '키미노하나와';
  //     const options = {
  //       body: '경고 알림 테스트중..',
  //       icon: './imgs/icon.png',
  //       badge: './imgs/badge.png',
  //     };

  //     const notificationPromise = self.registration.showNotification(title, options);
  //     event.waitUntil(notificationPromise);
  //     console.log("이걸로 알람 울리는건가?")
  //   });
  // // self.addEventListener('push', ......);
  // // selft는 서비스 워커 자체를 참조한다. 따라서 서비스워커에 이벤트 리스터를 추가한다는 의미.

  // self.addEventListener('notificationclick', function (event) {
  //   console.log(' [Service Worker] Notification click Received.');

  //   event.notification.close();

  //   event.waitUntil(
  //     clients.openWindow('http://photo-album-bok.s3-website.ap-northeast-2.amazonaws.com')
  //   );
  // });
}

// ====================== 파이어베이스로부터 연동 ===========================
import * as firebase from "firebase";

var config = {
  apiKey: "AIzaSyBvo_PpzphyuDmMMDSRJGPiUO5FLchWtYM",
  authDomain: "vue-kiminohanawa.firebaseapp.com",
  databaseURL: "https://vue-kiminohanawa.firebaseio.com",
  projectId: "vue-kiminohanawa",
  storageBucket: "vue-kiminohanawa.appspot.com",
  messagingSenderId: "202417449475",
  appId: "1:202417449475:web:a6f8f4e3cbfb1039aabc36"
}; // 4. Get Firebase Configuration
firebase.initializeApp(config);

const messaging = firebase.messaging();

messaging.usePublicVapidKey("BEcE7u9DxENd25OPxu70kT8m43m2ON81y_THmJ_-JaCokc59nwt7ynq3NEywVl_31wEB5A5uUWh5TiVxVKStCvg"); // 1. Generate a new key pair

// Request Permission of Notifications
messaging.requestPermission().then(() => {
  console.log('파이어베이스 Notification permission granted.');

  // Get Token
  messaging.getToken().then((token) => {
    // 토큰을 받아서 콘솔창에 토큰 출력.
    console.log("==== 파이어베이스로부터 받은 토큰 값 ====")
    console.log(token)
    console.log("==== 파이어베이스로부터 받은 토큰 값 ====")
  })
}).catch((err) => {
  console.log('Unable to get permission to notify.', err);
});