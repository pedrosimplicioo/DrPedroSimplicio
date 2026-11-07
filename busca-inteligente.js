/* Busca interna orientada à linguagem do paciente. Termos usados apenas para pesquisa no site, não para SEO oculto. */
window.PedroBusca = (function buildSearcher(){
 const data=[
  ["dentadura-solta-machucando","Minha dentadura está solta ou machucando. O que fazer?","Dentaduras (próteses totais)","Entenda quando a dentadura perde estabilidade, causa feridas e precisa de ajustes.","dentadura chapa protese total removivel solta cai sambando desencaixa frouxa machuca ferida gengiva dor estabilidade fixador cola adesivo reembasamento encaixe mastigar comer baixo inferior nao segura","minha chapa cai|chapa cai quando como|chapa esta sambando|dentadura nao segura|dentadura sai da boca|dentadura solta|dentadura de baixo solta|dentadura inferior solta|dentadura machuca gengiva|dentadura ferindo gengiva|dentadura nao encaixa|fixador de dentadura|reembasar dentadura"],
  ["protese-protocolo","Como funciona a prótese protocolo?","Próteses fixas","Conheça etapas do tratamento, implantes e próteses provisórias e definitivas.","protocolo implantes implantados dente fixos parafusados dentadura fixa arco completo arcada carga imediata cirurgia provisoria definitivo reabilitacao","protese protocolo|dentes parafusados|dentes fixos sobre implantes|dentes fixos com implantes|dentadura fixa|colocar implantes|como funciona protocolo|dentes fixos imediatamente|carga imediata|colocar dentes fixos"],
  ["dentadura-ou-protese-fixa","Dentadura ou prótese fixa: qual é a diferença?","Próteses fixas","Compare diferenças de estabilidade, manutenção e características dos tratamentos.","comparar diferenca escolher alternativa opcao dentadura chapa protese total removivel fixa fixos implante implantes trocar melhor vantagens desvantagens","dentadura ou protese fixa|chapa ou dentes fixos|trocar dentadura por implantes|trocar dentadura por dentes fixos|dentadura ou implante|qual melhor dentadura ou fixa|diferenca entre dentadura e implante|dentadura versus dentes fixos|posso trocar minha chapa por fixa"],
  ["como-limpar-dentadura","Como limpar uma dentadura corretamente?","Cuidados com as próteses","Saiba como cuidar da higiene diária e quais produtos merecem atenção.","limpar lavar escovar higienizar higienizacao limpeza dentadura chapa protese total removivel escova sabao produto pasta agua manchas dormir guardar conservar","como limpar dentadura|lavar chapa|limpar minha chapa|escovar dentadura|higienizar protese removivel|limpar protese total|pasta de dente na dentadura|agua quente dentadura|tirar manchas da dentadura|como guardar dentadura|dormir com dentadura"],
  ["quando-dente-precisa-coroa","Quando um dente precisa de uma coroa dentária?","Coroas e restaurações","Entenda quando uma coroa pode ajudar a recuperar a estrutura de um dente.","coroa dentaria coroa dente quebrado quebrou fraturou trincou destruido estragado capinha pivo canal restauracao reconstruir fortalecer recuperar","dente quebrou|dente quebrado|coroa dentaria|capinha no dente|dente trincado|dente com canal precisa coroa|quando colocar coroa|dente muito destruido|dente rachou|pivo no dente"]
 ];
 function normalize(s){return String(s??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g," ").trim().replace(/\s+/g," ")}
 const stops=new Set("a ao aos as de da das do dos e em na nas no nos o os um uma uns umas meu minha meus minhas seu sua seus suas que qual quais com sem por para pra pro quando onde porque pq voce vc eu ele ela esta estou tem tenho ter muito pouco pode posso preciso gostaria queria quero saber sobre fazer so isso isto esse essa aqui seria como nao entre no".split(" "));
 function canon(t){
   if(/^(chapa|chapas|dentadura|dentaduras)$/.test(t))return "dentadura";
   if(/^(proteses|protese)$/.test(t))return "protese";
   if(/^(dente|dentes)$/.test(t))return "dente";
   if(/^(cai|cair|caindo|caiu|solta|solto|soltam|soltando|soltar|frouxa|frouxo|escapa|escapando|sambando|desencaixa|desencaixando)$/.test(t))return "solto";
   if(/^(fixa|fixo|fixas|fixos)$/.test(t))return "fixo";
   if(/^implant/.test(t))return "implante";
   if(/^(machuca|machucando|machucada|machucado|fere|ferindo|ferida|feridas)$/.test(t))return "machuca";
   if(/^(lavar|lavo|lava|lavando|limpa|limpar|limpando|limpeza|higiene|higienizar|higienizacao|escovar|escovando)$/.test(t))return "limpar";
   if(/^(quebrado|quebrou|quebrada|quebraram|quebrar|fraturou|fratura|trincado|trincou|rachou)$/.test(t))return "quebrado";
   if(/^(comer|comendo|mastigar|mastigando|mastigacao)$/.test(t))return "mastigar";
   if(/^(parafusado|parafusados|parafusada|parafusadas|parafuso)$/.test(t))return "parafusado";
   if(/^(removivel|removiveis|movel|moveis)$/.test(t))return "removivel";
   if(/^(diferente|diferenca|diferencas|comparar|comparacao|versus)$/.test(t))return "diferenca";
   if(/^(coroas|coroa)$/.test(t))return "coroa";
   return t;
 }
 function tokens(str){let n=normalize(str).replace(/\bnao para no lugar\b/g," solta ").replace(/\bnao fica firme\b/g," solta ").replace(/\bnao segura\b/g," solta ").replace(/\bfica caindo\b/g," solta ");return n.split(" ").filter(t=>t.length>2&&!stops.has(t)).map(canon);}
 const prepared=data.map(([id,title,category,description,terms,phrases])=>({id,title,category,description,url:"/biblioteca/"+id+".html",keywords:new Set(tokens(title+" "+description+" "+terms)),titleWords:new Set(tokens(title)),phrases:phrases.split("|").map(s=>tokens(s).join(" ")).filter(Boolean)}));
 function rank(doc,words){
   const sequence=words.join(" "), distinct=new Set(words);
   if(!sequence)return 0;
   let phrase=0;
   for(const p of doc.phrases){if(p.length>3&&(sequence===p||(" "+sequence+" ").includes(" "+p+" ")))phrase=Math.max(phrase,18);}
   let hits=0,points=0;
   for(const word of distinct){if(doc.keywords.has(word)){hits++;points+=doc.titleWords.has(word)?5:3;}}
   if(!phrase && distinct.size>=2 && hits<2)return 0;
   if(!phrase && !hits)return 0;
   if(!phrase && distinct.size>3 && hits/distinct.size<.45)return 0;
   return phrase+points+(hits/distinct.size)*8;
 }
 function search(text,limit){
   const words=tokens(text);
   if(!words.length)return [];
   let hits=prepared.map(doc=>({id:doc.id,title:doc.title,category:doc.category,description:doc.description,url:doc.url,score:rank(doc,words)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score || a.title.localeCompare(b.title,"pt-BR"));
   return Number.isInteger(limit)&&limit>0?hits.slice(0,limit):hits;
 }
 function list(){return prepared.map(({id,title,category,description,url})=>({id,title,category,description,url}));}
 return {search,list,normalize};
})();
