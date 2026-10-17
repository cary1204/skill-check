/* ui.js: stats, callout, buttons and input. */
(function (SC) {
  'use strict';

  var U = SC.util;

  function $(id) { return document.getElementById(id); }

  SC.initUI = function (game) {
    var callout = $('callout');
    var startBtn = $('start');
    var done = $('done');
    var lastTime = '';

    function renderStats() {
      var S = game.getState();
      var total = S.hits + S.misses;
      $('stHits').textContent = S.hits;
      $('stGreat').textContent = S.greats;
      $('stMiss').textContent = S.misses;
      $('stStreak').textContent = S.streak;
      $('stBestStreak').textContent = S.bestStreak;
      $('stAcc').textContent = total ? Math.round(S.hits / total * 100) + '%' : '—';
      $('bar').value = S.prog;
    }

    function renderTime() {
      var S = game.getState();
      var text = U.fmt(S.phase === 'done' ? S.finalTime : S.elapsed);
      if (text !== lastTime) {
        $('stTime').textContent = text;
        lastTime = text;
      }
    }

    function renderBest() {
      var best = SC.store.best(game.getModeKey());
      $('stBest').textContent = best ? U.fmt(best) : '—';
    }

    function showCallout(text, kind) {
      callout.textContent = text;
      callout.className = 'callout show ' + kind;
    }
    function hideCallout() { callout.className = 'callout'; }

    /* ---------- game events ---------- */
    game.on('change', function () { renderStats(); renderBest(); });

    // Back to the start screen (after Stop or a mode change).
    game.on('reset', function () {
      done.hidden = true;
      startBtn.textContent = 'Start';
      hideCallout();
      lastTime = '';
      renderTime();
    });

    game.on('start', function () {
      done.hidden = true;
      startBtn.textContent = 'Stop';
      if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
      hideCallout();
      lastTime = '';
      renderTime();
    });

    game.on('spawn', function () {
      hideCallout();
      SC.audio.play('warn');
    });

    // Great and Good share one sound.
    game.on('result', function (r) {
      showCallout(r.text, r.kind);
      SC.audio.play(r.kind === 'miss' ? 'miss' : 'hit');
    });

    game.on('finish', function (f) {
      startBtn.textContent = 'Start';
      done.textContent = 'Done in ' + U.fmt(f.time) + '. Best: ' + U.fmt(f.best) + '.';
      done.hidden = false;
      hideCallout();
      renderTime();
    });

    /* ---------- input ---------- */
    function isSpace(e) { return e.code === 'Space' || e.key === ' '; }

    document.addEventListener('keydown', function (e) {
      if (!isSpace(e) || !game.isRunning()) return;
      e.preventDefault();
      if (!e.repeat) game.press(performance.now());
    });
    document.addEventListener('keyup', function (e) {
      if (isSpace(e) && game.isRunning()) e.preventDefault();
    });

    $('ringWrap').addEventListener('pointerdown', function () {
      game.press(performance.now());
    });

    // One button: Start begins a run, Stop ends it.
    startBtn.addEventListener('click', function () {
      if (game.isRunning()) game.stop();
      else game.start();
    });

    $('modes').addEventListener('change', function (e) {
      game.setMode(e.target.value);
    });

    var muteBtn = $('mute');
    muteBtn.addEventListener('click', function () {
      var muted = SC.audio.toggleMute();
      muteBtn.textContent = muted ? 'Sound: off' : 'Sound: on';
      muteBtn.setAttribute('aria-pressed', muted ? 'false' : 'true');
    });

    $('volume').addEventListener('input', function (e) {
      SC.audio.setVolume(e.target.value / 100);
    });

    /* ---------- first paint ---------- */
    renderStats();
    renderBest();
    renderTime();

    return { renderTime: renderTime };
  };
})(window.SkillCheck);
