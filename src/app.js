import Vue from "vue";
import App from "./App.vue";
import MainPage from "./pages/MainPage.vue";
import About from "./pages/About.vue";
import Vuetify from "vuetify";
import VueRouter from "vue-router";
import VueCookies from "vue-cookies";
import "./css/app.css";

import "@mdi/font/css/materialdesignicons.css";
import "vuetify/dist/vuetify.min.css";

import store from "./stores/courseData";
import BrowserSupportPlugin from "./plugins/browserSupport";

const opts = {
  icons: {
    iconfont: "mdi",
  },
  theme: {
    dark: false,
  },
};

Vue.use(Vuetify);
Vue.use(VueCookies);
Vue.use(VueRouter);
Vue.use(BrowserSupportPlugin);

const routes = [
  { path: "/", redirect: "/road" },
  { path: "/about", component: About },
  { path: "/road/:road?", component: MainPage },
  { path: "*", redirect: "/road" },
];

const router = new VueRouter({
  base: process.env.VUE_APP_URL.indexOf("dev") !== -1 ? "/dev/" : "/",
  mode: "history",
  routes,
});

VueCookies.config(Infinity);

const app = new Vue({
  vuetify: new Vuetify(opts),
  el: "#app",
  router,
  render: (h) => h(App),
  store,
});

if (window.Cypress) {
  window.app = app;
}
