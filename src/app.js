/* eslint-disable no-new */
import Vue from 'vue';
import App from './App.vue';
import MainPage from './pages/MainPage.vue';
import About from './pages/About.vue';
import Vuetify from 'vuetify';
import VueRouter from 'vue-router';
import VueCookies from 'vue-cookies';
import colors from 'vuetify/es5/util/colors';
import './css/app.css';

import { library } from '@fortawesome/fontawesome-svg-core';
import { faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import store from './stores/courseData';
import BrowserSupportPlugin from './plugins/browserSupport';

library.add(faSignInAlt, faSignOutAlt, faCloudDownloadAlt, faCloudUploadAlt);

Vue.component('font-awesome-icon', FontAwesomeIcon);

Vue.use(Vuetify, {
  theme: {
    primary: '#F26521',
    defaultPrimary: '#1976D2',
    discordOrange: '#F26521',
    discordPurple: '#7289DA',
    crlogo: colors.blueGrey.darken2,
    crlogoDark: colors.blueGrey.darken2,
    crlogoLight: colors.blueGrey.lighten5,
    background: colors.grey.darken4,
    background2: colors.grey.darken4,
    search: colors.grey.darken4,
    backgroundDark: colors.grey.darken4,
    backgroundLight: colors.grey.lighten2,
    background2Light: colors.grey.lighten4,
    searchLight: colors.shades.white,
    warning: colors.yellow.base,
    success: colors.green.base,
    error: colors.red.base
  }
});
Vue.use(VueCookies);
Vue.use(VueRouter);
Vue.use(BrowserSupportPlugin);

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
