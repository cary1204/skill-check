/* main.js: wires the modules together and runs the frame loop. */
(function (SC) {
  'use strict';

  var canvas = document.getElementById('ring');
  var game = SC.createGame();
  var renderer = SC.createRenderer(canvas);
  var ui = SC.initUI(game);

  if (window.ResizeObserver) new ResizeObserver(renderer.fit).observe(canvas);
  window.addEventListener('resize', renderer.fit);
  renderer.fit();

  document.addEventListener('visibilitychange', function () {
    if (document.hidden) game.pause(performance.now());
    else game.resume(performance.now());
  });

  function frame(now) {
    game.update(now);
    ui.renderTime();
    renderer.draw(game.getState(), now);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})(window.SkillCheck);
