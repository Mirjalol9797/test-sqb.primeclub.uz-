import { createApp } from "vue";
import { createPinia } from "pinia";
// import piniaPersist from "pinia-plugin-persist";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";
import VueApexCharts from "vue3-apexcharts";
const pinia = createPinia();
// pinia.use(piniaPersist);
pinia.use(piniaPluginPersistedstate);

// Импорт Telegram Web App
// import "./telegram-web-app.js";

import App from "./App.vue";
import router from "./router";
import i18n from "./plugins/i18n";
import { useLoginStore } from "./stores/login";

import "./index.css";
import "./assets/scss/main.scss";

import VueAwesomePaginate from "vue-awesome-paginate";
import "vue-awesome-paginate/dist/style.css";

import Vue3Toastify from "vue3-toastify";
import "vue3-toastify/dist/index.css";

import { registerComponents } from "./plugins/components";

import { createYmaps } from "vue-yandex-maps";
import { getAccessToken } from "./utils/tools";

const app = createApp(App);

registerComponents(app);
app.use(
  createYmaps({
    apikey: "2f796e00-a1a4-42b2-b896-162fd39a1606",
  })
);

app.use(Vue3Toastify, {
  autoClose: 200,
  style: {
    opacity: "1",
    userSelect: "initial",
  },
});
// app.mixin({
//   mounted() {
//     this.$nextTick(() => this.initChatWidget())
//   },
//   methods: {
//     initChatWidget() {
//       if (window.__chatWidgetInitDone || !this.checkWidgetAvailability()) return

//       window.__chatWidgetInitDone = true
//       const userInfo = this.getUserInfo()
//       const config = this.getWidgetConfig(userInfo)

//       console.log('Initializing ChatWidget with user:', userInfo.isLoggedIn ? 'Logged In' : 'Guest')
//       window.ChatWidget.init(config)
//     },

//     checkWidgetAvailability() {
//       if (!window.ChatWidget?.init) {
//         console.warn('ChatWidget SDK not loaded, retrying...')
//         setTimeout(() => this.initChatWidget(), 1000)
//         return false
//       }
//       return true
//     },

//     getUserInfo() {
//       try {
//         const loginStore = useLoginStore();

//         const user = loginStore.getUser
//         const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')

//         if (!user) return { isLoggedIn: false, csrfToken }

//         return {
//           isLoggedIn: true,
//           ...user,
//           csrfToken,
//           sessionId: document.cookie.match(/laravel_session=([^;]+)/)?.[1]
//         }
//       } catch (e) {
//         console.warn('Failed to get user info:', e)
//         return { isLoggedIn: false }
//       }
//     },

//     getWidgetConfig(user) {
//       // Setup widget methods
//       const token = getAccessToken()
//       console.log('User isLoggedIn:', user.isLoggedIn)
//       console.log('Token:', token)

//       window.ChatWidget = window.ChatWidget || {}
//       window.ChatWidget.getCurrentUserInfo = () => user
//       window.ChatWidget.getSecureHeaders = () => {
//         const headers = {
//           'Content-Type': 'application/json',
//           'Accept': 'application/json',
//           'X-Requested-With': 'XMLHttpRequest'
//         }

//         const currentToken = getAccessToken()
//         if (currentToken) {
//           headers['Authorization'] = `Bearer ${currentToken}`
//         }

//         console.log('Generated headers:', headers)
//         return headers
//       }

//       return {
//         apiUrl: 'https://chat.primeclub.uz/api/widget',
//         // apiUrl: 'http://127.0.0.1:8000/api/widget',
//         widgetUrl: 'https://chat.primeclub.uz/widget',
//         // widgetUrl: 'http://127.0.0.1:8000/widget',
//         apiKey: 'widget_KInVAdTARR0Uc0c2La6BpwMf9MP3Ukfv',
//         primaryColor: '#FF8945',
//         position: 'bottom-right',
//         debug: true,

//         network: { timeout: 30000, retries: 3, retryDelay: 1000 },
//         defaultHeaders: window.ChatWidget.getSecureHeaders(),

