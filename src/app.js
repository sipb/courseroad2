import Vue from 'vue'
import App from './App.vue'
import MainPage from './pages/MainPage.vue'
import About from "./pages/About.vue"
import Vuetify from 'vuetify'
import VueRouter from 'vue-router'
import $ from 'jquery'
import VueCookies from "vue-cookies"
import "./assets/css/coursecolors.css"

import { library } from "@fortawesome/fontawesome-svg-core"
import { faSignInAlt, faSignOutAlt, faDownload, faUpload } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome"

library.add(faSignInAlt, faSignOutAlt, faDownload, faUpload)

Vue.component("font-awesome-icon", FontAwesomeIcon)

Vue.use(Vuetify)
Vue.use(VueCookies)
Vue.use(VueRouter)

var routes = [
  { path: '/', component: MainPage },
  { path: '/about', component: About }
]

var router = new VueRouter({
  routes
})

VueCookies.config('3d');

new Vue({
  el: "#app",
  router: router,
  render: h => h(App)
});
