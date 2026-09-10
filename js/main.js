/* ═══════════════════════════════════════════════════════════
   AVIS METAL — interakce
   ═══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ─── NASTAVENÍ ───────────────────────────────────────────
     FORM_ENDPOINT: URL služby, která přijme poptávku
     (např. Formspree: "https://formspree.io/f/xxxxxxx").
     Když zůstane prázdné, formulář otevře e-mailového klienta
     s předvyplněnou zprávou na FORM_EMAIL.
     DEFAULT_LANG: 'cs' | 'uk' | 'ru' | 'de'                   */
  var FORM_ENDPOINT = '';
  var FORM_EMAIL = 'info@avismetal.cz';
  var DEFAULT_LANG = 'cs';
  /* ──────────────────────────────────────────────────────── */

  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ═══════════ JAZYKY ═══════════ */
  var DICT = window.I18N || {};
  var lang = DEFAULT_LANG;
  try {
    var saved = localStorage.getItem('avis.lang');
    if (saved && DICT[saved]) lang = saved;
  } catch (e) { /* privátní režim */ }

  var t = function (key) {
    var d = DICT[lang] || DICT[DEFAULT_LANG] || {};
    if (d[key] != null) return d[key];
    var f = DICT[DEFAULT_LANG] || {};
    return f[key] != null ? f[key] : '';
  };

  var applyLang = function (l) {
    if (!DICT[l]) return;
    lang = l;
    document.documentElement.lang = l;

    $$('[data-i18n]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n'));
      if (v === '') return;
      el.textContent = v;
      // morfující odkazy berou viditelný text z atributu data-t
      if (el.hasAttribute('data-t')) el.setAttribute('data-t', v);
    });
    $$('[data-i18n-html]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-html'));
      if (v !== '') el.innerHTML = v;
    });
    $$('[data-i18n-ph]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-ph'));
      if (v !== '') el.setAttribute('placeholder', v);
    });
    $$('[data-i18n-cap]').forEach(function (el) {
      var v = t(el.getAttribute('data-i18n-cap'));
      if (v !== '') el.setAttribute('data-cap', v);
    });

    document.title = t('meta.title');
    var md = $('#metaDesc');
    if (md) md.setAttribute('content', t('meta.desc'));

    $$('#lang button').forEach(function (b) {
      b.setAttribute('aria-current', String(b.getAttribute('data-lang') === l));
    });

    try { localStorage.setItem('avis.lang', l); } catch (e) { /* ignore */ }
  };

  $$('#lang button').forEach(function (b) {
    b.addEventListener('click', function () { applyLang(b.getAttribute('data-lang')); });
  });
  applyLang(lang);

  /* ─── rok v patičce ─── */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ─── spuštění hero animace ─── */
  var hero = $('#hero');
  if (hero) requestAnimationFrame(function () { hero.classList.add('go'); });

  /* ─── navigace: stav při scrollu ─── */
  var nav = $('#nav');
  var onScroll = function () { nav.classList.toggle('nav--solid', window.scrollY > 40); };
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

    targets.forEach(function (el) {
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
        var to = parseInt(el.getAttribute('data-count'), 10) || 0;
        var suf = el.getAttribute('data-suffix') || '';
        var t0 = performance.now();
        var step = function (now) {
          var p = Math.min((now - t0) / 1400, 1);
          var eased = 1 - Math.pow(1 - p, 4);
          el.textContent = Math.round(to * eased) + (p === 1 ? suf : '');
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    counters.forEach(function (c) { cio.observe(c); });
  } else {
    counters.forEach(function (c) {
      c.textContent = c.getAttribute('data-count') + (c.getAttribute('data-suffix') || '');
    });
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

  /* ─── lightbox galerie ─── */
  var lb = $('#lb'), lbImg = $('#lbImg'), lbCap = $('#lbCap');
  var shots = $$('.gal__i');
  var idx = 0;

  var show = function (i) {
    idx = (i + shots.length) % shots.length;
    var fig = shots[idx];
    var img = $('img', fig);
    lbImg.src = img.src;
    lbImg.alt = img.alt || '';
    lbCap.textContent = fig.getAttribute('data-cap') || '';
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
    if (input.name === 'jmeno' && v.length < 2) return t('err.name');
    if (input.name === 'telefon' && v.replace(/[^\d]/g, '').length < 9) return t('err.tel');
    if (input.name === 'email' && v && !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v)) return t('err.mail');
    if (input.name === 'gdpr' && !input.checked) return t('err.gdpr');
    return '';
  };

  $$('input, textarea', form).forEach(function (input) {
    input.addEventListener('blur', function () { setErr(input, check(input)); });
    input.addEventListener('input', function () {
      if (fieldOf(input).classList.contains('bad')) setErr(input, check(input));
    });
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    msg.textContent = '';
    msg.classList.remove('ok');

    var bad = null;
    $$('[required]', form).forEach(function (input) {
      var err = check(input);
      setErr(input, err);
      if (err && !bad) bad = input;
    });
    if (bad) { bad.focus(); msg.textContent = t('err.check'); return; }

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
          done(t('ok.sent'), true);
        })
        .catch(function () { done(t('err.send')); });
    } else {
      // fallback bez serveru — otevře e-mailového klienta
      var body = [
        t('f.name') + ' ' + data.get('jmeno'),
        t('f.tel') + ' ' + data.get('telefon'),
        t('f.mail') + ' ' + (data.get('email') || '—'),
        t('f.svc') + ' ' + (data.get('sluzba') || '—'),
        '',
        data.get('zprava') || ''
      ].join('\n');
      window.location.href = 'mailto:' + FORM_EMAIL +
        '?subject=' + encodeURIComponent(t('mail.subject') + ' — ' + data.get('jmeno')) +
        '&body=' + encodeURIComponent(body);
      done(t('ok.mail'), true);
    }
  });

})();
