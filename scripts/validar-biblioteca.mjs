import { readFileSync, readdirSync, existsSync } from "node:fs";
import { resolve, dirname, join } from "node:path";

const root = process.cwd();
const errors = [];
const file = rel => readFileSync(resolve(root, rel), "utf8");
function fail(page, why) { errors.push(page + ": " + why); }
function assert(page, condition, why) { if (!condition) fail(page, why); }
function normalizeHeader(html) {
  const found = html.match(/<header class="top">[\s\S]*?<\/header>/i);
  if (!found) return null;
  return found[0]
    .replace(/\s+aria-current="[^"]*"/g, "")
    .replace(/href="[^"]*"/g, 'href="#"')
    .replace(/\s+/g, " ")
    .trim();
}
function checkLocalLinks(page, html) {
  const hrefs = Array.from(html.matchAll(/<a\b[^>]*\bhref="([^"]+)"/gi), match => match[1]);
  for (const href of hrefs) {
    if (/^(?:https?:|mailto:|tel:|#|\/)/i.test(href)) continue;
    const rel = href.split(/[?#]/)[0];
    if (!rel) continue;
    const destination = resolve(root, dirname(page), rel);
    if (!existsSync(destination)) fail(page, "Link interno não encontrado: " + href);
  }
}

const homepage = file("index.html");
const homeHeader = normalizeHeader(homepage);
assert("index.html", Boolean(homeHeader), "Cabeçalho principal ausente");
assert("index.html", homepage.includes('/site-shared.css'), "CSS oficial não carregado");
assert("index.html", homepage.includes('href="/biblioteca/"'), "Link para biblioteca incorreto");

for (const asset of ["site-shared.css", "biblioteca/biblioteca.css", "biblioteca/biblioteca.js"]) {
  assert(asset, existsSync(join(root, asset)), "Arquivo compartilhado não encontrado");
}

const pages = readdirSync(join(root, "biblioteca")).filter(name => name.endsWith(".html"));
assert("biblioteca", pages.length >= 6, "Esperado índice e pelo menos cinco artigos");

for (const name of pages) {
  const page = join("biblioteca", name);
  const html = file(page);
  const header = normalizeHeader(html);
  assert(page, header === homeHeader, "Cabeçalho diferente da página inicial");
  assert(page, html.includes('<body class="library-page">'), "Classe de layout ausente");
  assert(page, html.includes('href="/site-shared.css"'), "CSS de identidade ausente");
  assert(page, html.includes('href="/biblioteca/biblioteca.css"'), "CSS editorial ausente");
  assert(page, html.includes('src="/biblioteca/biblioteca.js"'), "JavaScript único ausente");
  assert(page, !/<style\b/i.test(html), "CSS local proibido: use os dois estilos compartilhados");
  assert(page, !/(?:identidade-site|biblioteca-estilos|editorial-ajustes|\/assets\/style)\.css/.test(html), "CSS legado encontrado");
  assert(page, (html.match(/<h1\b/gi) || []).length === 1, "Cada página precisa de exatamente um H1");
  checkLocalLinks(page, html);
  if (name !== "index.html") {
    assert(page, /<article\b[^>]*class="article"/.test(html), "Estrutura de artigo ausente");
    assert(page, /itemprop="articleBody"/.test(html), "Corpo sem marcação de artigo");
    assert(page, /class="answer"/.test(html), "Resposta rápida ausente");
    assert(page, /class="byline"/.test(html), "Autoria ausente");
    assert(page, /class="related"/.test(html), "Leituras relacionadas ausentes");
  } else {
    assert(page, /id="library-search"/.test(html), "Busca da biblioteca ausente");
    assert(page, /class="category"/.test(html), "Categorias não encontradas");
  }
}

if (errors.length) {
  console.error("Falhas de consistência na biblioteca:\n" + errors.map(x => " - " + x).join("\n"));
  process.exit(1);
}
console.log("Biblioteca validada: " + pages.length + " páginas com cabeçalho, CSS, links e estrutura consistentes.");
