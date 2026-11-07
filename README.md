# ✒️ Caneta Preta

Sistema gratuito de estudos para concursos, baseado nas técnicas com melhor evidência:
**prática de recuperação** (questões e flashcards), **revisão espaçada**, **prática intercalada**
e **simulados no formato real**. Primeiro alvo: **INB 2026 — Físico (FGV)**, prova em 10/01/2027.

## Rodar no computador
```bash
cd app
python3 -m http.server 8000
# abra http://localhost:8000
```

## Usar no celular
- **Mesma rede Wi-Fi:** rode o servidor acima e abra `http://IP-DO-PC:8000` no celular (`hostname -I` mostra o IP).
- **Em qualquer lugar (recomendado):** publicar a pasta `app/` no GitHub Pages (grátis). No celular, “Adicionar à tela inicial”: vira um app e funciona offline.

Os dados ficam **no navegador de cada aparelho**. Para levar o progresso de um aparelho para outro:
Progresso → Dados → **Exportar backup** e, no outro aparelho, **Importar backup**.

## Estrutura
```
app/
  index.html, css/style.css, sw.js (offline), manifest.webmanifest
  js/app.js                 lógica: cronograma, questões, revisão (SM-2), simulados, projeção de nota
  js/data/edital.js         edital verticalizado (matérias, pesos, tópicos)
  js/data/cronograma.js     plano de 9 semanas
  js/data/questoes.js       banco de questões (+ textos de apoio)
  js/data/flashcards.js     cards de revisão
referencias/editalINB.pdf
```

## Pacotes de questões
Em Progresso → Dados → **Importar pacote**, aceita um JSON:
```json
{ "nome": "Física Nuclear 1",
  "textos": { "txt-x": { "titulo": "Texto II", "corpo": "..." } },
  "questoes": [ { "id": "fn-001", "m": "fis", "top": "fis-nuc", "enun": "...",
                  "alts": ["...", "...", "...", "..."], "ans": 2, "exp": "...", "texto": "txt-x" } ],
  "flashcards": [ { "id": "c-x", "m": "fis", "top": "fis-nuc", "f": "frente", "v": "verso" } ] }
```
`m` ∈ port | ing | norm | fis; `top` = id de um tópico em `edital.js`.

Ao alterar arquivos do app, incremente `VERSAO` em `app/sw.js`.
