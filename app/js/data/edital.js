// Edital verticalizado — INB 2026 (FGV) — cargo: FÍSICO (nível superior)
// Fonte: referencias/editalINB.pdf, itens 9, 10 e Anexo I.
window.EDITAL = {
  concurso: "INB 2026 — Físico",
  banca: "FGV",
  dataProva: "2027-01-10",
  fimInscricao: "2026-11-11",
  duracaoMin: 240,
  corte: { especificas: 45, total: 75 },
  materias: [
    { id: "port", nome: "Língua Portuguesa", questoes: 10, peso: 3, modulo: "I" },
    { id: "ing", nome: "Língua Inglesa", questoes: 10, peso: 1, modulo: "I" },
    { id: "norm", nome: "Conhecimento de Normas", questoes: 10, peso: 2, modulo: "I" },
    { id: "fis", nome: "Conhecimentos Específicos (Física)", questoes: 30, peso: 3, modulo: "II" },
  ],
  topicos: [
    // ---------- Língua Portuguesa ----------
    { id: "port-interp", m: "port", t: "Interpretação e compreensão: estrutura, coesão, coerência, intertextualidade, modos de organização discursiva" },
    { id: "port-tipos", m: "port", t: "Tipos textuais (informativo, normativo, didático); textos literários e não literários; tipologia e estrutura da frase" },
    { id: "port-norma", m: "port", t: "Norma culta, problemas estruturais das frases, pontuação e sinais gráficos" },
    { id: "port-sint", m: "port", t: "Organização sintática: termos e orações, ordem direta/inversa, tipos de discurso" },
    { id: "port-ling", m: "port", t: "Linguagem: registros, funções, atos de comunicação, formação de palavras, abreviações, classes de palavras, modalizadores" },
    { id: "port-sem", m: "port", t: "Semântica: sentido próprio/figurado, sinônimos, antônimos, parônimos, hiperônimos, polissemia, ambiguidade" },
    { id: "port-vocab", m: "port", t: "Dicionários e verbetes; vocabulário (neologismos, arcaísmos, estrangeirismos, latinismos); ortografia e acentuação" },
    // ---------- Língua Inglesa ----------
    { id: "ing-comp", m: "ing", t: "Compreensão de textos técnicos/institucionais, ideia principal, inferência, gráficos e tabelas" },
    { id: "ing-vocab", m: "ing", t: "Vocabulário técnico: prefixos/sufixos, cognatos e falsos cognatos, expressões técnicas" },
    { id: "ing-estrat", m: "ing", t: "Estratégias de leitura: skimming, scanning, palavras-chave, marcadores discursivos" },
    { id: "ing-norm", m: "ing", t: "Textos normativos e técnicos: linguagem regulatória, segurança, qualidade e conformidade" },
    // ---------- Conhecimento de Normas ----------
    { id: "norm-adm", m: "norm", t: "Art. 37 da CF; responsabilidade de empregados públicos; Processo administrativo (Lei 9.784/1999)" },
    { id: "norm-anticor", m: "norm", t: "Lei Anticorrupção 12.846/2013 e Decreto 11.129/2022; Improbidade (Lei 14.230/2021)" },
    { id: "norm-lai", m: "norm", t: "Lei de Acesso à Informação 12.527/2011; conflito de interesses; governança corporativa" },
    { id: "norm-lgpd", m: "norm", t: "LGPD 13.709/2018: dados pessoais e sensíveis, bases legais; noções de segurança da informação" },
    { id: "norm-nuc", m: "norm", t: "ANSN e CNEN; princípios de proteção radiológica; segurança em instalações nucleares; controle de materiais nucleares" },
    { id: "norm-nr", m: "norm", t: "NR-01 (Disposições gerais e Gerenciamento de Riscos); prevenção de acidentes industriais" },
    { id: "norm-amb", m: "norm", t: "Lei 6.938/1981 (PNMA); licenciamento; responsabilidade ambiental; resíduos industriais; sustentabilidade" },
    { id: "norm-qual", m: "norm", t: "Normas técnicas industriais: qualidade e gestão de processos" },
    // ---------- Física (Módulo II) ----------
    { id: "fis-mec", m: "fis", t: "1. Mecânica: cinemática (MRU, MRUV, queda livre, gráficos), projéteis, MCU" },
    { id: "fis-din", m: "fis", t: "2. Dinâmica: Leis de Newton, atrito, tração, força centrípeta, torque e equilíbrio" },
    { id: "fis-ondas", m: "fis", t: "3. Ondas: oscilações, ondas sonoras, oscilações eletromagnéticas, circuitos CA" },
    { id: "fis-otica", m: "fis", t: "4. Ótica: equações de Maxwell, ondas eletromagnéticas e luz, interferência, difração, polarização" },
    { id: "fis-hidro", m: "fis", t: "5. Hidrodinâmica e energia: pressão, Pascal, Arquimedes, Bernoulli, vazão; trabalho, potência, conservação de energia" },
    { id: "fis-termo", m: "fis", t: "6. Termodinâmica: temperatura, dilatação, calorimetria, mudanças de fase, 1ª e 2ª Leis, entropia" },
    { id: "fis-elmag", m: "fis", t: "7. Eletromagnetismo: corrente, resistores, ddp, potência, medidores; campo magnético, ímãs, eletroímãs" },
    { id: "fis-moderna", m: "fis", t: "8. Física moderna: relatividade restrita, introdução à quântica, dualidade onda-partícula" },
    { id: "fis-nuc", m: "fis", t: "9a. Física nuclear: decaimentos α/β/γ, equilíbrio radioativo, reações nucleares, fissão, fontes de radiação" },
    { id: "fis-det", m: "fis", t: "9b. Interação radiação-matéria; detectores (gás, cintilação, semicondutores)" },
    { id: "fis-atom", m: "fis", t: "9c. Modelos atômicos, íons, tabela periódica, propriedades periódicas, ligações iônicas/metálicas/moleculares" },
    { id: "fis-med", m: "fis", t: "10. Medição: grandezas e unidades de dosimetria; incertezas, desvio padrão, fator de abrangência, intervalo de confiança, exatidão × precisão" },
  ],
};
