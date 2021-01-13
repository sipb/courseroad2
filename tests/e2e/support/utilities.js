export default {
  objectSlice: function(obj, keys) {
    let newObj = {};
    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];
      newObj[key] = obj[key];
    }
    return newObj;
  }
}
