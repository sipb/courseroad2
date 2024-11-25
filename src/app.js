import Vue from "vue";
import App from "./App.vue";
import MainPage from "./pages/MainPage.vue";
import vuetify from "./plugins/vuetify";
import VueRouter from "vue-router";
import VueCookies from "vue-cookies";
import "./css/app.css";
import { createPinia, PiniaVuePlugin } from "pinia";

import BrowserSupportPlugin from "./plugins/browserSupport";

Vue.use(VueCookies);
Vue.use(VueRouter);
Vue.use(BrowserSupportPlugin);
Vue.use(PiniaVuePlugin);

const pinia = createPinia();

/** @type import("vue-router").RouteConfig[] */
const routes = [
  { path: "/", redirect: "/road" },
  { path: "/road/:road?", component: MainPage },
  { path: "*", redirect: "/road" },
];

const router = new VueRouter({
  base: import.meta.env.VITE_URL.indexOf("dev") !== -1 ? "/dev/" : "/",
  mode: "history",
  routes,
});

VueCookies.config(Infinity);

const app = new Vue({
  vuetify,
  el: "#app",
  router,
  render: (h) => h(App),
  pinia,
});

if (window.Cypress) {
  window.app = app;
}
