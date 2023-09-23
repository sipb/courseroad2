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
import { faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt, faCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import store from './stores/courseData';
import BrowserSupportPlugin from './plugins/browserSupport';

library.add(faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt, faCheck);

Vue.component('FontAwesomeIcon', FontAwesomeIcon);

Vue.use(Vuetify);
Vue.use(VueCookies);
Vue.use(VueRouter);
Vue.use(BrowserSupportPlugin);

var routes = [
  { path: '/', redirect: '/road' },
  { path: '/about', component: About },
  { path: '/road/:road?', component: MainPage },
  { path: '*', redirect: '/road' }
];

var router = new VueRouter({
  base: process.env.VUE_APP_URL.indexOf('dev') !== -1 ? '/dev/' : '/',
  mode: 'history',
  routes
});

VueCookies.config(Infinity);

const app = new Vue({
  el: '#app',
  router: router,
  render: h => h(App),
  store
});

if (window.Cypress) {
  window.app = app;
}
