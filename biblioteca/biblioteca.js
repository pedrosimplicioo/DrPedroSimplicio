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

  /* A busca abre sugestões próximas ao campo, sem esconder as categorias. */
})();
