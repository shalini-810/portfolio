/* The two canvas layers of the site: the drifting node network behind
   everything, and the access-control shield in the hero.

   The shield is a faceted panel — a straight-edge polygon, not a smooth
   curve — with a keyhole punched through it. Its face is a wireframe mesh
   stretched over a field of binary that scrolls upward, with a few bright
   signals running along the mesh edges and a light burning at the point.

   Both are drawn in one 360x440 space (VB_W x VB_H) and the canvas is scaled
   to whatever box CSS gives it, so the coordinates below are resolution
   independent and nothing has to be recomputed per frame.

   The keyhole stays empty: the binary is drawn inside a clip of
   shield-minus-keyhole (even-odd), so no bit is ever placed in the opening.

   The mesh is generated once, at load, and the part of it that never moves —
   the wireframe and the glowing rims — is painted into an offscreen layer
   and blitted, so a frame costs one drawImage plus the moving parts.

   Tuning: SHIELD_BOUNDARY / KEY_* are the outline, GRID/K/MAXD build the mesh,
   CELL is the size of one bit. To remove the visual, delete this file, its
   <script> tag, the two canvases and the .shield* rules in styles.css. */
(function () {
  'use strict';

  const VB_W = 360, VB_H = 440;
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* The accent is read from --g so this file and styles.css cannot drift
     apart. Falls back to the palette value if the variable is missing. */
  const ACCENT_RGB = (function () {
    const raw = (getComputedStyle(document.documentElement).getPropertyValue('--g') || '').trim();
    const hex = raw.charAt(0) === '#' ? raw.slice(1) : '71ff00';
    const full = hex.length === 3 ? hex.replace(/./g, c => c + c) : hex;
    return (full.slice(0, 6).match(/../g) || ['71', 'ff', '00'])
      .map(p => parseInt(p, 16)).join(',');
  })();
  const ACCENT = 'rgb(' + ACCENT_RGB + ')';
  const HOT = '#eaffd8';
  const FONT = '"IBM Plex Mono", ui-monospace, monospace';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');

  const bit = () => (Math.random() < 0.5 ? '0' : '1');

  /* ================= the node network behind the page ================= */
  const netCanvas = document.getElementById('net');
  const nctx = netCanvas && netCanvas.getContext('2d');
  const NODE_COUNT = 55, LINK_DIST = 120;
  let netW = 0, netH = 0, netRaf = 0;
  let nodes = [];

  function resizeNet() {
    if (!nctx) return;
    netW = netCanvas.width = Math.round(innerWidth * DPR);
    netH = netCanvas.height = Math.round(innerHeight * DPR);
    nodes = [];
    for (let i = 0; i < NODE_COUNT; i++) {
      nodes.push({
        x: Math.random() * netW, y: Math.random() * netH,
        vx: (Math.random() - 0.5) * 0.12 * DPR,
        vy: (Math.random() - 0.5) * 0.12 * DPR
      });
    }
  }

  function drawNet() {
    if (!nctx) return;
    nctx.clearRect(0, 0, netW, netH);
    nctx.lineWidth = 1;

    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < 0 || n.x > netW) n.vx *= -1;
      if (n.y < 0 || n.y > netH) n.vy *= -1;
    }

    /* every node is tested against every other one, but only the pairs close
       enough to see get a line, and the closer they are the brighter it is */
    const maxD = LINK_DIST * DPR;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        if (d >= maxD) continue;
        nctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',' + (0.06 * (1 - d / maxD)).toFixed(3) + ')';
        nctx.beginPath();
        nctx.moveTo(a.x, a.y);
        nctx.lineTo(b.x, b.y);
        nctx.stroke();
      }
    }

    nctx.fillStyle = 'rgba(' + ACCENT_RGB + ',0.25)';
    for (const n of nodes) {
      nctx.beginPath();
      nctx.arc(n.x, n.y, 1.2 * DPR, 0, Math.PI * 2);
      nctx.fill();
    }
  }

  function playNet() {
    if (netRaf || !nctx) return;
    netRaf = requestAnimationFrame(function netStep() {
      netRaf = requestAnimationFrame(netStep);
      drawNet();
    });
  }
  function pauseNet() {
    if (netRaf) { cancelAnimationFrame(netRaf); netRaf = 0; }
  }

  /* The network covers the page, so it runs whenever the page is on screen
     and stops the moment the tab is not. */
  if (nctx) {
    resizeNet();
    addEventListener('resize', resizeNet);
    document.addEventListener('visibilitychange', () => (document.hidden ? pauseNet() : playNet()));
    if (reduced.matches) drawNet(); else playNet();
  }

  /* ============================ the shield ============================ */
  function initShield() {
    const canvas = document.getElementById('shield');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const wrap = document.querySelector('.shield');

    /* Ordered boundary vertices, clockwise. Straight edges between them are
       the point of the whole thing: they are what makes the panel read as
       faceted rather than drawn. */
    const BOUNDARY = [
      [40, 95], [180, 20], [320, 95], [320, 232],
      [318, 268], [305, 305], [280, 340], [248, 370], [215, 395], [180, 416],
      [145, 395], [112, 370], [80, 340], [55, 305], [42, 268], [40, 232]
    ];
    const TIP = BOUNDARY[9];                            // the point at the base

    const KEY_CX = 180, KEY_CY = 176, KEY_R = 26;
    /* The stem starts a hair outside the circle, so the keyhole is traced as
       one outline: up the left join, over the arc, down the right. Two
       separate subpaths would leave a hairline gap between them and a sliver
       where the even-odd clip counts a point inside the hole as inside the
       panel. */
    const A_L = Math.atan2(196 - KEY_CY, 163 - KEY_CX);
    const A_R = Math.atan2(196 - KEY_CY, 197 - KEY_CX);
    const STEM = [
      [KEY_CX + Math.cos(A_L) * KEY_R, KEY_CY + Math.sin(A_L) * KEY_R],
      [KEY_CX + Math.cos(A_R) * KEY_R, KEY_CY + Math.sin(A_R) * KEY_R],
      [186, 298], [174, 298]
    ];

    /* the same outline flattened to a polygon, so the mesh can be built on it */
    const KEYHOLE = (function () {
      const pts = [];
      const segs = 12;
      for (let i = 0; i <= segs; i++) {
        const a = A_L + (A_R + Math.PI * 2 - A_L) * (i / segs);
        pts.push([KEY_CX + Math.cos(a) * KEY_R, KEY_CY + Math.sin(a) * KEY_R]);
      }
      return pts.concat(STEM.slice(2));
    })();

    function polyPath(pts) {
      const p = new Path2D();
      p.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]);
      p.closePath();
      return p;
    }

    function keyholePath() {
      const p = new Path2D();
      p.moveTo(STEM[0][0], STEM[0][1]);
      p.arc(KEY_CX, KEY_CY, KEY_R, A_L, A_R + Math.PI * 2);
      p.lineTo(STEM[1][0], STEM[1][1]);
      p.lineTo(STEM[2][0], STEM[2][1]);
      p.lineTo(STEM[3][0], STEM[3][1]);
      p.closePath();
      return p;
    }

    const shieldPath = polyPath(BOUNDARY);
    const holePath = keyholePath();
    const maskPath = new Path2D();                      // the panel minus the hole
    maskPath.addPath(shieldPath);
    maskPath.addPath(holePath);

    /* An offscreen canvas at 1:1, used only to answer "is this point on the
       panel?" while the mesh is being generated. isPointInPath needs a
       context — a Path2D cannot be asked on its own. */
    const probe = document.createElement('canvas');
    probe.width = VB_W; probe.height = VB_H;
    const pctx = probe.getContext('2d');
    const inside = (x, y) => pctx.isPointInPath(maskPath, x, y, 'evenodd');
    const insideSeg = (x1, y1, x2, y2, steps) => {
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        if (!inside(x1 + (x2 - x1) * t, y1 + (y2 - y1) * t)) return false;
      }
      return true;
    };

    /* ---- the mesh: rim points first, then a jittered grid inside them ---- */
    const meshNodes = [];                                  // {x, y, rim}
    BOUNDARY.concat(KEYHOLE).forEach(p => meshNodes.push({ x: p[0], y: p[1], rim: true }));

    const GRID = 30;
    for (let y = 60; y < VB_H - 20; y += GRID) {
      for (let x = 30; x < VB_W - 30; x += GRID) {
        const jx = x + (Math.random() - 0.5) * GRID * 0.8;
        const jy = y + (Math.random() - 0.5) * GRID * 0.8;
        if (inside(jx, jy)) meshNodes.push({ x: jx, y: jy, rim: false });
      }
    }

    const edges = [];
    const loop = pts => {
      for (let i = 0; i < pts.length; i++) edges.push([pts[i], pts[(i + 1) % pts.length]]);
    };
    /* The rims are real edges, not just a stroke: they are what the signals
       run along and what the nodes hang off. */
    loop(BOUNDARY);
    loop(KEYHOLE);

    /* Then every node links to its K nearest neighbours, as long as the line
       between them never leaves the panel — that is what stops the mesh from
       drawing straight across the keyhole. */
    const K = 3, MAXD = 75;
    for (let i = 0; i < meshNodes.length; i++) {
      const n = meshNodes[i];
      const near = [];
      for (let j = 0; j < meshNodes.length; j++) {
        if (i === j) continue;
        const m = meshNodes[j];
        const d = Math.hypot(n.x - m.x, n.y - m.y);
        if (d < MAXD) near.push([d, j]);
      }
      near.sort((a, b) => a[0] - b[0]);
      let added = 0;
      for (let k = 0; k < near.length && added < K; k++) {
        const m = meshNodes[near[k][1]];
        if (!insideSeg(n.x, n.y, m.x, m.y, 5)) continue;
        edges.push([[n.x, n.y], [m.x, m.y]]);
        added++;
      }
    }

    /* ---- the binary field ---- */
    const CELL = 13;
    const columns = [];
    const cols = Math.ceil(VB_W / CELL);
    const rows = Math.ceil(VB_H / CELL) + 2;
    for (let c = 0; c < cols; c++) {
      const glyphs = [];
      for (let r = 0; r < rows; r++) {
        glyphs.push({ ch: bit(), bright: Math.random() < 0.05, flicker: Math.random() * Math.PI * 2 });
      }
      /* Every column gets its own offset and speed. Without that the field
         scrolls as one block and the loop is obvious. */
      columns.push({ x: c * CELL + CELL / 2, offset: Math.random() * 1000, speed: 0.15 + Math.random() * 0.3, glyphs });
    }

    /* ---- signals running along the mesh ---- */
    const pickEdge = () => edges[(Math.random() * edges.length) | 0];
    const pulses = [];
    for (let i = 0; i < 6; i++) {
      pulses.push({ edge: pickEdge(), t: Math.random(), speed: 0.004 + Math.random() * 0.006 });
    }

    /* ---- the part of the shield that never moves ---- */
    const layer = document.createElement('canvas');
    const lctx = layer.getContext('2d');
    let scale = 0, raf = 0, last = 0, visible = true, t = 0;

    function paintLayer() {
      if (!scale) return;
      layer.width = Math.round(VB_W * scale);
      layer.height = Math.round(VB_H * scale);
      lctx.setTransform(scale, 0, 0, scale, 0, 0);
      lctx.clearRect(0, 0, VB_W, VB_H);

      /* the whole wireframe in one path, so it is a single stroke call */
      lctx.lineWidth = 0.8;
      lctx.strokeStyle = 'rgba(' + ACCENT_RGB + ',0.28)';
      lctx.beginPath();
      for (let i = 0; i < edges.length; i++) {
        lctx.moveTo(edges[i][0][0], edges[i][0][1]);
        lctx.lineTo(edges[i][1][0], edges[i][1][1]);
      }
      lctx.stroke();

      /* the rim twice: a wide accent glow, then a thin hot line inside it */
      lctx.lineJoin = 'round';
      lctx.shadowColor = ACCENT;
      lctx.shadowBlur = 9;
      lctx.lineWidth = 1.6;
      lctx.strokeStyle = ACCENT;
      lctx.stroke(shieldPath);
      lctx.stroke(holePath);
      lctx.shadowBlur = 2.5;
      lctx.lineWidth = 0.8;
      lctx.strokeStyle = HOT;
      lctx.stroke(shieldPath);
      lctx.stroke(holePath);
    }

    function resize() {
      if (!wrap) return;
      const rect = wrap.getBoundingClientRect();
      if (!rect.width) { scale = 0; sync(); return; }  // hidden on small screens
      scale = (rect.width * DPR) / VB_W;
      /* assigning width/height wipes the canvas, so anything that was on it
         has to be put back or the panel goes blank */
      canvas.width = Math.round(VB_W * scale);
      canvas.height = Math.round(VB_H * scale);
      paintLayer();
      if (raf) return;                                  // the loop repaints
      drawOnce();                                       // a still panel must still be there
    }

    function draw() {
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      ctx.clearRect(0, 0, VB_W, VB_H);

      /* 1. the binary, clipped to the panel minus the keyhole */
      ctx.save();
      ctx.clip(maskPath, 'evenodd');
      ctx.font = (CELL - 2) + 'px ' + FONT;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (let c = 0; c < columns.length; c++) {
        const col = columns[c];
        for (let r = 0; r < col.glyphs.length; r++) {
          const g = col.glyphs[r];
          const y = ((r * CELL + t * col.speed + col.offset) % (VB_H + CELL * 2)) - CELL;
          const flick = 0.5 + 0.5 * Math.sin(t * 0.05 + g.flicker);
          if (Math.random() < 0.0015) g.ch = bit();     // the odd bit flips
          /* Two colours, alpha carries the flicker. Building an rgba() string
             per bit means a thousand colour parses a frame, which measured
             more expensive than the glyphs themselves. */
          ctx.fillStyle = g.bright ? '#ffffff' : ACCENT;
          ctx.globalAlpha = (g.bright ? 0.45 : 0.38) * flick;
          ctx.fillText(g.ch, col.x, y);
        }
      }
      ctx.restore();

      /* 2. wireframe and rims, pre-rendered */
      ctx.drawImage(layer, 0, 0, VB_W, VB_H);

      /* 3. the nodes. Rim nodes are bigger and brighter, which is what keeps
            the outline readable underneath the field. */
      ctx.fillStyle = ACCENT;
      for (let i = 0; i < meshNodes.length; i++) {
        const n = meshNodes[i];
        const pulse = 0.6 + 0.4 * Math.sin(t * 0.04 + n.x * 0.05 + n.y * 0.03);
        ctx.globalAlpha = (n.rim ? 0.85 : 0.5) * pulse;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.rim ? 1.9 : 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      /* 4. signals, hopping onto a new edge each time they arrive */
      ctx.shadowColor = HOT;
      ctx.shadowBlur = 8;
      ctx.fillStyle = HOT;
      for (let i = 0; i < pulses.length; i++) {
        const p = pulses[i];
        p.t += p.speed;
        if (p.t > 1) { p.t = 0; p.edge = pickEdge(); }
        const a = p.edge[0], b = p.edge[1];
        ctx.beginPath();
        ctx.arc(a[0] + (b[0] - a[0]) * p.t, a[1] + (b[1] - a[1]) * p.t, 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      /* 5. the light at the point */
      const tip = 0.6 + 0.4 * Math.sin(t * 0.07);
      ctx.shadowColor = HOT;
      ctx.shadowBlur = 16 * tip;
      ctx.beginPath();
      ctx.arc(TIP[0], TIP[1], 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    function step(now) {
      raf = requestAnimationFrame(step);
      /* t counts frames, not seconds, so every speed above is tuned against
         a 60Hz clock; scaling by dt keeps that true on a 120Hz screen. */
      t += last ? Math.min((now - last) / 1000, 0.1) * 60 : 0;
      last = now;
      draw();
    }
    function play() { if (!raf && scale) { last = 0; raf = requestAnimationFrame(step); } }
    function pause() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

    function sync() {
      if (document.hidden || !visible || reduced.matches) pause();
      else play();
    }

    /* Reduced motion gets one frame and stops. The panel is the content; the
       movement is not, so the panel should still be there without it. */
    function drawOnce() { t = 90; draw(); }

    resize();
    if ('ResizeObserver' in window && wrap) new ResizeObserver(resize).observe(wrap);
    else addEventListener('resize', resize);
    document.addEventListener('visibilitychange', sync);

    /* The shield sits in the hero, which is one screen tall, so scrolling past
       it should not cost a frame. */
    if ('IntersectionObserver' in window && wrap) {
      new IntersectionObserver(es => {
        visible = es[0].isIntersecting;
        sync();
      }, { threshold: 0 }).observe(wrap);
    }

    /* Reduced motion never starts the loop: resize() has already put a single
       frame on the canvas and the panel stays as it is. */
    if (!reduced.matches) play();
  }

  initShield();
})();
