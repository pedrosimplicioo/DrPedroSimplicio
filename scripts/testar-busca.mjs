import {readFileSync, readdirSync} from "node:fs";
import {runInNewContext, Script} from "node:vm";
import assert from "node:assert/strict";
const read=path=>readFileSync(path,"utf8");
const env={window:{}};
runInNewContext(read("busca-inteligente.js"),env,{filename:"busca-inteligente.js"});
const engine=env.window.PedroBusca;
assert.ok(engine && typeof engine.search==="function","Mecanismo de busca não carregado");
const cases=[
 ["minha chapa cai quando estou comendo","dentadura-solta-machucando"],
 ["minha cha","dentadura-solta-machucando"],
 ["dentadura de baixo não para no lugar","dentadura-solta-machucando"],
 ["minha dentadura está machucando a gengiva","dentadura-solta-machucando"],
 ["como lavar a chapa","como-limpar-dentadura"],
 ["posso limpar a dentadura com pasta de dente","como-limpar-dentadura"],
 ["quero saber dos dentes parafusados","protese-protocolo"],
 ["como funciona protese protocolo","protese-protocolo"],
 ["trocar a minha chapa por dentes fixos","dentadura-ou-protese-fixa"],
 ["qual a diferença entre dentadura e implantes","dentadura-ou-protese-fixa"],
 ["meu dente quebrou","quando-dente-precisa-coroa"],
 ["preciso de uma capinha no dente","quando-dente-precisa-coroa"],
 ["qual a previsão do tempo",null],
 ["",null]
];
for(const [query,expected] of cases){
 const actual=engine.search(query,1)[0]?.id||null;
 assert.equal(actual,expected,"Busca retornou tema inadequado para: "+query);
}
const base=read("index.html");
const library=read("biblioteca/index.html");
assert.ok(base.includes('src="/busca-inteligente.js"'),"Página inicial não importa o dicionário");
assert.ok(base.includes('id="sugestoes-home"'),"Área de sugestões ausente na página inicial");
assert.ok(base.includes('src="/sugestoes-busca.js"'),"Página inicial não carrega as sugestões");
assert.ok(base.includes('4 conteúdos para começar'),"Os artigos iniciais não estão mais visíveis");
assert.ok(library.includes('src="/busca-inteligente.js"'),"Biblioteca não importa o dicionário");
const bookJS=read("biblioteca/biblioteca.js");
assert.ok(library.includes('id="sugestoes-biblioteca"'),"Área de sugestões ausente na biblioteca");
assert.ok(library.includes('src="/sugestoes-busca.js"'),"Biblioteca não carrega as sugestões");
assert.ok(!bookJS.includes("field.addEventListener('input', filter)"),"A biblioteca não deve ocultar os artigos durante a pesquisa");
const suggestions=read("sugestoes-busca.js");
assert.ok(suggestions.includes("const WAIT_MS = 550"),"Sugestões não estão configuradas para aguardar 550 ms");
assert.ok(suggestions.includes("setTimeout("),"Temporizador de busca ausente");
assert.ok(suggestions.includes("engine.search(query, 4)"),"Sugestões não consultam o dicionário");
assert.ok(suggestions.includes("popularIds"),"Faltam sugestões alternativas quando não há resultado");

const homeBox = base.indexOf('class="search-assist"');
const homeInput = base.indexOf('id="busca"', homeBox);
const homePanel = base.indexOf('id="sugestoes-home"', homeInput);
const homeExamples = base.indexOf('class="search-hint"', homePanel);
assert.ok(homeBox >= 0 && homeInput > homeBox && homePanel > homeInput && homeExamples > homePanel, "Sugestões não estão acopladas ao campo de busca da página inicial");
const libraryBox = library.indexOf('class="search-assist"');
const libraryInput = library.indexOf('id="library-search"', libraryBox);
const libraryPanel = library.indexOf('id="sugestoes-biblioteca"', libraryInput);
const libraryExamples = library.indexOf('class="search-help"', libraryPanel);
assert.ok(libraryBox >= 0 && libraryInput > libraryBox && libraryPanel > libraryInput && libraryExamples > libraryPanel, "Sugestões não estão acopladas ao campo da biblioteca");
assert.ok(suggestions.includes("wrapper.classList.add('has-suggestions')"), "Estado visual de abertura da pesquisa não configurado");
const styles = read("site-shared.css");
assert.ok(styles.includes(".search-assist.has-suggestions .searchrow input"), "Barra de pesquisa e dropdown não compartilham o mesmo contorno visual");
assert.ok(suggestions.includes("const clip = node('div', 'suggestions-clip')"), "Falta o recorte para animar sem distorcer os textos");
assert.ok(suggestions.includes("const scroll = node('div', 'suggestions-scroll')"), "Falta a camada rolável das sugestões");
assert.ok(suggestions.includes("void panel.offsetHeight"), "Abertura não força o estado inicial da transição");
assert.ok(styles.includes("grid-template-rows 360ms"), "Animação de expansão vertical não encontrada");
assert.ok(styles.includes("prefers-reduced-motion:reduce"), "Falta respeitar movimento reduzido");
new Script(suggestions,{filename:"sugestoes-busca.js"});
for(const a of engine.list()){
 const slug=a.url.split("/").pop();
 assert.ok(readdirSync("biblioteca").includes(slug),"Artigo ausente: "+slug);
 assert.ok(library.includes('href="'+slug+'"'),"Artigo ausente do índice: "+slug);
}
for(const match of base.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 if(/src=|application\/ld\+json/.test(match[1]))continue;
 new Script(match[2],{filename:"script-inline-index.html"});
}
console.log("Busca por sinônimos e sugestões: "+cases.length+" testes passaram; índice e páginas conferidos.");
