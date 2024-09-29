const BrowserSupportPlugin = {
  install(Vue) {
    Vue.mixin({
      methods: {
        flatten: function (array) {
          return [].concat.apply([], array);
        },
      },
    });
  },
};

export default BrowserSupportPlugin;
