/* renderer.js: draws a plain ring, the zone, the needle and the progress number. */
(function (SC) {
  'use strict';

  SC.createRenderer = function (canvas) {
    var ctx = canvas.getContext('2d');
    var size = 400;

    function fit() {
      var rect = canvas.getBoundingClientRect();
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      size = rect.width || 400;
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    // Needle travel is measured in degrees clockwise from twelve o'clock.
    function angle(travel) { return -Math.PI / 2 + travel * Math.PI / 180; }

    function arc(cx, cy, R, from, to) {
      ctx.beginPath();
      ctx.arc(cx, cy, R, angle(from), angle(to));
      ctx.stroke();
    }

    function draw(S, now) {
      var cx = size / 2, cy = size / 2, R = size * 0.38, lw = size * 0.07;
      var travel = 0;
      ctx.clearRect(0, 0, size, size);

      // ring
      ctx.strokeStyle = '#333';
      ctx.lineWidth = lw;
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.stroke();

      // zone: grey, with the great section in white at its start
      if (S.phase === 'check' || S.phase === 'result') {
        var c = S.check;
        travel = S.phase === 'result' ? S.result.travel : Math.min((now - c.start) / c.duration, 1) * 360;
        ctx.strokeStyle = '#888';
        ctx.lineWidth = lw;
        arc(cx, cy, R, c.zoneStart, c.zoneStart + c.zoneSize);
        ctx.strokeStyle = '#fff';
        arc(cx, cy, R, c.zoneStart, c.zoneStart + c.greatSize);
      }

      // needle
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle(travel));
      ctx.strokeStyle = '#f00';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(R - lw * 0.7, 0);
      ctx.lineTo(R + lw * 0.7, 0);
      ctx.stroke();
      ctx.restore();

      // progress number
      ctx.fillStyle = '#fff';
      ctx.font = Math.round(size * 0.12) + 'px Arial, Helvetica, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(Math.round(S.prog) + '%', cx, cy);
    }

    return { fit: fit, draw: draw };
  };
})(window.SkillCheck);
