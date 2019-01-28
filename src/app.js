import Vue from 'vue'
import App from './App.vue'
import '../assets/app.css'
import Vuetify from 'vuetify'
import $ from 'jquery'
// import 'vuetify/dist/vuetify.min.css'

Vue.use(Vuetify)

new Vue({
  el: '#app',
  render: h => h(App),
})
