# Padrão oficial dos artigos — Dr. Pedro Simplício

## Regra de identidade visual
Cada artigo fica em `biblioteca/NOME-DO-ARTIGO.html` e deve copiar a estrutura de `modelos/modelo-artigo.html`.
**Nunca** criar outro cabeçalho, CSS isolado, cores novas ou controles próprios de acessibilidade.

Todo artigo deve carregar, exatamente nesta ordem:
```html
<link rel="stylesheet" href="/site-shared.css"/>
<link rel="stylesheet" href="/biblioteca/biblioteca.css"/>
```
E, antes do `</body>`:
```html
<script defer src="/biblioteca/biblioteca.js"></script>
```

- `site-shared.css` é o CSS de identidade do site inteiro (cabeçalho, marca, fontes e navegação).
- `biblioteca/biblioteca.css` cuida **apenas** do conteúdo editorial dos artigos.
- `biblioteca/biblioteca.js` tem menu, controle A−/A+ e busca da biblioteca.
- Mantenha `<body class="library-page">` e o cabeçalho idêntico ao da biblioteca.
- **Não** copiar CSS para dentro de HTML e **não** referenciar `assets/style.css`, `identidade-site.css`, `editorial-ajustes.css` ou `biblioteca-estilos.css`.
- O ajuste de letras usa a chave de preferência `pedro-leitura-nivel`, também usada na página inicial.

## Como publicar um artigo novo
1. Copie `modelos/modelo-artigo.html` para `biblioteca/slug-do-artigo.html`.
2. Edite apenas título HTML, meta description, categoria, subtítulo, resposta rápida e corpo do artigo.
3. **Remova** `<meta name="robots" content="noindex,nofollow"/>` do artigo definitivo.
4. Confirme as informações clínicas, revise as fontes e personalize a resposta sem repetir conteúdo de outra página.
5. Crie um item `<a class="story" href="slug-do-artigo.html" data-search="...">...</a>` na categoria correta de `biblioteca/index.html`; atualize a contagem de artigos.
6. Verifique imagens e links, inclusive a experiência no celular e os botões A− / A+.
7. Verifique se a tarefa **Validar Biblioteca** do GitHub Actions passou.

## Metadados e SEO
- Cada artigo tem endereço próprio e apenas um `<h1>`; título e descrição diferentes dos outros.
- Só adicionar canonical depois de confirmar o domínio definitivo.
- Não inventar relatos de pacientes, depoimentos ou resultados.
- Não usar palavras-chave repetidas artificialmente; priorizar a resposta à dúvida real.
- Manter a autoria profissional e revisar periodicamente o conteúdo clínico.

## Diagnóstico rápido de falha
- Página sem formatação: conferir os caminhos **absolutos** dos dois CSS e se existem no repositório.
- Cabeçalho diferente: copiar o cabeçalho oficial, nunca reconstruí-lo manualmente.
- Menu ou leitura sem funcionar: conferir `/biblioteca/biblioteca.js`.
- Artigo sem aparecer na lista: conferir o link no `biblioteca/index.html`.


## Busca por linguagem do paciente (obrigatório ao criar novo artigo)
A pesquisa da página inicial e a da biblioteca usam o mesmo dicionário em `/busca-inteligente.js`. O dicionário ajuda **apenas a busca interna**; não deve ser utilizado para esconder palavras-chave na página.

Para cada artigo novo:
1. Acrescente uma entrada ao catálogo em `busca-inteligente.js` com o slug do arquivo, título, categoria e descrição reais.
2. Registre termos populares e frases que os pacientes usam (por exemplo, "chapa cai" para uma dentadura solta). Associe apenas dúvidas realmente atendidas pelo artigo.
3. Inclua um link para o novo arquivo no índice `biblioteca/index.html`, dentro da categoria correta, e atualize a contagem.
4. Crie exemplos de pesquisa no arquivo `scripts/testar-busca.mjs`, verificando o artigo mais relevante e uma consulta que **não** deveria retornar resultado.
5. Verifique as duas pesquisas: `/#duvidas` e `/biblioteca/`. A busca deve mostrar conteúdos existentes, nunca afirmar um diagnóstico ou prometer tratamento.

Evite adicionar termos médicos e populares desconexos apenas para aumentar a quantidade de resultados. Se o tema ainda não tiver artigo, o correto é informar que o conteúdo não está disponível.

