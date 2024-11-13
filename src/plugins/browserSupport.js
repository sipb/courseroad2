export const flatten = (array) => {
  return [].concat.apply([], array);
};

const BrowserSupportPlugin = {
  install(Vue) {
    Vue.mixin({
      methods: {
        flatten: flatten,
      },
    });
  },
};

export default BrowserSupportPlugin;
