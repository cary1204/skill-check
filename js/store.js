/* store.js: best times per mode. Uses localStorage when the browser allows it,
   and falls back to memory for the current visit when it does not. */
(function (SC) {
  'use strict';

  var cache = null;

  function load() {
    if (cache) return cache;
    try {
      cache = JSON.parse(localStorage.getItem(SC.config.STORAGE_KEY) || '{}') || {};
    } catch (e) {
      cache = {};
    }
    return cache;
  }

  SC.store = {
    best: function (mode) {
      return load()[mode] || 0;
    },
    setBest: function (mode, ms) {
      load()[mode] = ms;
      try { localStorage.setItem(SC.config.STORAGE_KEY, JSON.stringify(cache)); } catch (e) {}
    }
  };
})(window.SkillCheck);
