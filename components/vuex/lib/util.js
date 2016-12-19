'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createAction = createAction;
exports.mergeObjects = mergeObjects;
exports.deepClone = deepClone;

function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

/**
 * Create a actual callable action function.
 *
 * @param {String|Function} action
 * @param {Vuex} store
 * @return {Function} [description]
 */

function createAction(action, store) {
  if (typeof action === 'string') {
    // simple action string shorthand
    return function () {
      for (var _len = arguments.length, payload = Array(_len), _key = 0; _key < _len; _key++) {
        payload[_key] = arguments[_key];
      }

      return store.dispatch.apply(store, [action].concat(payload));
    };
  } else if (typeof action === 'function') {
    // normal action
    return function () {
      for (var _len2 = arguments.length, payload = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        payload[_key2] = arguments[_key2];
      }

      return action.apply(undefined, [store].concat(payload));
    };
  }
}

/**
 * Merge an array of objects into one.
 *
 * @param {Array<Object>} arr
 * @param {Boolean} allowDuplicate
 * @return {Object}
 */

function mergeObjects(arr, allowDuplicate) {
  return arr.reduce(function (prev, obj) {
    Object.keys(obj).forEach(function (key) {
      var existing = prev[key];
      if (existing) {
        // allow multiple mutation objects to contain duplicate
        // handlers for the same mutation type
        if (allowDuplicate) {
          if (Array.isArray(existing)) {
            existing.push(obj[key]);
          } else {
            prev[key] = [prev[key], obj[key]];
          }
        } else {
          console.warn('[vuex] Duplicate action: ' + key);
        }
      } else {
        prev[key] = obj[key];
      }
    });
    return prev;
  }, {});
}

/**
 * Deep clone an object. Faster than JSON.parse(JSON.stringify()).
 *
 * @param {*} obj
 * @return {*}
 */

function deepClone(obj) {
  if (Array.isArray(obj)) {
    return obj.map(deepClone);
  } else if (obj && (typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) === 'object') {
    var cloned = {};
    var keys = Object.keys(obj);
    for (var i = 0, l = keys.length; i < l; i++) {
      var key = keys[i];
      cloned[key] = deepClone(obj[key]);
    }
    return cloned;
  } else {
    return obj;
  }
}