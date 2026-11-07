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
    const normalize = value => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').toLowerCase().trim();
    function filter() {
      const query = normalize(field.value);
      const words = query.split(/\\s+/).filter(Boolean);
      let total = 0;
      groups.forEach(group => {
        let visible = 0;
        group.querySelectorAll('.story').forEach(link => {
          const haystack = normalize(link.dataset.search || link.textContent);
          const matches = words.every(word => haystack.includes(word));
          link.hidden = !matches;
          if (matches) { visible++; total++; }
        });
        group.hidden = visible === 0;
      });
      if (empty) empty.hidden = total > 0;
      if (status) status.textContent = query ?
        total + (total === 1 ? ' artigo encontrado para “' : ' artigos encontrados para “') + field.value.trim() + '”' :
        total + (total === 1 ? ' artigo para explorar' : ' artigos para explorar');
    }
    field.addEventListener('input', filter);
    const query = new URLSearchParams(location.search).get('q');
    if (query) field.value = query;
    filter();
  }
})();
