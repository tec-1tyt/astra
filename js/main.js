/* ═══════════════════════════════════════════════════════════
   AVIS METAL — interakce
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── NASTAVENÍ ───────────────────────────────────────────
     FORM_ENDPOINT: URL služby, která přijme poptávku
     (např. Formspree: "https://formspree.io/f/xxxxxxx").
     Když zůstane prázdné, formulář otevře e-mailového klienta
     s předvyplněnou zprávou na FORM_EMAIL.                    */
  var FORM_ENDPOINT = '';
  var FORM_EMAIL = 'info@avismetal.cz';
  /* ──────────────────────────────────────────────────────── */

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─── rok v patičce ─── */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ─── spuštění hero animace ─── */
  var hero = $('#hero');
  if (hero) requestAnimationFrame(function () { hero.classList.add('go'); });

  /* ─── navigace: stav při scrollu ─── */
  var nav = $('#nav');
  var onScroll = function () {
    nav.classList.toggle('nav--solid', window.scrollY > 40);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ─── mobilní menu ─── */
  var burger = $('#burger');
  var navLinks = $('#navLinks');
  var closeMenu = function () {
    navLinks.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('lock');
  };
  burger.addEventListener('click', function () {
    var open = navLinks.classList.toggle('open');
    burger.setAttribute('aria-expanded', String(open));
    document.body.classList.toggle('lock', open);
  });
  $$('#navLinks a').forEach(function (a) { a.addEventListener('click', closeMenu); });

  /* ─── odhalování při scrollu (+ morf obrázků) ─── */
  var targets = $$('.reveal, [data-morph]');
  if ('IntersectionObserver' in window && !calm) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.12 });

    targets.forEach(function (el, i) {
      // jemné prostřídání uvnitř jedné mřížky
      var sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
      el.style.transitionDelay = Math.min(sib, 5) * 70 + 'ms';
      io.observe(el);
    });
  } else {
    targets.forEach(function (el) { el.classList.add('in'); });
  }

  /* ─── počítadla ─── */
  var counters = $$('[data-count]');
  if (counters.length && 'IntersectionObserver' in window && !calm) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        var el = e.target;
        cio.unobserve(el);
        var to = parseInt(el.dataset.count, 10) || 0;
        var suf = el.dataset.suffix || '';
        var t0 = performance.now();
        var step = function (t) {
          var p = Math.min((t - t0) / 1400, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(to * eased) + (p === 1 ? suf : '');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.dataset.count + (c.dataset.suffix || ''); });
  }

  /* ─── parallax hero ─── */
  var media = $('.hero__media');
  if (media && !calm) {
    var raf = false;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = true;
      requestAnimationFrame(function () {
        var y = Math.min(window.scrollY, window.innerHeight);
        media.style.transform = 'translate3d(0,' + y * 0.22 + 'px,0)';
        raf = false;
      });
    }, { passive: true });
  }

  /* ─── morfující kurzor ─── */
  var cur = $('#cursor');
  var fine = window.matchMedia('(hover:hover) and (pointer:fine)').matches;
  if (cur && fine && !calm) {
    var cx = 0, cy = 0, tx = 0, ty = 0, label = $('.cursor__label', cur);

    document.addEventListener('mousemove', function (e) {
      tx = e.clientX; ty = e.clientY;
      cur.classList.add('on');
    }, { passive: true });
    document.addEventListener('mouseleave', function () { cur.classList.remove('on'); });

    (function loop() {
      cx += (tx - cx) * 0.16;
      cy += (ty - cy) * 0.16;
      cur.style.transform = 'translate3d(' + cx + 'px,' + cy + 'px,0)';
      requestAnimationFrame(loop);
    })();

    $$('.gal__i').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('big'); label.textContent = 'zvětšit'; });
      el.addEventListener('mouseleave', function () { cur.classList.remove('big'); label.textContent = ''; });
    });
    $$('a, button, .chips li').forEach(function (el) {
      el.addEventListener('mouseenter', function () { cur.classList.add('big'); label.textContent = ''; });
      el.addEventListener('mouseleave', function () { cur.classList.remove('big'); });
    });
  }

  /* ─── lightbox galerie ─── */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var shots = $$('.gal__i');
  var idx = 0;

  var show = function (i) {
    idx = (i + shots.length) % shots.length;
    var fig = shots[idx];
    var img = $('img', fig);
    lbImg.src = img.src;
    lbImg.alt = img.alt;
    lbCap.textContent = fig.dataset.cap || img.alt;
  };
  var openLb = function (i) {
    show(i);
    lb.hidden = false;
    document.body.classList.add('lock');
    requestAnimationFrame(function () { lb.classList.add('on'); });
    $('#lbX').focus();
  };
  var closeLb = function () {
    lb.classList.remove('on');
    document.body.classList.remove('lock');
    setTimeout(function () { lb.hidden = true; }, 400);
  };

  shots.forEach(function (fig, i) {
    fig.style.cursor = 'pointer';
    fig.setAttribute('tabindex', '0');
    fig.setAttribute('role', 'button');
    fig.addEventListener('click', function () { openLb(i); });
    fig.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLb(i); }
    });
  });

  $('#lbX').addEventListener('click', closeLb);
  $('#lbP').addEventListener('click', function () { show(idx - 1); });
  $('#lbN').addEventListener('click', function () { show(idx + 1); });
  lb.addEventListener('click', function (e) { if (e.target === lb) closeLb(); });
  document.addEventListener('keydown', function (e) {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') show(idx - 1);
    if (e.key === 'ArrowRight') show(idx + 1);
  });

  /* ─── formulář poptávky ─── */
  var form = $('#form'), msg = $('#formMsg');

  var fieldOf = function (input) { return input.closest('.f'); };
  var setErr = function (input, text) {
    var f = fieldOf(input);
    f.classList.toggle('bad', !!text);
    $('.f__err', f).textContent = text || '';
  };

  var check = function (input) {
    var v = (input.value || '').trim();
    if (input.name === 'jmeno') {
      if (v.length < 2) return 'Vyplňte prosím jméno.';
    }
    if (input.name === 'telefon') {
      if (v.replace(/[^\d]/g, '').length < 9) return 'Zadejte platné telefonní číslo.';
    }
    if (input.name === 'email' && v) {
      if (!/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return 'Zkontrolujte tvar e-mailu.';
    }
    if (input.name === 'gdpr' && !input.checked) {
      return 'Bez souhlasu nemůžeme poptávku zpracovat.';
    }
    return '';
  };

  $$('input, textarea', form).forEach(function (input) {
    input.addEventListener('blur', function () { setErr(input, check(input)); });
    input.addEventListener('input', function () { if (fieldOf(input).classList.contains('bad')) setErr(input, check(input)); });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    msg.classList.remove('ok');

    var required = $$('[required]', form);
    var bad = null;
    required.forEach(function (input) {
      var err = check(input);
      setErr(input, err);
      if (err && !bad) bad = input;
    });
    if (bad) { bad.focus(); msg.textContent = 'Zkontrolujte prosím označená pole.'; return; }

    var data = new FormData(form);
    var btn = $('button[type=submit]', form);
    btn.disabled = true;

    var done = function (text, ok) {
      btn.disabled = false;
      msg.textContent = text;
      msg.classList.toggle('ok', !!ok);
    };

    if (FORM_ENDPOINT) {
      fetch(FORM_ENDPOINT, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
        .then(function (r) {
          if (!r.ok) throw new Error(r.status);
          form.reset();
          done('Děkujeme. Ozveme se do 24 hodin.', true);
        })
        .catch(function () {
          done('Odeslání se nepodařilo. Zavolejte nám prosím přímo.');
        });
    } else {
      // fallback bez serveru — otevře e-mailového klienta
      var body = [
        'Jméno: ' + data.get('jmeno'),
        'Telefon: ' + data.get('telefon'),
        'E-mail: ' + (data.get('email') || '—'),
        'Služba: ' + (data.get('sluzba') || '—'),
        '',
        data.get('zprava') || ''
      ].join('\n');
      window.location.href = 'mailto:' + FORM_EMAIL +
        '?subject=' + encodeURIComponent('Poptávka z webu — ' + data.get('jmeno')) +
        '&body=' + encodeURIComponent(body);
      done('Otevřeli jsme váš e-mailový klient s předvyplněnou poptávkou.', true);
    }
  });

})();
