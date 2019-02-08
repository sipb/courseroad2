import Vue from 'vue'
import App from './App.vue'
import '../assets/app.css'
import Vuetify from 'vuetify'
import $ from 'jquery'
import VueCookies from "vue-cookies"
// import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)
Vue.use(VueCookies)

VueCookies.config('3d');

new Vue({
  el: '#app',
  render: h => h(App),
})
