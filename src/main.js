import Vue from 'vue'
import elementUi from 'element-ui'
import echarts from 'echarts'
import md5 from 'js-md5'
import mavonEditor from 'mavon-editor'
import VideoPlayer from 'vue-video-player'
require('video.js/dist/video-js.css')
require('vue-video-player/src/custom-theme.css')
import App from './App.vue'
import router from './router'
import store from './store'
import api from './http'

import 'element-ui/lib/theme-chalk/index.css'
import 'mavon-editor/dist/css/index.css'
import '@/assets/style/reset.css'

Vue.use(elementUi)
Vue.use(VideoPlayer)
Vue.use(mavonEditor)
Vue.use(api)

Vue.prototype.$echarts = echarts
Vue.prototype.$md5 = md5
Vue.config.devtools = true
Vue.config.productionTip = false

new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app')