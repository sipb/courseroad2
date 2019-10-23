export default {
  methods: {
    flatten: function(array) {
      return [].concat.apply([], array);
    }
  }
}
