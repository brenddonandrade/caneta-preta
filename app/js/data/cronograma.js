// Cronograma até a prova (10/01/2027) — replanejado para começar em 20/11/2026 (7 semanas + largada).
// Seg–Sex: ~2h fragmentáveis (dá para fazer pelo celular em blocos de 15–20 min).
// Sáb–Dom: blocos longos (teoria pesada, listas e simulados).
// Prioridade: Física (90 pts) > Português (30) > Normas (20) > Inglês (10, mas não pode zerar).
// Física nuclear/radiação vem primeiro: é o núcleo da INB e reforça Normas (radioproteção).
window.CRONOGRAMA = [
  {
    ini: "2026-11-20", titulo: "Largada — Diagnóstico e Física Nuclear",
    fis: ["fis-nuc"], norm: ["norm-nuc"], port: "port-interp", ing: "ing-estrat",
    especial: {
      "2026-11-20": [
        "Importar o pacote FGV AMAZUL 2025 (Progresso → Dados → Importar pacote)",
        "Fazer o SIMULADO DIAGNÓSTICO (aba Simulado) — sem consultar nada, cerca de 2h",
      ],
      "2026-11-21": [
        "Revisar o diagnóstico: rever cada erro lendo a explicação",
        "Física — teoria: Física nuclear (decaimentos α/β/γ, meia-vida, atividade) (1h30)",
        "Física — questões de Física nuclear (40 min)",
        "Revisão espaçada: cards do dia",
      ],
      "2026-11-22": [
        "Separar material: livro de Física básica (Halliday/Tipler/Young) + apostila de radioproteção CNEN",
        "Normas — lei seca: princípios de proteção radiológica / CNEN (1h)",
        "Inglês — 1 texto técnico + questões (30 min)",
        "Revisão espaçada: cards do dia",
        "Olhar o plano da próxima semana (5 min)",
      ],
    },
  },
  {
    ini: "2026-11-23", titulo: "Semana 1 — Física Nuclear, Modelos Atômicos e Radioproteção",
    fis: ["fis-nuc", "fis-atom", "fis-nuc"], norm: ["norm-nuc", "norm-adm"], port: "port-interp", ing: "ing-estrat",
    dom: ["Caderno de erros da semana", "Resumo de 1 página: decaimentos, meia-vida, equilíbrio radioativo"],
  },
  {
    ini: "2026-11-30", titulo: "Semana 2 — Detectores, Dosimetria/Medição e Anticorrupção",
    fis: ["fis-det", "fis-med", "fis-det"], norm: ["norm-anticor", "norm-anticor"], port: "port-sint", ing: "ing-vocab",
    dom: ["SIMULADO 1 (4h cronometradas)", "Corrigir o simulado e registrar os erros"],
  },
  {
    ini: "2026-12-07", titulo: "Semana 3 — Mecânica, Dinâmica, LGPD e LAI",
    fis: ["fis-mec", "fis-din", "fis-din"], norm: ["norm-lgpd", "norm-lai"], port: "port-norma", ing: "ing-norm",
    dom: ["Caderno de erros da semana", "Revisão relâmpago de Física Nuclear e Detectores (só questões)"],
  },
  {
    ini: "2026-12-14", titulo: "Semana 4 — Hidrodinâmica/Energia, Termodinâmica, NR-01 e Meio Ambiente",
    fis: ["fis-hidro", "fis-termo", "fis-termo"], norm: ["norm-nr", "norm-amb"], port: "port-sem", ing: "ing-comp",
    dom: ["SIMULADO 2 (4h cronometradas)", "Corrigir o simulado e registrar os erros"],
  },
  {
    ini: "2026-12-21", titulo: "Semana 5 — Eletromagnetismo, Ondas e Qualidade",
    fis: ["fis-elmag", "fis-ondas", "fis-elmag"], norm: ["norm-qual", "norm-nuc"], port: "port-vocab", ing: "ing-vocab",
    dom: ["Caderno de erros da semana", "Revisão de Normas: todas as leis em questões"],
  },
  {
    ini: "2026-12-28", titulo: "Semana 6 — Ótica, Física Moderna e revisão dos pontos fracos",
    fis: ["fis-otica", "fis-moderna", "fis-moderna"], norm: ["norm-adm", "norm-lgpd"], port: "port-ling", ing: "ing-comp",
    dom: ["SIMULADO 3 (4h cronometradas)", "Listar os 5 tópicos com menor acerto (aba Progresso)"],
  },
  {
    ini: "2027-01-04", titulo: "Semana 7 — Reta final: só questões e erros",
    fis: ["fis-nuc", "fis-det", "fis-med"], norm: ["norm-nuc", "norm-adm"], port: "port-norma", ing: "ing-comp",
    especial: {
      "2027-01-06": ["SIMULADO 4 (último) — no horário da prova, 9h às 13h", "Corrigir e revisar só os erros"],
      "2027-01-09": ["Descanso. Leve: 20 min de cards, no máximo", "Separar documento com foto, caneta preta transparente, conferir local de prova", "Dormir cedo — portões fecham às 8h30"],
      "2027-01-10": ["PROVA — 9h às 13h. Chegue antes das 8h. Boa prova!"],
    },
  },
];
