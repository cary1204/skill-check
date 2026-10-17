/* audio.js: plays the sound files listed in config.js. */
(function (SC) {
  'use strict';

  var clips = {};
  var muted = false;
  var volume = 1;   // 0 to 1

  Object.keys(SC.config.SOUNDS).forEach(function (name) {
    var src = SC.config.SOUNDS[name];
    var clip = new Audio(src);
    clip.preload = 'auto';
    clip.addEventListener('error', function () { console.warn('Sound file not found: ' + src); });
    clips[name] = clip;
  });

  SC.audio = {
    play: function (name) {
      if (muted || !clips[name]) return;
      var copy = clips[name].cloneNode();   // a copy lets quick checks overlap
      copy.volume = volume;                 // cloning does not carry the volume over
      var attempt = copy.play();
      if (attempt && attempt.catch) attempt.catch(function (e) { console.warn('Could not play ' + name + ': ' + e.message); });
    },
    toggleMute: function () { muted = !muted; return muted; },
    setVolume: function (v) { volume = Math.max(0, Math.min(1, v)); }
  };
})(window.SkillCheck);
