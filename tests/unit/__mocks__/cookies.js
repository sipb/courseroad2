var cookies = {};

export default {
  config: function(expireTimes) {},
  set: function(keyName, value, expireTimes) {
    cookies[keyName] = value;
  },
  get: function(keyName) {
    return cookies[keyName];
  },
  remove: function(keyName) {
    delete cookies[keyName];
  },
  isKey: function(keyName) {
    return keyName in cookies;
  },
  keys: function() {
    return Object.keys(cookies);
  },
  clear: function() {
    cookies = {};
  }
}
