/* Biblioteca do Paciente — controles padronizados entre artigos e índice. */
(function () {
  'use strict';
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('menu');
  function closeMenu() {
    if (!toggle || !menu) return;
    menu.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
  }
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', event => {
      if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu();
    });
  }

  const sizes = [1, 1.15, 1.3, 1.45];
  const minus = document.getElementById('leitura-menos');
  const plus = document.getElementById('leitura-mais');
  if (minus && plus) {
    let level = 0;
    try {
      const saved = Number(localStorage.getItem('pedro-leitura-nivel'));
      if (Number.isInteger(saved) && saved >= 0 && saved < sizes.length) level = saved;
    } catch (_) {}
    function apply() {
      document.documentElement.style.setProperty('--escala-leitura', String(sizes[level]));
      document.documentElement.dataset.leitura = String(level);
      minus.disabled = level === 0;
      plus.disabled = level === sizes.length - 1;
      minus.setAttribute('aria-label','Diminuir tamanho do texto' + (minus.disabled ? ' (mínimo)' : ''));
      plus.setAttribute('aria-label','Aumentar tamanho do texto' + (plus.disabled ? ' (máximo)' : ''));
      try { localStorage.setItem('pedro-leitura-nivel', String(level)); } catch (_) {}
    }
    minus.addEventListener('click', () => { if (level > 0) { level--; apply(); } });
    plus.addEventListener('click', () => { if (level < sizes.length - 1) { level++; apply(); } });
    apply();
  }

  const field = document.getElementById('library-search');
  if (field) {
    const groups = Array.from(document.querySelectorAll('.category'));
    const status = document.getElementById('search-status');
    const empty = document.getElementById('empty');
    function filter() {
      const query = field.value.trim();
      const results = query && window.PedroBusca ? window.PedroBusca.search(query) : [];
      const ids = new Set(results.map(item => item.id));
      let count = 0;
      for (const group of groups) {
        let visible = 0;
        for (const link of group.querySelectorAll('.story')) {
          const slug = link.getAttribute('href').split(/[?#]/)[0].split('/').pop().replace(/\.html$/,'');
          const show = !query || ids.has(slug);
          link.hidden = !show;
          if (show) { visible++; count++; }
        }
        group.hidden = visible === 0;
      }
      if (empty) empty.hidden = count !== 0;
      if (status) status.textContent = query ?
        count + (count === 1 ? ' artigo relacionado à sua dúvida' : ' artigos relacionados à sua dúvida') :
        count + (count === 1 ? ' artigo para explorar' : ' artigos para explorar');
    }
    field.addEventListener('input', filter);
    const query = new URLSearchParams(location.search).get('q');
    if (query) field.value = query;
    filter();
  }
})();
