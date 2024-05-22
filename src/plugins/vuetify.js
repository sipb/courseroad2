import Vue from "vue";
import Vuetify from "vuetify";

import "vuetify/dist/vuetify.min.css";
import "@mdi/font/css/materialdesignicons.css";

Vue.use(Vuetify);

const opts = {
  icons: {
    iconfont: "mdi",
  },
  theme: {
    dark: false,
  },
};

export default new Vuetify(opts);
