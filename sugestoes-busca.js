/* Sugestões de artigos: comportamento compartilhado nas buscas do site. */
(function () {
  'use strict';
  const WAIT_MS = 550;
  const engine = window.PedroBusca;
  if (!engine || typeof engine.search !== 'function') return;
  const popularIds = ['dentadura-solta-machucando', 'protese-protocolo', 'como-limpar-dentadura'];

  function node(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text) element.textContent = text;
    return element;
  }

  function setup(inputId, panelId) {
    const input = document.getElementById(inputId);
    const panel = document.getElementById(panelId);
    if (!input || !panel) return;
    const wrapper = input.closest('.search-assist');
    if (!wrapper) return;
    let timer = null;

    function hide() {
      clearTimeout(timer);
      timer = null;
      panel.hidden = true;
      wrapper.classList.remove('has-suggestions');
      input.setAttribute('aria-expanded', 'false');
    }

    function addArticle(list, article) {
      const item = node('li', 'suggestion-item');
      const link = node('a', 'suggestion-link');
      link.href = article.url;
      const category = node('span', 'suggestion-category', article.category);
      const title = node('strong', 'suggestion-title', article.title);
      const arrow = node('span', 'suggestion-arrow', '›');
      arrow.setAttribute('aria-hidden', 'true');
      link.append(category, title, arrow);
      item.append(link);
      list.append(item);
    }

    function show() {
      timer = null;
      const query = input.value.trim();
      if (!query) { hide(); return; }
      const results = engine.search(query, 4);
      const fallback = engine.list().filter(article => popularIds.includes(article.id));
      /* Um recorte com altura animada: as linhas aparecem de cima para baixo
         sem deformar fontes ou deslocar o campo de pesquisa. */
      const clip = node('div', 'suggestions-clip');
      const scroll = node('div', 'suggestions-scroll');
      clip.append(scroll);
      panel.replaceChildren(clip);

      const headline = node('p', 'suggestion-heading',
        results.length ? 'Artigos relacionados à sua dúvida' : 'Sugestões de leitura');
      scroll.append(headline);

      if (!results.length) {
        scroll.append(node('p', 'suggestion-subtitle', 'Continue digitando ou escolha um destes assuntos:'));
      }
      const list = node('ul', 'suggestion-list');
      (results.length ? results : fallback).forEach(article => addArticle(list, article));
      scroll.append(list);

      const all = node('a', 'suggestion-all', 'Explorar toda a Biblioteca do Paciente');
      all.href = '/biblioteca/';
      scroll.append(all);
      panel.hidden = false;
      /* Registra o estado recolhido antes de acionar a transição CSS.
         Sem esta leitura de layout, a lista aparece de uma vez. */
      void panel.offsetHeight;
      wrapper.classList.add('has-suggestions');
      input.setAttribute('aria-expanded', 'true');
    }

    function queue() {
      hide();
      if (!input.value.trim()) return;
      timer = setTimeout(() => {
        if (document.activeElement === input || wrapper.contains(document.activeElement)) show();
      }, WAIT_MS);
    }

    input.addEventListener('input', queue);
    input.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        if (!panel.hidden) { event.preventDefault(); hide(); }
      } else if (event.key === 'ArrowDown' && input.value.trim()) {
        event.preventDefault();
        clearTimeout(timer);
        if (panel.hidden) show();
        panel.querySelector('a')?.focus();
      } else if (event.key === 'Enter' && input.value.trim()) {
        event.preventDefault();
        clearTimeout(timer);
        if (panel.hidden) show();
        panel.querySelector('.suggestion-link')?.focus();
      }
    });
    panel.addEventListener('keydown', event => {
      const links = Array.from(panel.querySelectorAll('a'));
      const index = links.indexOf(document.activeElement);
      if (event.key === 'Escape') {
        event.preventDefault(); hide(); input.focus();
      } else if (event.key === 'ArrowDown' && index >= 0) {
        event.preventDefault(); links[(index + 1) % links.length]?.focus();
      } else if (event.key === 'ArrowUp' && index >= 0) {
        event.preventDefault();
        if (index === 0) input.focus();
        else links[index - 1]?.focus();
      }
    });
    document.addEventListener('pointerdown', event => {
      if (!wrapper.contains(event.target)) hide();
    });
    wrapper.addEventListener('focusout', () => {
      setTimeout(() => {
        if (!wrapper.contains(document.activeElement)) hide();
      }, 0);
    });
    const query = new URLSearchParams(window.location.search).get('q');
    if (query && inputId === 'library-search') {
      input.value = query;
      // Consulta recebida por link: aguardamos interação antes de abrir sugestões.
    }
  }

  setup('busca', 'sugestoes-home');
  setup('library-search', 'sugestoes-biblioteca');
})();
