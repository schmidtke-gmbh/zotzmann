/* Zahnarzt Zotzmann – Landingpage JS
   - Reveal-Animationen (IntersectionObserver)
   - Titan → Keramik Scrollytelling (Phase-Wechsel + Fortschritt)
   - Schritte-Linienanimation
   - YouTube-Facade (lädt Video erst bei Klick)
   - Sticky Mobile CTA
*/
(function () {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Reveal ---------- */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('is-visible'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.1 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Titan vs. Keramik ---------- */
  const compare = document.querySelector('.compare');
  if (compare) {
    const items = compare.querySelectorAll('.point, .verdict');
    const pillText = compare.querySelector('.pill-text');
    const progress = compare.querySelector('.stage-progress i');
    const stream = compare.querySelector('.compare__stream');
    const visual = compare.querySelector('.compare__visual');

    const setPhase = (phase) => {
      if (compare.dataset.phase === phase) return;
      compare.dataset.phase = phase;
      if (pillText) pillText.textContent = phase === 'keramik' ? 'Keramik' : 'Titan';
    };

    // Karten einblenden + Phase abhängig von der Karte, die gerade unter dem Sticky-Visual liegt
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add('is-visible');
      });
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.15 });
    items.forEach((el) => io2.observe(el));

    // Phase & Fortschritt über Scrollposition (robust, auch beim Hochscrollen)
    let ticking = false;
    const update = () => {
      ticking = false;
      const rect = stream.getBoundingClientRect();
      const anchor = (visual ? visual.getBoundingClientRect().bottom : 0) + 40; // Linie knapp unter dem Sticky-Visual
      const total = rect.height;
      const passed = Math.min(Math.max(anchor - rect.top, 0), total);
      if (progress) progress.style.width = (passed / total * 100).toFixed(1) + '%';

      // Welche Karte ist gerade an der Ankerlinie?
      let phase = 'titan';
      compare.querySelectorAll('[data-phase]').forEach((el) => {
        if (el === compare) return;
        if (el.getBoundingClientRect().top <= anchor) phase = el.dataset.phase;
      });
      setPhase(phase);
    };
    const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    update();
    if (reduce) items.forEach((el) => el.classList.add('is-visible'));
  }

  /* ---------- Schritte: Linie wächst beim Scrollen, Nodes leuchten auf ---------- */
  const steps = document.getElementById('steps');
  if (steps) {
    const line = steps.querySelector('.steps__line i');
    const stepEls = steps.querySelectorAll('.step');
    let t2 = false;
    const upd = () => {
      t2 = false;
      const r = steps.getBoundingClientRect();
      const trigger = window.innerHeight * 0.6;
      const h = Math.min(Math.max(trigger - r.top, 0), r.height);
      if (line) line.style.height = h + 'px';
      stepEls.forEach((s) => {
        const sr = s.getBoundingClientRect();
        s.classList.toggle('is-active', sr.top + 28 <= trigger);
      });
    };
    const on2 = () => { if (!t2) { t2 = true; requestAnimationFrame(upd); } };
    window.addEventListener('scroll', on2, { passive: true });
    window.addEventListener('resize', on2);
    upd();
  }

  /* ---------- YouTube Facade ---------- */
  document.querySelectorAll('.yt[data-yt]').forEach((box) => {
    const play = () => {
      if (box.querySelector('iframe')) return;
      const id = box.dataset.yt;
      const f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0&modestbranding=1';
      f.title = box.getAttribute('aria-label') || 'YouTube-Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen';
      f.setAttribute('allowfullscreen', '');
      box.innerHTML = '';
      box.appendChild(f);
      box.style.cursor = 'default';
    };
    box.addEventListener('click', play);
    box.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); play(); } });
  });

  /* ---------- Parallax: Kreislinien bewegen und drehen sich beim Scrollen ---------- */
  const ringEls = document.querySelectorAll('.rings');
  if (ringEls.length && !reduce) {
    let t3 = false;
    const upd3 = () => {
      t3 = false;
      ringEls.forEach((r) => {
        const rect = r.parentElement.getBoundingClientRect();
        const p = (window.innerHeight - rect.top) / (window.innerHeight + rect.height); // 0..1 während das Element durchscrollt
        if (p < -0.2 || p > 1.2) return;
        r.style.setProperty('--ry', ((p - 0.5) * -90).toFixed(1) + 'px');
        r.style.setProperty('--rr', (p * 40).toFixed(1) + 'deg');
      });
    };
    const on3 = () => { if (!t3) { t3 = true; requestAnimationFrame(upd3); } };
    window.addEventListener('scroll', on3, { passive: true });
    upd3();
  }

  /* ---------- Widont: verhindert einzelne Wörter in der letzten Zeile ---------- */
  document.querySelectorAll('h1, h2, h3, h4, p, figcaption, .stage-text span').forEach((el) => {
    if (el.closest('.compare-table, .footer__bottom, .hours')) return;
    if (el.textContent.length > 420) return;
    if (el.clientWidth && el.clientWidth < 210) return; // in schmalen Karten nicht binden
    const last = el.lastChild;
    if (!last || last.nodeType !== 3) return;
    const txt = last.nodeValue;
    const m = txt.match(/^([\s\S]*\S)\s+(\S+)\s*$/);
    if (!m) return;
    const tail = m[2];
    // Nur binden, wenn die letzten beiden Wörter zusammen nicht zu lang sind (sonst Overflow auf dem Handy)
    if (!/\s/.test(m[1].trim())) return; // nur zwei Wörter insgesamt -> Binden bringt nichts
    const prevWord = (m[1].match(/(\S+)$/) || [''])[0];
    if (tail.length + prevWord.length > 26) return;
    last.nodeValue = m[1].replace(/(\S+)$/, '$1\u00A0' + tail);
  });

  /* ---------- Zahlen zählen beim Einscrollen hoch ---------- */
  const counters = document.querySelectorAll('.stat b[data-count], .card__big [data-count]');
  if (counters.length) {
    const run = (el) => {
      const target = parseInt(el.dataset.count, 10);
      const suffix = el.dataset.suffix || '';
      if (reduce) { el.textContent = target + suffix; return; }
      const dur = 1400, t0 = performance.now();
      const tick = (now) => {
        const p = Math.min((now - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      el.textContent = '0' + suffix;
      requestAnimationFrame(tick);
    };
    const io4 = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (!e.isIntersecting) return;
        const box = e.target.closest('.stat');
        if (box) box.classList.add('is-counted');
        run(e.target);
        io4.unobserve(e.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io4.observe(el));
  }

  /* ---------- Sticky CTA (mobil) erscheint nach dem Hero ---------- */
  const sticky = document.getElementById('stickyCta');
  const hero = document.querySelector('.hero');
  if (sticky && hero) {
    const io3 = new IntersectionObserver((entries) => {
      sticky.classList.toggle('is-visible', !entries[0].isIntersecting);
    }, { threshold: 0.05 });
    io3.observe(hero);
  }

  /* ---------- Kleines Tracking-Hook (GTM dataLayer), falls aktiv ---------- */
  document.querySelectorAll('a[href="termin.html"]').forEach((a) => {
    a.addEventListener('click', () => {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'cta_click', cta_text: a.textContent.trim().slice(0, 60) });
    });
  });
})();
