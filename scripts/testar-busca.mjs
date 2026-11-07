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
assert.ok(suggestions.includes("const WAIT_MS = 2000"),"Sugestões não estão configuradas para aguardar 2 segundos");
assert.ok(suggestions.includes("setTimeout("),"Temporizador de busca ausente");
assert.ok(suggestions.includes("engine.search(query, 4)"),"Sugestões não consultam o dicionário");
assert.ok(suggestions.includes("popularIds"),"Faltam sugestões alternativas quando não há resultado");
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
