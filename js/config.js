/* config.js: every tunable number lives here. */
(function (SC) {
  'use strict';

  SC.config = {
    DEFAULT_MODE: 'standard',
    START_DELAY: [900, 1800],   // ms before the first check of a run
    ZONE_MIN_START: 95,         // degrees of needle travel before a zone may begin
    ZONE_MAX_END: 345,          // degrees of needle travel by which a zone must end
    OVERRUN: 1.03,              // needle may pass 360 degrees by 3% before it counts as too slow
    STORAGE_KEY: 'skillcheck-best',

    // Put your sound files in the sounds folder and change these names to match.
    // Great and Good both play "hit".
    SOUNDS: {
      warn: 'sounds/warn.mp3',  // a check appears
      hit:  'sounds/hit.mp3',   // Great or Good
      miss: 'sounds/miss.mp3'   // Miss or too slow
    },

    MODES: {
      standard: {
        label: 'Standard',
        zone: 46,               // size of the white zone, in degrees
        great: 11,              // size of the great section at the start of the zone
        duration: 1150,         // ms for the needle to make one full turn
        gap: [1200, 2800],      // ms between a check ending and the next one appearing
        hold: 500,              // ms the needle stays frozen after a press
        gain: { great: 10, good: 6, miss: -12 }  // progress change in percent
      },

      challenge: {
        label: 'Challenge',
        zone: 24,
        great: 5,
        duration: 800,
        gap: [810, 2400],
        hold: 250,
        gain: { great: 15, good: 10, miss: -5 }
      }
    }
  };

  SC.util = {
    rand: function (a, b) { return a + Math.random() * (b - a); },
    fmt: function (ms) { return (ms / 1000).toFixed(1) + ' s'; }
  };
})(window.SkillCheck = window.SkillCheck || {});
