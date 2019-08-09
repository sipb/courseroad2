/* eslint-disable no-new */
import Vue from 'vue';
import App from './App.vue';
import MainPage from './pages/MainPage.vue';
import About from './pages/About.vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import VueCookies from 'vue-cookies';
import './css/app.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import store from './stores/courseData';

library.add(faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(Vuetify);
Vue.use(VueCookies);
Vue.use(VueRouter);

var routes = [
  { path: '/', component: MainPage },
  { path: '/about', component: About }
];

var router = new VueRouter({
  routes
});

VueCookies.config(Infinity);

new Vue({
  el: '#app',
  router: router,
  render: h => h(App),
  store
});
