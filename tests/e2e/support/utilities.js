export default {
  objectSlice: function (obj, keys) {
    const newObj = {};
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      newObj[key] = obj[key];
    }
    return newObj;
  },
};
