/* game.js: the rules. No DOM and no drawing in here.
   Phases: idle -> waiting -> check -> result -> waiting ... -> done.
   The UI listens for events: reset, start, spawn, result, finish, change. */
(function (SC) {
  'use strict';

  var CFG = SC.config;
  var U = SC.util;

  function fresh(phase) {
    return {
      phase: phase,
      prog: 0, hits: 0, greats: 0, misses: 0, streak: 0, bestStreak: 0,
      log: [],
      runStart: 0, nextAt: 0, elapsed: 0, finalTime: 0, hiddenAt: 0,
      check: null,    // { start, duration, zoneStart, zoneSize, greatSize }
      result: null    // { kind, at, travel }
    };
  }

  SC.createGame = function () {
    var modeKey = CFG.DEFAULT_MODE;
    var S = fresh('idle');
    var handlers = {};

    function mode() { return CFG.MODES[modeKey]; }
    function emit(name, data) { if (handlers[name]) handlers[name](data); }
    function isRunning() { return S.phase === 'waiting' || S.phase === 'check' || S.phase === 'result'; }

    function reset() {
      S = fresh('idle');
      emit('reset');
      emit('change');
    }

    // Ends the run and goes back to the start screen.
    function stop() {
      if (isRunning()) reset();
    }

    function setMode(key) {
      if (!CFG.MODES[key]) return;
      modeKey = key;
      reset();
    }

    function start() {
      var now = performance.now();
      S = fresh('waiting');
      S.runStart = now;
      S.nextAt = now + U.rand(CFG.START_DELAY[0], CFG.START_DELAY[1]);
      emit('start');
      emit('change');
    }

    function spawn(now) {
      var m = mode();
      S.check = {
        start: now,
        duration: m.duration,
        zoneStart: U.rand(CFG.ZONE_MIN_START, CFG.ZONE_MAX_END - m.zone),
        zoneSize: m.zone,
        greatSize: m.great
      };
      S.phase = 'check';
      emit('spawn');
    }

    function resolve(kind, now, text, travel) {
      S.result = { kind: kind, at: now, travel: travel };
      S.phase = 'result';

      if (kind === 'miss') {
        S.misses++;
        S.streak = 0;
      } else {
        S.hits++;
        S.streak++;
        if (kind === 'great') S.greats++;
      }
      if (S.streak > S.bestStreak) S.bestStreak = S.streak;

      S.prog = Math.max(0, Math.min(100, S.prog + mode().gain[kind]));
      S.log.push(kind);
      if (S.log.length > 10) S.log.shift();
      if (S.prog >= 100) S.finalTime = now - S.runStart;

      emit('result', { kind: kind, text: text });
      emit('change');
    }

    // Called when the player presses Space or taps the ring.
    function press(now) {
      if (S.phase !== 'check') return;
      var c = S.check;
      var travel = Math.min((now - c.start) / c.duration, 1) * 360;
      var offset = travel - c.zoneStart;
      if (offset >= 0 && offset <= c.greatSize) resolve('great', now, 'Great', travel);
      else if (offset >= 0 && offset <= c.zoneSize) resolve('good', now, 'Good', travel);
      else resolve('miss', now, 'Miss', travel);
    }

    function finish() {
      var previous = SC.store.best(modeKey);
      var isBest = !previous || S.finalTime < previous;
      if (isBest) SC.store.setBest(modeKey, S.finalTime);

      S.phase = 'done';
      S.check = null;
      var total = S.hits + S.misses;
      emit('finish', {
        time: S.finalTime,
        accuracy: Math.round(S.hits / total * 100),
        greats: S.greats,
        misses: S.misses,
        isBest: isBest,
        best: SC.store.best(modeKey)
      });
      emit('change');
    }

    // Called every animation frame with a performance.now() timestamp.
    function update(now) {
      if (S.phase === 'waiting') {
        S.elapsed = now - S.runStart;
        if (now >= S.nextAt) spawn(now);
      } else if (S.phase === 'check') {
        S.elapsed = now - S.runStart;
        if ((now - S.check.start) / S.check.duration >= CFG.OVERRUN) resolve('miss', now, 'Too slow', 360);
      } else if (S.phase === 'result') {
        if (S.prog < 100) S.elapsed = now - S.runStart;
        if (now - S.result.at >= mode().hold) {
          if (S.prog >= 100) {
            finish();
          } else {
            S.phase = 'waiting';
            S.check = null;
            S.nextAt = now + U.rand(mode().gap[0], mode().gap[1]);
          }
        }
      }
    }

    // When the tab is hidden the clock keeps running, so shift every timestamp by the time spent away.
    function pause(now) { S.hiddenAt = now; }
    function resume(now) {
      if (!S.hiddenAt) return;
      var away = now - S.hiddenAt;
      S.hiddenAt = 0;
      if (!isRunning()) return;
      S.runStart += away;
      S.nextAt += away;
      if (S.check) S.check.start += away;
      if (S.result) S.result.at += away;
    }

    return {
      on: function (name, fn) { handlers[name] = fn; },
      getState: function () { return S; },
      getMode: mode,
      getModeKey: function () { return modeKey; },
      isRunning: isRunning,
      setMode: setMode,
      start: start,
      stop: stop,
      press: press,
      update: update,
      pause: pause,
      resume: resume
    };
  };
})(window.SkillCheck);