//         user: {
//           autoDetect: true,
//           sendToBackend: true,
//           userInfoEndpoint: '/api/user/info',
//           authMethod: 'csrf',
//           csrfToken: user.csrfToken,
//           currentUser: user,
//           customUserData: user.isLoggedIn ? {
//             user_id: user.id,
//             userId: user.id,
//             userEmail: user.email,
//             userName: user.name,
//             userRole: user.role || 'user',
//             userPhone: user.phone,
//             userAvatar: user.avatar,
//             sessionId: user.sessionId
//           } : { sessionId: user.sessionId }
//         },

//         endpoints: {
//           sendMessage: '/api/widget/message',
//           getUserInfo: '/api/user/info',
//           getHistory: '/api/widget/history',
//           uploadFile: '/api/widget/upload'
//         },
//         animations: {
//           enabled: true,
//           openSpeed: 300,
//           bounceIntensity: 'subtle',
//           typingAnimation: true,
//           fadeIn: true,
//           slideIn: true
//         },
//         design: {
//           theme: 'modern',
//           borderRadius: 'normal',
//           shadow: 'normal',
//           buttonStyle: 'floating',
//           chatWidth: 320,
//           chatHeight: 500,
//           fontSize: 'normal',
//           avatarStyle: 'circle',
//           messageStyle: 'bubbles'
//         },
//         visibility: {
//           enabled: true,
//           hideForLoggedUsers: false
//         },
//         access: {
//           allowGuestUsers: true,
//           allowLoggedUsers: true,
//           requireAuth: false,
//           readOnlyMode: false
//         },

//         callbacks: this.getWidgetCallbacks(user)
//       }
//     },

//     getWidgetCallbacks(user) {
//       return {
//         onInit: () => {
//           console.log('ChatWidget initialized successfully')
//           if (user.isLoggedIn && window.ChatWidget.updateUserInfo) {
//             window.ChatWidget.updateUserInfo(user)
//           }
//           window.ChatWidget.testConnection?.()
//             .then(() => console.log('Widget connection test: SUCCESS'))
//             .catch(err => console.error('Widget connection test: FAILED', err))
//         },
//         onOpen: () => console.log('ChatWidget opened'),
//         onClose: () => console.log('ChatWidget closed'),
//         onMessageSent: (message) => console.log('Message sent:', message),
//         onMessageReceived: (message) => console.log('Message received:', message),
//         onError: (error) => console.error('ChatWidget error:', error),
//         onNetworkError: (error) => {
//           console.error('Network error:', error)
//           setTimeout(() => window.ChatWidget.reconnect?.(), 5000)
//         },
//         onApiRequest: (url, options) => {
//           const secureHeaders = window.ChatWidget.getSecureHeaders()
//           options.headers = {
//             ...options.headers,
//             ...secureHeaders
//           }

//           console.log('API Request:', {
//             url,
//             headers: options.headers,
//             hasAuth: !!options.headers.Authorization
//           })

//           // Add user_id to POST requests
//           if (options.method === 'POST' && user.isLoggedIn) {
//             try {
//               const body = JSON.parse(options.body || '{}')
//               body.user_id = user.id
//               body.user_info = {
//                 id: user.id, name: user.name, email: user.email,
//                 role: user.role, phone: user.phone, avatar: user.avatar
//               }
//               options.body = JSON.stringify(body)
//             } catch (e) { console.warn('Could not parse request body:', e) }
//           }
//           return { url, options }
//         },
//         onApiResponse: (response) => console.log('API Response:', response)
//       }
//     }
//   }
// });

app.use(pinia);
app.use(router);
app.use(i18n);
app.use(VueAwesomePaginate);
app.use(VueApexCharts);

// // Store dan user ma'lumotini olish

// console.log("User ma'lumotlari:", loginStore.user);
// console.log("User getter orqali:", loginStore.getUser);
// console.log("Autentifikatsiya holati:", loginStore.isAuthenticated);
// console.log("Token:", loginStore.token);

app.mount("#app");
