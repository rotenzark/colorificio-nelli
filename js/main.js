/* Colorificio Nelli — main.js */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var intro = document.getElementById('intro');
  if (intro) {
    if (reduce) intro.classList.add('is-done');
    else { var kill = function () { intro.classList.add('is-done'); }; setTimeout(kill, 1900); intro.addEventListener('click', kill); window.addEventListener('scroll', kill, { once: true, passive: true }); }
  }

  var head = document.getElementById('head');
  var onScroll = function () { if (head) head.classList.toggle('is-scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.getElementById('burger'), nav = document.getElementById('nav'), lastFocus = null;
  function openMenu() { nav.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); lastFocus = document.activeElement; var f = nav.querySelector('a'); if (f) f.focus(); document.addEventListener('keydown', esc); }
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.removeEventListener('keydown', esc); if (lastFocus) burger.focus(); }
  function esc(e) { if (e.key === 'Escape') closeMenu(); }
  if (burger && nav) {
    burger.addEventListener('click', function () { nav.classList.contains('is-open') ? closeMenu() : openMenu(); });
    nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); });
    window.addEventListener('resize', function () { if (window.innerWidth > 960 && nav.classList.contains('is-open')) closeMenu(); });
  }

  var reveals = document.querySelectorAll('.reveal');
  function showAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) showAll();
  else {
    var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(function (el) { io.observe(el); });
    setTimeout(function () { if (!document.querySelector('.reveal.is-visible')) showAll(); }, 1500);
  }

  /* SWATCH TOOLTIP */
  (function () {
    var tip = document.getElementById('tip'); if (!tip) return;
    function show(el, x, y) {
      tip.innerHTML = '<b>' + el.getAttribute('data-name') + '</b> · ' + el.getAttribute('data-code');
      tip.style.left = Math.min(x + 12, window.innerWidth - 160) + 'px';
      tip.style.top = (y - 40) + 'px';
      tip.classList.add('is-on');
    }
    function hide() { tip.classList.remove('is-on'); }
    document.querySelectorAll('.tint').forEach(function (t) {
      t.addEventListener('mousemove', function (e) { show(t, e.clientX, e.clientY); });
      t.addEventListener('mouseleave', hide);
      t.addEventListener('focus', function () { var r = t.getBoundingClientRect(); show(t, r.left + r.width / 2, r.top); });
      t.addEventListener('blur', hide);
      t.addEventListener('click', function (e) { show(t, e.clientX || t.getBoundingClientRect().left, e.clientY || t.getBoundingClientRect().top); setTimeout(hide, 1600); });
    });
  })();

  /* ORARI — Lun-Sab 08:30–12:30 e 15:00–19:00, Dom chiuso */
  (function () {
    var hoursEl = document.getElementById('hours'), statusEl = document.getElementById('status');
    if (!hoursEl) return;
    var day, hour, min;
    try {
      var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      day = map[p.find(function (x) { return x.type === 'weekday'; }).value];
      hour = parseInt(p.find(function (x) { return x.type === 'hour'; }).value, 10);
      min = parseInt(p.find(function (x) { return x.type === 'minute'; }).value, 10);
    } catch (e) { var d = new Date(); day = d.getDay(); hour = d.getHours(); min = d.getMinutes(); }
    var mins = hour * 60 + min;
    var M1 = 510, M2 = 750, A1 = 900, A2 = 1140;   // 8:30–12:30, 15–19
    var openDay = day >= 1 && day <= 6;
    var inMorning = mins >= M1 && mins < M2, inAfternoon = mins >= A1 && mins < A2;
    var isOpen = openDay && (inMorning || inAfternoon);
    var todayLi = hoursEl.querySelector('li[data-day="' + day + '"]');
    if (todayLi) todayLi.classList.add('is-today');
    function nextOpen(from) { var d = from; for (var i = 0; i < 7; i++) { d = (d + 1) % 7; if (d >= 1 && d <= 6) return d; } return 1; }
    var itDays = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    var enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    function render(lang) {
      var it = lang === 'it', html;
      var Open = it ? 'Aperto ora' : 'Open now', Closed = it ? 'Chiuso' : 'Closed';
      if (isOpen) {
        var closeTxt = inMorning ? (it ? 'chiude alle 12:30' : 'closes at 12:30') : (it ? 'chiude alle 19' : 'closes at 7pm');
        html = '<span class="open">● ' + Open + '</span> · ' + closeTxt;
      } else if (openDay && mins < M1) {
        html = '<span class="closed">● ' + Closed + '</span> · ' + (it ? 'apre oggi alle 8:30' : 'opens today at 8:30');
      } else if (openDay && mins >= M2 && mins < A1) {
        html = '<span class="closed">● ' + Closed + '</span> · ' + (it ? 'riapre oggi alle 15' : 'reopens today at 3pm');
      } else {
        var nd = nextOpen(day), name = it ? itDays[nd] : enDays[nd];
        html = '<span class="closed">● ' + Closed + '</span> · ' + (it ? 'apre ' + name + ' alle 8:30' : 'opens ' + name + ' at 8:30');
      }
      if (statusEl) statusEl.innerHTML = html;
    }
    window.__renderHours = render;
    render(document.documentElement.lang === 'en' ? 'en' : 'it');
  })();

  /* i18n */
  var EN = {
    'intro.sub': 'since 1954',
    'nav.swatches': 'The swatches', 'nav.tint': 'Colour to order', 'nav.find': "What's inside", 'nav.shop': 'The shop', 'nav.where': 'Find us',
    'cta.advice': 'Ask us',
    'hero.eyebrow': 'Paint · Fine arts · Hardware — Porta Romana, Milan', 'hero.t1': 'Colour,', 'hero.t2': 'since 1954.',
    'hero.lead': 'Not your usual paint shop. Whatever shade you imagine, here it exists — and if it doesn’t, we mix it for you.',
    'hero.cta1': 'Colour to order', 'hero.cta2': 'Browse the swatches',
    'sw.eyebrow': 'The swatches', 'sw.t1': 'Fifteen hundred', 'sw.t2': 'shades, and more',
    'sw.lead': 'A wall of colour, like the fan decks you flip through in the shop. Hover a shade for its name.',
    'sw.hint': '↑ names are indicative — many more in store',
    'ts.eyebrow': 'The tinting machine', 'ts.t1': 'Bring us a', 'ts.t2': 'sample',
    'ts.p1': 'A cutting, a photo, an old tin: we identify the shade and mix it to order with the tinting machine. As customers say, “they helped me replicate the exact colour”.',
    'ts.s1': 'You bring the shade to match', 'ts.s2': 'We read it and fine-tune', 'ts.s3': 'We mix the amount you need',
    'f.eyebrow': "What's inside", 'f.t1': 'Far more than', 'f.t2': 'tins',
    'f.1t': 'Paint & varnish', 'f.1d': 'For walls, wood and iron, indoors and out. Professional brands.',
    'f.2t': 'Fine arts', 'f.2d': 'Canvases of every size, colours, brushes and artist supplies.',
    'f.3t': 'Hardware & DIY', 'f.3d': 'Tools, fittings and everything for jobs around the house.',
    'f.4t': 'Treatments', 'f.4d': 'Products and advice for wood, marble and surfaces to restore.',
    'shop.eyebrow': 'The shop', 'shop.t1': 'Under the yellow', 'shop.t2': 'awning, since 1954',
    'shop.p1': 'Seventy years of colour on the corner of Porta Romana. A landmark for artists, restorers, painters and anyone who just wants the right tin — with the owners’ expert advice.',
    'shop.p2': '“Great professionalism from the owners”: it’s the line that comes up most in the reviews. Here colour is a craft, not a shelf.',
    'rev.eyebrow': 'What customers say', 'rev.t1': 'Well-advised and', 'rev.t2': 'expert', 'rev.lead': 'Real reviews from Google · 4.5 out of 55.',
    'rev.q1': 'Excellent products and great professionalism from the owners. They helped me both identify shades to replicate and with the technical application specs.',
    'rev.q2': 'They recommended a great product (under 10 euros) to treat my slightly scratched marble table.',
    'rev.q3': 'I bought canvases for painting, even large sizes, at a great price.',
    'rev.q4': 'A super friendly, very expert young man — a pleasure to shop here.',
    'rev.q5': 'Kindness, helpfulness and competence: the most appreciated approach.',
    'where.eyebrow': 'Where we are', 'where.t1': 'On the corner of', 'where.t2': 'Porta Romana',
    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday', 'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday', 'closed': 'Closed',
    'faq.eyebrow': 'Questions', 'faq.t1': 'Good to', 'faq.t2': 'know',
    'faq.q1': 'Do you reproduce a colour from a sample?', 'faq.a1': 'Yes. With the tinting machine we replicate the shade you bring us — from a cutting, a photo or an old tin — and mix it to order.',
    'faq.q2': 'Do you also sell fine-art materials?', 'faq.a2': 'Yes: canvases of every size, colours, brushes and supplies, plus paint, varnish, hardware and DIY.',
    'faq.q3': 'Do you deliver?', 'faq.a3': 'Yes, we deliver across Milan, as well as in-store pickup.',
    'faq.q4': 'When are you open?', 'faq.a4': 'Monday to Saturday, 8:30–12:30 and 15:00–19:00. Closed Sunday.',
    'foot.tag': 'Colour, fine arts and hardware since 1954 · Porta Romana, Milan', 'foot.demo': 'Demo website by Bespoke Studio',
    'ab.call': 'Call', 'ab.where': 'Find us', 'ab.tint': 'Colour to order'
  };
  var nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach(function (el) { el.dataset.it = el.textContent; });
  function setLang(lang) {
    document.documentElement.lang = lang;
    nodes.forEach(function (el) { var k = el.getAttribute('data-i18n'); el.textContent = (lang === 'en' && EN[k] != null) ? EN[k] : el.dataset.it; });
    document.querySelectorAll('.lang__btn').forEach(function (b) { var on = b.getAttribute('data-lang') === lang; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    if (window.__renderHours) window.__renderHours(lang);
    try { localStorage.setItem('nelli-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang__btn').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  var saved; try { saved = localStorage.getItem('nelli-lang'); } catch (e) {}
  if (saved === 'en') setLang('en');

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
