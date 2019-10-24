const BrowserSupportPlugin = {
  install (Vue, options) {
    Vue.mixin({
      methods: {
        flatten: function (array) {
          return [].concat.apply([], array);
        }
      }
    });
  }
};

export default BrowserSupportPlugin;
