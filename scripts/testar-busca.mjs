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
assert.ok(base.includes("window.PedroBusca.search(query,5)"),"Página inicial não utiliza o dicionário");
assert.ok(library.includes('src="/busca-inteligente.js"'),"Biblioteca não importa o dicionário");
const bookJS=read("biblioteca/biblioteca.js");
assert.ok(bookJS.includes("window.PedroBusca.search(query)"),"Biblioteca não usa o dicionário");
assert.ok(bookJS.includes("link.getAttribute('href')"),"Biblioteca não extrai o identificador do artigo");
for(const a of engine.list()){
 const slug=a.url.split("/").pop();
 assert.ok(readdirSync("biblioteca").includes(slug),"Artigo ausente: "+slug);
 assert.ok(library.includes('href="'+slug+'"'),"Artigo ausente do índice: "+slug);
}
for(const match of base.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 if(/src=|application\/ld\+json/.test(match[1]))continue;
 new Script(match[2],{filename:"script-inline-index.html"});
}
console.log("Busca por sinônimos: "+cases.length+" testes passaram; índice e páginas conferidos.");
