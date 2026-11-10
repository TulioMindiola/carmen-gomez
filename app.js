/* Carmen Gomez · Wedding & Event Planner */
(() => {
  'use strict';
  const d = document, root = d.documentElement;
  const $ = (s, c = d) => c.querySelector(s), $$ = (s, c = d) => [...c.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (t) => t * t * (3 - 2 * t);
  const quieto = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const WA = 'https://wa.me/573127716677';
  root.classList.add('js');

  /* ── idioma ── */
  let lang = 'es';
  const T = {
    leyendas: [
      ['Primer baile bajo un techo de follaje', 'First dance under a ceiling of foliage'],
      ['Las mesas, bajo un jardín colgante', 'The tables, under a hanging garden'],
      ['Fuegos artificiales para los recién casados', 'Fireworks for the newlyweds'],
      ['El salón listo, antes de abrir las puertas', 'The room is ready, before the doors open'],
    ],
    destino: { cali: ['Cali', 'Cali'], cartagena: ['Cartagena', 'Cartagena'], medellin: ['Medellín', 'Medellín'], eje: ['Eje Cafetero', 'Coffee Region'], otro: ['Donde ustedes digan', 'Wherever you say'] },
    rol: { 'Planeación': 'Planning', 'Planeación y flores': 'Planning and flowers', 'Fotografía': 'Photography', 'Foto y video': 'Photo and video', 'Producción': 'Production', 'Música': 'Music', 'Orquesta': 'Band', 'Lugar': 'Venue' },
    tu: ['Tu nombre', 'Your name'], suyo: ['El suyo', 'Theirs'], invitados: ['invitados', 'guests'], foto: ['fotografía', 'photo'],
  };
  const t = (par) => par[lang === 'en' ? 1 : 0];
  const waLink = (msg) => WA + '?text=' + encodeURIComponent(msg);
  function setLang(l) {
    lang = l; root.lang = l;
    $$('[data-en]').forEach((el) => { if (el.dataset.es === undefined) el.dataset.es = el.innerHTML; el.innerHTML = l === 'en' ? el.dataset.en : el.dataset.es; });
    $$('[data-en-label]').forEach((el) => { if (el.dataset.esLabel === undefined) el.dataset.esLabel = el.getAttribute('aria-label'); el.setAttribute('aria-label', l === 'en' ? el.dataset.enLabel : el.dataset.esLabel); });
    $$('a[data-wa]').forEach((a) => { a.href = waLink(l === 'en' ? a.dataset.waEn : a.dataset.wa); });
    try { localStorage.setItem('cg-lang', l); } catch (e) {}
    heroAct = -1; onScroll(); tarjeta();
  }
  $('#idioma').addEventListener('click', () => setLang(lang === 'es' ? 'en' : 'es'));

  /* ── barra: toma la tinta del capítulo que tiene debajo ── */
  const barra = $('#barra');
  const capitulos = $$('[data-tinta]').filter((el) => el !== barra);
  function tinta() {
    const y = barra.offsetHeight / 2; let tono = 'claro', cap = null;
    for (const c of capitulos) { const r = c.getBoundingClientRect(); if (r.top <= y && r.bottom > y) { tono = c.dataset.tinta; cap = c; } }
    if (barra.dataset.tinta !== tono) barra.dataset.tinta = tono;
    const fondo = !cap || cap.closest('[data-barra="nada"]') ? 'transparent' : getComputedStyle(cap).backgroundColor;
    if (barra.style.backgroundColor !== fondo) barra.style.backgroundColor = fondo;
    const vela = !!(cap && cap.classList.contains('campo-vela'));
    if (vela !== barra.hasAttribute('data-vela')) barra.toggleAttribute('data-vela', vela);
  }
  const menuBtn = $('#menu-btn');
  const rotulo = () => { const ab = barra.classList.contains('abierta'); menuBtn.firstElementChild.textContent = ab ? (lang === 'en' ? 'Close' : 'Cerrar') : (lang === 'en' ? 'Menu' : 'Menú'); };
  const cierraMenu = () => { barra.classList.remove('abierta'); menuBtn.setAttribute('aria-expanded', 'false'); rotulo(); };
  menuBtn.addEventListener('click', () => { const ab = barra.classList.toggle('abierta'); menuBtn.setAttribute('aria-expanded', String(ab)); rotulo(); });
  d.addEventListener('keydown', (e) => { if (e.key === 'Escape') cierraMenu(); });
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const dest = $(a.getAttribute('href')); if (!dest) return;
    e.preventDefault(); cierraMenu();
    const y = dest.getBoundingClientRect().top + scrollY;
    scrollTo({ top: y, behavior: quieto ? 'auto' : 'smooth' });
    history.replaceState(null, '', a.getAttribute('href'));
  }));

  /* ── la firma ── */
  const dibuja = (svg) => { if (!svg) return; svg.classList.remove('espera', 'dibuja'); void svg.getBoundingClientRect(); svg.classList.add('dibuja'); };
  const espera = (svg) => { svg.classList.remove('dibuja'); svg.classList.add('espera'); };
  const heroFirma = $('.hero-firma'), tbFirma = $('.tb-firma'), pieFirma = $('.pie-firma-svg');
  if (!quieto) {
    $$('.firma').forEach(espera);
    requestAnimationFrame(() => { dibuja($('.marca-firma')); setTimeout(() => dibuja(heroFirma), 500); });
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (e.isIntersecting && e.intersectionRatio >= .55) { if (!e.target.dataset.hecho) { e.target.dataset.hecho = '1'; dibuja($('.boda-firma', e.target)); } }
      else if (e.intersectionRatio < .15 && e.target.dataset.hecho) { delete e.target.dataset.hecho; espera($('.boda-firma', e.target)); }
    }), { threshold: [0, .15, .55, .8] });
    $$('.boda').forEach((b) => io.observe(b));
    const io2 = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { dibuja(e.target); io2.unobserve(e.target); } }), { threshold: .35 });
    io2.observe(pieFirma); io2.observe(tbFirma);
  }

  /* ── videos: se cargan y se reproducen solo cuando se ven ── */
  const vids = $$('video');
  const ioV = new IntersectionObserver((es) => es.forEach((e) => {
    const v = e.target;
    if (e.isIntersecting) {
      if (!v.src && v.dataset.src) v.src = v.dataset.src;
      if (!quieto) { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    } else if (!v.paused) v.pause();
  }), { rootMargin: '25% 0px 25% 0px', threshold: 0 });
  vids.forEach((v) => { v.muted = true; ioV.observe(v); });

  /* ── escenas con el scroll ── */
  const hero = $('.hero'), tira = $('#carrete-tira'), leyenda = $('#hero-leyenda');
  const bodas = $$('.boda');
  const dist = $('.dist'), distF = $$('.dist-f'), distN = $$('#dist-notas li');
  const riel = $('#fila-riel'), fila = $('.fila');
  const introFoto = $('.intro-foto');
  let heroAct = -1, distAct = -1, rielLibre = true, marcado = false;
  distF.forEach((im, k) => { im.style.zIndex = String(distF.length - k); });

  function onScroll() {
    marcado = false;
    const vh = innerHeight;
    tinta();
    // portada: el carrete avanza cuatro cuadros mientras la frase se queda
    let r = hero.getBoundingClientRect();
    if (r.bottom > -vh) {
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const n = T.leyendas.length - 1, x = p * n, i = Math.min(n - 1, Math.floor(x)), f = x - i;
      const paso = quieto ? Math.round(x) : i + smooth(clamp((f - .2) / .6));
      tira.style.setProperty('--paso', paso.toFixed(4));
      const act = Math.round(paso);
      if (act !== heroAct) { const primera = heroAct === -1; heroAct = act; leyenda.textContent = t(T.leyendas[act]); if (!primera && !quieto) dibuja(heroFirma); }
    }
    // bodas: los paneles y las dos mitades del nombre viajan en sentidos opuestos y se alinean en el centro
    if (!quieto) for (const b of bodas) {
      r = b.getBoundingClientRect();
      if (r.bottom < -vh * .5 || r.top > vh * 1.5) { if (b.style.getPropertyValue('--d')) b.style.removeProperty('--d'); continue; }
      b.style.setProperty('--d', clamp((r.top + r.height / 2 - vh / 2) / vh, -1, 1).toFixed(4));
    }
    // un cuadro, tres distancias
    r = dist.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh) {
      const p = clamp(-r.top / Math.max(1, r.height - vh));
      const x = p * 2, i = Math.min(1, Math.floor(x)), f = x - i, s = i + smooth(clamp((f - .28) / .44));
      distF.forEach((im, k) => {
        const l = s - k;
        im.style.opacity = l > 0 ? clamp(1 - l * 1.35).toFixed(3) : '1';
        im.style.transform = quieto ? 'none' : `scale(${(l > 0 ? 1 + l * 1.7 : 1 - l * .2).toFixed(4)})`;
      });
      const act = Math.round(s);
      if (act !== distAct) { distAct = act; distN.forEach((li, k) => li.classList.toggle('activa', k === act)); }
    }
    // detalles: la fila avanza sola hasta que alguien la mueve
    if (rielLibre && !quieto) {
      r = fila.getBoundingClientRect();
      if (r.bottom > 0 && r.top < vh) riel.scrollLeft = clamp((vh - r.top) / (vh + r.height)) * (riel.scrollWidth - riel.clientWidth) * .9;
    }
    if (introFoto && !quieto) { r = introFoto.getBoundingClientRect(); if (r.bottom > 0 && r.top < vh) introFoto.style.setProperty('--py', ((r.top + r.height / 2 - vh / 2) * -.07).toFixed(1)); }
  }
  const pide = () => { if (!marcado) { marcado = true; requestAnimationFrame(onScroll); } };
  addEventListener('scroll', pide, { passive: true });
  addEventListener('resize', pide);

  /* ── fila: arrastrar con el ratón, flechas del teclado ── */
  riel.classList.add('auto');
  const suelta = () => { rielLibre = false; riel.classList.remove('auto'); };
  let ax = null, al = 0;
  riel.addEventListener('pointerdown', (e) => { if (e.pointerType !== 'mouse') { suelta(); return; } ax = e.clientX; al = riel.scrollLeft; rielLibre = false; riel.classList.add('arrastra'); riel.setPointerCapture(e.pointerId); });
  riel.addEventListener('pointermove', (e) => { if (ax !== null) riel.scrollLeft = al - (e.clientX - ax); });
  const fin = () => { if (ax !== null) { ax = null; riel.classList.remove('arrastra'); } };
  riel.addEventListener('pointerup', fin); riel.addEventListener('pointercancel', fin);
  riel.addEventListener('wheel', (e) => { if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) suelta(); }, { passive: true });
  riel.addEventListener('keydown', (e) => { if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { suelta(); riel.scrollBy({ left: (e.key === 'ArrowRight' ? 1 : -1) * riel.clientWidth * .6, behavior: quieto ? 'auto' : 'smooth' }); e.preventDefault(); } });

  /* ── entradas por partes ── */
  const grupos = ['.intro-p, .intro-foto, .intro-video', '.campo-p, .campo-h', '.fila-h, .fila-p', '.carmen-datos li', '.carmen-p, .carmen-foto', '.lugares-h, .lugares-foto', '.tabla li', '.preguntas-h', '.preguntas details', '.tb-h, .tb-p', '#tb > *', '.tb-tarjeta', '.pie-h, .pie-inv .boton', '.pie-enlaces li'];
  const ioR = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('visto'); ioR.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  grupos.forEach((sel) => { const porPadre = new Map(); $$(sel).forEach((el) => { const k = el.parentElement, i = porPadre.get(k) || 0; porPadre.set(k, i + 1); el.style.setProperty('--i', String(Math.min(i, 6))); el.classList.add('rv'); ioR.observe(el); }); });

  /* ── diálogo de cada boda ── */
  const datos = JSON.parse($('#datos-bodas').textContent), dlg = $('#dlg');
  let abre = null;
  $$('[data-abre]').forEach((b) => b.addEventListener('click', () => {
    const x = datos.find((q) => q.id === b.dataset.abre); if (!x) return; abre = b;
    $('#dlg-t').textContent = x.nombre;
    $('#dlg-meta').textContent = (lang === 'en' && x.lugar_en ? x.lugar_en : x.lugar) + ' · ' + x.ano;
    $('#dlg-nota').textContent = lang === 'en' ? x.nota_en : x.nota;
    $('#dlg-equipo').innerHTML = x.equipo.map(([k, v]) => `<dt>${lang === 'en' ? (T.rol[k] || k) : k}</dt><dd>${v}</dd>`).join('');
    $('#dlg-fotos').innerHTML = x.fotos.map((f, i) => `<img src="assets/f/${f.f}-1280.webp" srcset="assets/f/${f.f}-640.webp 640w, assets/f/${f.f}-1280.webp 1280w" sizes="(max-width: 820px) 86vw, 44vw" width="${f.w}" height="${f.h}" alt="${x.nombre}, ${t(T.foto)} ${i + 1}" ${i > 1 ? 'loading="lazy"' : ''} decoding="async">`).join('');
    dlg.showModal(); $('#dlg-fotos').scrollLeft = 0;
  }));
  $('#dlg-x').addEventListener('click', () => dlg.close());
  dlg.addEventListener('click', (e) => { if (e.target === dlg) dlg.close(); });
  dlg.addEventListener('close', () => { if (abre) abre.focus({ preventScroll: true }); });

  /* ── tu boda: la tarjeta que Carmen firma ── */
  const tb = $('#tb'), tbA = $('#tb-a'), tbB = $('#tb-b'), tbMes = $('#tb-mes'), tbInv = $('#tb-inv');
  const n1 = $('#tb-n1'), n2 = $('#tb-n2'), nombre = $('#tb-nombre'), linea = $('#tb-linea'), enviar = $('#tb-enviar'), fotos = $$('.tb-f');
  const ORDEN = ['cali', 'cartagena', 'medellin', 'eje', 'otro'];
  const limpia = (s) => s.replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 16);
  const mesTxt = (v) => { const m = /^(\d{4})-(\d{2})$/.exec(v || ''); if (!m) return ''; try { return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'es-CO', { month: 'long', year: 'numeric' }).format(new Date(+m[1], +m[2] - 1, 1)); } catch (e) { return v; } };
  let firmaT = 0, ultima = '';
  function tarjeta(redibuja) {
    const a = limpia(tbA.value), b = limpia(tbB.value);
    const dest = (new FormData(tb).get('destino')) || 'cali', mes = mesTxt(tbMes.value), inv = tbInv.value, invTxt = inv ? tbInv.options[tbInv.selectedIndex].text : '';
    n1.textContent = a || t(T.tu); n2.textContent = '& ' + (b || t(T.suyo));
    nombre.style.fontSize = ''; // el nombre más largo cabe en una línea
    const ancho = nombre.clientWidth, mayor = Math.max(n1.scrollWidth, n2.scrollWidth);
    if (mayor > ancho && ancho > 0) nombre.style.fontSize = (14 * ancho / mayor * .98).toFixed(2) + 'cqw';
    linea.textContent = [t(T.destino[dest]), mes, invTxt && invTxt + ' ' + t(T.invitados)].filter(Boolean).join(' · ');
    fotos.forEach((f, i) => f.classList.toggle('activa', i === ORDEN.indexOf(dest)));
    const en = lang === 'en', lugar = dest === 'otro' ? '' : t(T.destino[dest]);
    let msg;
    if (en) msg = `Hi Carmen, ${a && b ? `we are ${a} and ${b}` : a ? `I'm ${a}` : 'I saw your website'}. We'd like to get married${lugar ? ' in ' + lugar : ' in Colombia'}${mes ? ' in ' + mes : ''}${invTxt ? `, with ${invTxt} guests` : ''}. Can we talk?`;
    else msg = `Hola Carmen, ${a && b ? `somos ${a} y ${b}` : a ? `soy ${a}` : 'vi tu página'}. Queremos casarnos${lugar ? ' en ' + lugar : ' en Colombia'}${mes ? ' en ' + mes : ''}${invTxt ? `, con ${invTxt} invitados` : ''}. ¿Hablamos?`;
    enviar.href = waLink(msg);
    const clave = [a, b, dest, mes, inv].join('|');
    if (redibuja && clave !== ultima && !quieto) { clearTimeout(firmaT); firmaT = setTimeout(() => dibuja(tbFirma), 320); }
    ultima = clave;
  }
  tb.addEventListener('input', () => tarjeta(true));
  tb.addEventListener('change', () => tarjeta(true));
  tb.addEventListener('submit', (e) => e.preventDefault());
  const hoy = new Date(); tbMes.min = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}`;

  /* ── arranque ── */
  let guardado = null; try { guardado = localStorage.getItem('cg-lang'); } catch (e) {}
  const pedido = /[?&]lang=(es|en)/.exec(location.search); if (pedido) guardado = pedido[1];
  if (guardado === 'en' || (!guardado && /^en\b/i.test(navigator.language || ''))) setLang('en'); else { onScroll(); tarjeta(); }
  if (d.fonts && d.fonts.ready) d.fonts.ready.then(() => { tarjeta(); onScroll(); });
  addEventListener('load', onScroll);
})();
