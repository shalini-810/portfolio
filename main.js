(function () {
  'use strict';
  const root = document.documentElement;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const ok = v => typeof v === 'string' && v.trim() !== '' && !v.trim().startsWith('[');
  const hasIO = 'IntersectionObserver' in window;

  /* mobile menu */
  const menu = $('.menu'), list = $('#nav-list');
  const setMenu = open => { list.classList.toggle('open', open); menu.setAttribute('aria-expanded', String(open)); };
  menu.addEventListener('click', () => setMenu(!list.classList.contains('open')));
  list.addEventListener('click', e => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && list.classList.contains('open')) { setMenu(false); menu.focus(); }
  });

  /* projects (drafts are skipped; empty fields are not rendered) */
  const projects = (window.PROJECTS || []).filter(p => !p.draft);
  const gh = u => u
    ? `<a class="btn small" href="${esc(u)}" target="_blank" rel="noopener"><svg class="ic" aria-hidden="true"><use href="#i-gh"/></svg>GitHub</a>`
    : '';
  const demo = u => u
    ? `<a class="btn small" href="${esc(u)}" target="_blank" rel="noopener">Live demo</a>`
    : '';
  const card = p => {
    const tags = (p.tags || []).filter(ok).map(t => `<li>${esc(t)}</li>`).join('');
    const actions = (p.repo || p.demo)
      ? `<div class="links">${gh(p.repo)}${demo(p.demo)}</div>`
      : `<div class="links"><span class="note mono">Repo &amp; demo coming soon</span></div>`;
    const shot = p.image
      ? `<div class="shot"><div class="ph"><span class="mono">${esc(p.title)}</span><span>screenshot</span></div><img src="${esc(p.image)}" alt="${esc(p.title)} screenshot" loading="lazy" onload="this.classList.add('in')"></div>`
      : `<div class="shot"><div class="ph"><span class="mono">${esc(p.title)}</span><span>screenshot coming soon</span></div></div>`;
    return `<article class="card project reveal" data-cats="${esc(p.cats.join(' '))}">
      ${shot}
      <div class="pbody">
        <p class="status">${esc(p.status)}</p>
        <h3>${esc(p.title)}</h3>
        <p class="lead">${esc(p.summary)}</p>
        ${tags && `<ul class="tags">${tags}</ul>`}
        ${actions}
      </div>
    </article>`;
  };
  const grid = $('#project-grid');
  grid.innerHTML = projects.map(card).join('');

  /* filter — one bar per grid, each scoped to its own container so the two
     groups never cross-wire. `data-cats` on the card decides what survives.
     'all' is the "no filter" state, so a bar without an All button still has a
     way back: clicking the active filter again clears it. */
  const wireFilters = (bar, target, emptyMsg) => {
    if (!bar || !target) return;
    const btns = $$('button', bar);
    const cards = $$('[data-cats]', target);
    const none = document.createElement('p');
    none.className = 'note grid-empty';
    none.textContent = emptyMsg;
    none.hidden = true;
    target.append(none);
    let active = 'all';
    btns.forEach(b => b.addEventListener('click', () => {
      const f = b.dataset.filter;
      active = active === f ? 'all' : f;
      btns.forEach(x => x.setAttribute('aria-pressed', String(x.dataset.filter === active)));
      cards.forEach(c => {
        c.hidden = active !== 'all' && !(c.dataset.cats || '').split(' ').includes(active);
      });
      none.hidden = cards.some(c => !c.hidden);
    }));
  };
  wireFilters($('#projects .filters'), grid, 'No projects in this category yet.');

  /* achievements — cards are generated from ACHIEVEMENTS (see achievements.js) */
  const items = (window.ACHIEVEMENTS || []).filter(a => !a.draft);

  const SLOTS = [['mainImage', 'Event photo'], ['certificateImage', 'Certificate'], ['achievementImage', 'Achievement photo']];

  /* photos: only the slots that already point at a file are rendered, so an
     entry never reserves an empty box. `photos: false` = none at all,
     `photos: ['mainImage', ...]` = only those. */
  const photosFor = a => {
    if (a.photos === false) return [];
    const list = Array.isArray(a.photos) ? SLOTS.filter(([key]) => a.photos.includes(key)) : SLOTS;
    return list.filter(([key]) => ok(a[key]));
  };

  /* small shared pieces, so the card and the dialog never drift apart */
  const headLine = a => [a.year, a.type].filter(ok).map(esc).join(' · ');
  const metaLine = a => [a.participants, a.duration, a.team].filter(ok).map(esc).join(' · ');
  const rowsFor = a => [['Role', a.role], ['Built', a.built]].filter(([, v]) => ok(v));
  const tagsFor = a => (a.technologies || []).filter(ok);
  const tagList = tags => tags.length ? `<ul class="tags">${tags.map(t => `<li>${esc(t)}</li>`).join('')}</ul>` : '';
  const rowList = rows => rows.map(([k, v]) => `<p class="f-row"><span class="k">${esc(k)}</span>${esc(v)}</p>`).join('');
  const result = a => a.result
    ? `<p class="result"><svg class="ic" aria-hidden="true"><use href="#i-trophy"/></svg>${esc(a.result)}</p>`
    : '';

  /* a card is a summary, not the whole story: one photo at most, and the
     write-up waits in the dialog — so one photo-heavy entry cannot stretch
     the whole grid the way a flip card did */
  const photo = (a, [key, label]) => `<figure class="ach-photo"><span class="mono">${esc(label)}</span><img src="${esc(a[key])}" alt="${esc(label)} — ${esc(a.title)}" loading="lazy" decoding="async"></figure>`;

  /* the same photo in the dialog, clickable: it hands the file to the lightbox */
  const photoBtn = (a, [key, label]) => `<button class="am-shot" type="button" data-full="${esc(a[key])}" data-cap="${esc(a.title)} — ${esc(label)}" aria-label="Open full-size image: ${esc(label.toLowerCase())}, ${esc(a.title)}">
    <span class="mono">${esc(label)}</span>
    <img src="${esc(a[key])}" alt="${esc(label)} — ${esc(a.title)}" loading="lazy" decoding="async">
    <span class="zoom" aria-hidden="true"><svg class="ic"><use href="#i-expand"/></svg></span>
  </button>`;

  const achCard = a => {
    const [shot] = photosFor(a);
    return `<article class="ach reveal" data-cats="${esc((a.cats || []).join(' '))}">
      ${headLine(a) ? `<p class="status">${headLine(a)}</p>` : ''}
      <h3>${esc(a.title)}</h3>
      ${result(a)}
      ${metaLine(a) ? `<p class="f-meta">${metaLine(a)}</p>` : ''}
      ${rowList(rowsFor(a))}
      ${tagList(tagsFor(a))}
      ${shot ? `<div class="ach-shots">${photo(a, shot)}</div>` : ''}
      <button class="btn ach-cta" type="button" data-ach-open><span>View Experience</span><svg class="ic" aria-hidden="true"><use href="#i-arrow"/></svg></button>
    </article>`;
  };

  /* a reserved entry, not a real one: a slim full-width note, no empty card */
  const soonStrip = a => `<p class="soon-strip reveal" data-cats="${esc((a.cats || []).join(' '))}">
    <span class="mono">${esc(a.type || 'Coming soon')}</span>
    <span>${esc(a.summary || 'More to come.')}</span>
  </p>`;

  const aGrid = $('#achievement-grid');
  if (aGrid) {
    /* real entries first, reserved notes last: the strips span the full row, so
       interleaving them would push the cards out of their own row */
    const real = items.filter(a => !a.soon);
    aGrid.innerHTML = real.map(achCard).join('') + items.filter(a => a.soon).map(soonStrip).join('');
    wireFilters($('#achievements .filters'), aGrid, 'Nothing here yet — check back soon.');

    /* one listener per card, matched to its entry by order — the grid is
       rendered from the same list, so the two can never fall out of step */
    $$('.ach', aGrid).forEach((card, i) => {
      $('[data-ach-open]', card).addEventListener('click', () => openAch(real[i]));
    });
  }

  /* the details dialog — the full write-up and every photo live here, so the
     cards above stay a short summary. <dialog> gives us the focus trap,
     Escape and the dim backdrop for free. */
  const am = $('#ach-modal');
  function openAch(a) {
    if (!am) return;
    const shots = photosFor(a);
    $('#am-body').innerHTML = `
      ${headLine(a) ? `<p class="status">${headLine(a)}</p>` : ''}
      <h3>${esc(a.title)}</h3>
      ${result(a)}
      ${metaLine(a) ? `<p class="f-meta">${metaLine(a)}</p>` : ''}
      ${rowList(rowsFor(a))}
      ${tagList(tagsFor(a))}
      ${shots.length ? `<div class="am-shots">${shots.map(s => photoBtn(a, s)).join('')}</div>` : ''}
      <p class="status">My experience</p>
      <p class="am-text">${esc(a.experience)}</p>`;
    am.showModal();
  }
  if (am) {
    $('#ach-close').addEventListener('click', () => am.close());
    am.addEventListener('click', e => { if (e.target === am) am.close(); });
    am.addEventListener('close', () => { $('#am-body').innerHTML = ''; });
    /* a photo in here opens the full-size lightbox on top of the dialog */
    am.addEventListener('click', e => {
      const full = e.target.closest('[data-full]');
      if (full) openLightbox(full);
    });
  }

  /* image lightbox — native <dialog> handles the focus trap, Escape and the dim backdrop */
  const PLACEHOLDER = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  const box = $('#lightbox'), boxImg = $('#lightbox-img'), boxCap = $('#lightbox-cap');
  function openLightbox(trigger) {
    boxImg.src = trigger.dataset.full;
    boxImg.alt = (trigger.dataset.cap || '').replace(' — ', ', ');
    boxCap.textContent = trigger.dataset.cap || '';
    box.showModal();
  }
  if (box) {
    $('#lightbox-close').addEventListener('click', () => box.close());
    box.addEventListener('click', e => { if (e.target === box) box.close(); });
    /* back to the 1x1 placeholder rather than a bare src="", which is not a
       valid source and some browsers resolve to the page URL */
    box.addEventListener('close', () => { boxImg.src = PLACEHOLDER; });
  }

  /* contact form — Web3Forms. The form posts to their API with no backend of
     our own; the action/method stay in index.html as a fallback that still
     works if this script never runs. Here we upgrade it to a fetch so the
     visitor sees success or failure where the form is, instead of being
     bounced to another page. */
  const form = $('#contact-form');
  if (form) {
    const btn = $('#cf-send'), note = $('#cf-status');
    const say = (msg, ok) => {
      note.textContent = msg;
      note.classList.toggle('ok', ok);
      note.classList.toggle('err', !ok);
      note.hidden = false;
    };
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const label = btn.innerHTML;
      btn.disabled = true;
      btn.textContent = 'Sending…';
      note.hidden = true;
      try {
        const res = await fetch(form.action, { method: 'POST', body: new FormData(form) });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.success) throw new Error(data.message || 'The form service rejected the message.');
        form.reset();
        say(data.message || 'Message sent — thanks for reaching out.', true);
      } catch (err) {
        say(err.message || 'Could not send the message. Please email me directly.', false);
      } finally {
        btn.disabled = false;
        btn.innerHTML = label;
      }
    });
  }

  /* scroll reveal */
  root.classList.add('js');
  const io = hasIO ? new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
  }), { threshold: 0.1 }) : null;
  $$('.reveal').forEach(el => io ? io.observe(el) : el.classList.add('in'));

  /* active nav link */
  if (hasIO) {
    const links = $$('nav a');
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      links.forEach(a => {
        const on = a.getAttribute('href') === '#' + e.target.id;
        a.classList.toggle('active', on);
        on ? a.setAttribute('aria-current', 'true') : a.removeAttribute('aria-current');
      });
    }), { rootMargin: '-40% 0px -55% 0px' });
    $$('main section[id]').forEach(s => so.observe(s));
  }

  /* Vanta.NET: libraries only load when the effect will actually run; tune so it stays behind the content.

     Vendored, not CDN. The two files are the exact builds the site used to
     pull from cdnjs/jsdelivr, byte for byte, so the effect is unchanged — but
     the background no longer depends on a third party being reachable, and it
     survives an adblocker, an offline machine or a locked-down network. Both
     are MIT; their licences sit next to them.

       three.r134.min.js        three.js r134      (npm three@0.134.0)
         sha256 74782bdbcf6518f7745ed77035968fcae95ed4ab5c9a0f90cf646a69c20785ec
       vanta.net.0.5.24.min.js  vanta.js 0.5.24    (npm vanta@0.5.24)
         sha256 76fe5829c73c27aa4f357200997c160523277c0d0bdb81f35d5cfb818cc3cb96c6

     Relative paths on purpose: the page is served from the repo root, and this
     keeps working unchanged under any sub-path a host might mount it at.
     Order is load-bearing — vanta reads window.THREE once, while it is being
     evaluated, so three has to be there first or every effect comes up empty. */
  const VENDOR = {
    three: 'assets/vendor/three.r134.min.js',
    vanta: 'assets/vendor/vanta.net.0.5.24.min.js'
  };
  /* Rejects with an error that carries the path, so a failure names the exact
     resource instead of leaving an anonymous rejected promise behind. */
  const loadScript = src => new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = src; s.async = true; s.onload = res;
    s.onerror = () => {
      const err = new Error('could not be fetched (missing from the deploy, blocked, or 404)');
      err.src = src;
      rej(err);
    };
    document.head.appendChild(s);
  });
  const startVanta = async () => {
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const weak = (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2;
    const saveData = navigator.connection && navigator.connection.saveData;
    if (reduce || weak || saveData) return;
    try {
      await loadScript(VENDOR.three);
      if (!window.THREE) { const e = new Error('loaded but did not define window.THREE'); e.src = VENDOR.three; throw e; }
      await loadScript(VENDOR.vanta);
      if (!window.VANTA || typeof window.VANTA.NET !== 'function') {
        const e = new Error('loaded but did not define window.VANTA.NET');
        e.src = VENDOR.vanta;
        throw e;
      }
      const small = innerWidth < 768;
      window.VANTA.NET({
        el: '#vanta-background',
        mouseControls: !small, touchControls: false, gyroControls: false,
        minHeight: 200, minWidth: 200, scale: 1, scaleMobile: 1,
        color: 0x71ff00, backgroundColor: 0x050002,
        points: small ? 5 : 8, spacing: small ? 22 : 20, maxDistance: small ? 22 : 26
      });
    } catch (err) {
      /* Console only, on purpose. The flat background is a perfectly good
         fallback and no visitor should ever see a broken-effect notice, but a
         silent catch makes a bad deploy or a missing vendor file impossible
         to diagnose. */
      console.error('[vanta] background disabled — ' + (err.src || VENDOR.vanta) + ' ' + err.message);
    }
  };
  window.addEventListener('load', () => (window.requestIdleCallback || setTimeout)(startVanta));
})();