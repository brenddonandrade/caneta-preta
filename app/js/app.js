/* Caneta Preta — sistema de estudos para concursos.
 * App estático (sem build). Dados ficam no navegador (localStorage); use Exportar/Importar para sincronizar.
 */
(function () {
  "use strict";

  const E = window.EDITAL, CR = window.CRONOGRAMA;
  const KEY = "canetaPreta.v1";
  const MAT = Object.fromEntries(E.materias.map((m) => [m.id, m]));
  const TOP = Object.fromEntries(E.topicos.map((t) => [t.id, t]));
  const LETRAS = ["A", "B", "C", "D", "E"];
  const STATUS = [
    ["nao", "Não vi"],
    ["estudando", "Estudando"],
    ["revisar", "Revisar"],
    ["ok", "Dominado"],
  ];

  // ---------------- estado ----------------
  function vazio() {
    return { v: 1, topics: {}, qstats: {}, cards: {}, plan: {}, sims: [], simAtual: null, daily: {}, packs: [], settings: { novosPorDia: 10 } };
  }
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      if (s && s.v === 1) return Object.assign(vazio(), s);
    } catch (e) {}
    return vazio();
  }
  let S = load();
  function save() {
    try { localStorage.setItem(KEY, JSON.stringify(S)); }
    catch (e) { toast("Não foi possível salvar no navegador. Exporte um backup."); }
  }

  // ---------------- datas ----------------
  const pad = (n) => String(n).padStart(2, "0");
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  const parse = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d); };
  const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
  const hoje = () => iso(new Date());
  const diff = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
  const DIAS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
  const fmtData = (s) => { const d = parse(s); return `${DIAS[d.getDay()]} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}`; };

  // ---------------- utilitários ----------------
  const h = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const fmt = (s) => h(s).replace(/\n/g, "<br>");
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const shuffle = (a) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const $ = (sel) => document.querySelector(sel);
  function toast(msg) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove("show"), 2600);
  }

  // ---------------- conteúdo (base + pacotes importados) ----------------
  function todasQuestoes() {
    const extra = S.packs.flatMap((p) => p.questoes || []);
    const seen = new Set(); const out = [];
    for (const q of window.QUESTOES.concat(extra)) if (!seen.has(q.id)) { seen.add(q.id); out.push(q); }
    return out;
  }
  function todosCards() {
    const extra = S.packs.flatMap((p) => p.flashcards || []);
    const seen = new Set(); const out = [];
    for (const c of window.FLASHCARDS.concat(extra)) if (!seen.has(c.id)) { seen.add(c.id); out.push(c); }
    return out;
  }
  const qPorId = (id) => todasQuestoes().find((q) => q.id === id);
  const textos = () => Object.assign({}, window.TEXTOS, ...S.packs.map((p) => p.textos || {}));

  // ---------------- cronograma ----------------
  function semanaDe(date) { let w = null; for (const x of CR) if (x.ini <= date) w = x; return w; }
  const nomeTop = (id) => (TOP[id] ? TOP[id].t : id);
  function tarefasDe(date) {
    const w = semanaDe(date);
    if (!w || date > E.dataProva) return [];
    const mk = (txt, link) => ({ txt, link: link || (/SIMULADO/.test(txt) ? "#simulado" : /cards/.test(txt) ? "#revisao" : null) });
    if (w.especial && w.especial[date]) return w.especial[date].map((t) => mk(t));
    const dow = parse(date).getDay();
    const t = [];
    if (dow >= 1 && dow <= 5) t.push(mk("Revisão espaçada: cards do dia (15–20 min)", "#revisao"));
    if (dow === 1 || dow === 3 || dow === 5) {
      const f = w.fis[[1, 3, 5].indexOf(dow) % w.fis.length];
      t.push(mk(`Física — teoria: ${nomeTop(f)} (40 min)`));
      t.push(mk(`Física — questões do tópico (40 min)`, `#questoes/${f}`));
    }
    if (dow === 2 || dow === 4) {
      const n = w.norm[(dow === 2 ? 0 : 1) % w.norm.length];
      t.push(mk(`Normas — lei seca + resumo: ${nomeTop(n)} (40 min)`));
      t.push(mk(`Normas — questões (25 min)`, `#questoes/${n}`));
      t.push(mk(`Física — questões mistas dos tópicos já vistos (20 min)`, "#questoes/fis"));
    }
    if (dow >= 1 && dow <= 5) t.push(mk(`Português — ${nomeTop(w.port)} (20 min)`, `#questoes/${w.port}`));
    if (dow === 6) {
      const fs = [...new Set(w.fis)].map((id) => nomeTop(id).split(":")[0]).join(", ");
      t.push(mk(`Física — bloco longo: aprofundar ${fs} + lista de exercícios (2h)`));
      t.push(mk(`Português — questões FGV: ${nomeTop(w.port)} (40 min)`, `#questoes/${w.port}`));
      t.push(mk(`Inglês — 1 texto técnico + questões: ${nomeTop(w.ing)} (30 min)`, `#questoes/${w.ing}`));
      t.push(mk("Revisão espaçada: cards do dia", "#revisao"));
    }
    if (dow === 0) {
      (w.dom || []).forEach((x) => t.push(mk(x)));
      t.push(mk("Revisão espaçada: cards do dia", "#revisao"));
      t.push(mk("Olhar o plano da próxima semana (5 min)", "#plano"));
    }
    return t;
  }
  const tarefaKey = (date, i) => `${date}#${i}`;

  // ---------------- revisão espaçada (SM-2 simplificado) ----------------
  function cardsDevidos() {
    const d = hoje();
    return Object.entries(S.cards).filter(([, c]) => c.due <= d).map(([id]) => id);
  }
  function cardsNovosHoje() {
    const usados = (S.daily[hoje()] || {}).novos || 0;
    const lim = Math.max(0, (S.settings.novosPorDia ?? 10) - usados);
    return todosCards().filter((c) => !S.cards["f:" + c.id]).slice(0, lim).map((c) => "f:" + c.id);
  }
  function agendar(id, nota) {
    // nota: 0 errei, 1 difícil, 2 bom, 3 fácil
    const c = S.cards[id] || { reps: 0, int: 0, ease: 2.5, lapses: 0 };
    if (!S.cards[id] && id.startsWith("f:")) {
      const d = (S.daily[hoje()] = S.daily[hoje()] || {}); d.novos = (d.novos || 0) + 1;
    }
    if (nota === 0) { c.reps = 0; c.lapses++; c.int = 1; c.ease = Math.max(1.3, c.ease - 0.2); }
    else {
      let base = c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.int * c.ease);
      if (nota === 1) { base = Math.max(1, Math.round((c.int || 1) * 1.2)); c.ease = Math.max(1.3, c.ease - 0.15); }
      if (nota === 3) { base = Math.round(base * 1.3) + 1; c.ease += 0.15; }
      c.int = Math.max(1, base); c.reps++;
    }
    c.due = addDays(hoje(), c.int);
    S.cards[id] = c;
    save();
  }

  // ---------------- estatísticas ----------------
  function registrarResposta(q, escolha) {
    const ok = escolha === q.ans;
    const st = (S.qstats[q.id] = S.qstats[q.id] || { n: 0, ok: 0 });
    st.n++; if (ok) st.ok++; st.last = ok; st.ts = Date.now();
    if (!ok) S.cards["q:" + q.id] = { reps: 0, int: 1, ease: 2.3, lapses: (S.cards["q:" + q.id]?.lapses || 0) + 1, due: addDays(hoje(), 1) };
    save();
    return ok;
  }
  function statsPor(filtro) {
    let n = 0, ok = 0;
    for (const q of todasQuestoes()) {
      if (!filtro(q)) continue;
      const s = S.qstats[q.id]; if (s) { n += s.n; ok += s.ok; }
    }
    return { n, ok, p: pct(ok, n) };
  }
  function projecao() {
    let total = 0, esp = 0, temDados = true;
    const linhas = E.materias.map((m) => {
      const s = statsPor((q) => q.m === m.id);
      if (!s.n) temDados = false;
      const pts = (s.p / 100) * m.questoes * m.peso;
      total += pts; if (m.modulo === "II") esp += pts;
      return { m, s, pts };
    });
    return { linhas, total, esp, temDados };
  }

  // ---------------- views ----------------
  const views = {};

  views.hoje = () => {
    const d = hoje();
    const faltam = diff(d, E.dataProva);
    const w = semanaDe(d);
    const tarefas = tarefasDe(d);
    const feitas = tarefas.filter((_, i) => S.plan[tarefaKey(d, i)]).length;
    const dev = cardsDevidos().length, nov = cardsNovosHoje().length;
    const fezDiag = S.sims.some((s) => s.tipo === "diag");
    let html = `<section class="hero">
      <div class="big">${faltam > 0 ? faltam : 0}</div><div>dias para a prova<br><small>${fmtData(E.dataProva)}/2027 · 9h–13h</small></div>
    </section>`;
    if (d <= E.fimInscricao) html += `<div class="alerta">⚠️ Inscrições até <b>11/11 às 16h</b> e boleto até <b>12/11</b> — <a href="https://conhecimento.fgv.br/processoseletivo/inb2026" target="_blank" rel="noopener">site da FGV</a></div>`;
    if (w) html += `<h2>${h(w.titulo)}</h2>`;
    html += `<div class="card"><div class="row"><h3>Hoje · ${fmtData(d)}</h3><span class="muted">${feitas}/${tarefas.length}</span></div>
      <div class="bar"><i style="width:${pct(feitas, tarefas.length)}%"></i></div>
      ${tarefas.length ? listaTarefas(d, tarefas) : `<p class="muted">Sem tarefas planejadas para hoje.</p>`}</div>`;
    html += `<div class="grid2">
      <a class="tile" href="#revisao"><b>${dev + nov}</b><span>cards para revisar<br><small>${dev} devidos · ${nov} novos</small></span></a>
      <button class="tile" data-a="praticar" data-f="mix"><b>10</b><span>questões mistas<br><small>intercaladas</small></span></button>
    </div>`;
    if (!fezDiag) html += `<div class="card destaque"><h3>Comece pelo diagnóstico</h3><p>41 questões cobrindo as 4 matérias. Mostra onde você está e ajusta suas prioridades. ~2h30, pode pausar e continuar depois.</p><button class="btn" data-a="iniciarSim" data-tipo="diag">Fazer diagnóstico</button></div>`;
    return html;
  };

  function listaTarefas(d, tarefas) {
    return `<ul class="tarefas">${tarefas.map((t, i) => {
      const k = tarefaKey(d, i);
      return `<li class="${S.plan[k] ? "ok" : ""}"><label><input type="checkbox" data-a="tarefa" data-k="${k}" ${S.plan[k] ? "checked" : ""}><span>${h(t.txt)}</span></label>${t.link ? `<a class="ir" href="${t.link}">ir →</a>` : ""}</li>`;
    }).join("")}</ul>`;
  }

  views.plano = () => {
    const d = hoje();
    const atual = semanaDe(d);
    let html = `<h2>Cronograma</h2><p class="muted">Seg–sex: ~2h em blocos curtos (dá pra fazer no celular). Fim de semana: blocos longos e simulados.</p>`;
    CR.forEach((w, wi) => {
      const fim = CR[wi + 1] ? addDays(CR[wi + 1].ini, -1) : E.dataProva;
      let dias = [], tot = 0, ok = 0;
      for (let x = w.ini; x <= fim; x = addDays(x, 1)) {
        const t = tarefasDe(x); tot += t.length;
        ok += t.filter((_, i) => S.plan[tarefaKey(x, i)]).length;
        dias.push(`<details ${x === d ? "open" : ""}><summary>${fmtData(x)}${x === d ? " · <b>hoje</b>" : ""} <span class="muted">${t.filter((_, i) => S.plan[tarefaKey(x, i)]).length}/${t.length}</span></summary>${listaTarefas(x, t)}</details>`);
      }
      html += `<details class="card semana" ${w === atual ? "open" : ""}><summary><b>${h(w.titulo)}</b><span class="muted"> ${pct(ok, tot)}%</span><div class="bar"><i style="width:${pct(ok, tot)}%"></i></div></summary>${dias.join("")}</details>`;
    });
    return html;
  };

  // ---- prática de questões ----
  let sessao = null; // { qs:[ids], i, resp:{}, filtro }
  function filtroFn(f) {
    if (!f || f === "mix") return () => true;
    if (MAT[f]) return (q) => q.m === f;
    return (q) => q.top === f;
  }
  function escolher(f, n) {
    const pool = todasQuestoes().filter(filtroFn(f));
    const prio = (q) => { const s = S.qstats[q.id]; if (!s) return 0; if (s.last === false) return 1; return 2 + s.ok / s.n; };
    const ord = shuffle(pool).sort((a, b) => Math.floor(prio(a)) - Math.floor(prio(b)));
    let sel = ord.slice(0, n);
    if (f === "mix") sel = shuffle(sel); // intercalado
    return sel.map((q) => q.id);
  }

  views.questoes = (arg) => {
    if (sessao) return telaQuestao();
    const f = arg || "mix";
    const pool = todasQuestoes().filter(filtroFn(f));
    const nunca = pool.filter((q) => !S.qstats[q.id]).length;
    const erradas = pool.filter((q) => S.qstats[q.id]?.last === false).length;
    const chips = [["mix", "Misturado"], ...E.materias.map((m) => [m.id, m.nome.replace("Conhecimentos Específicos (Física)", "Física")])]
      .map(([id, n]) => `<a class="chip ${f === id || (TOP[f] && TOP[f].m === id) ? "on" : ""}" href="#questoes/${id}">${h(n)}</a>`).join("");
    const mSel = MAT[f] ? f : TOP[f] ? TOP[f].m : null;
    const topSel = mSel ? `<select data-a="filtroTop"><option value="${mSel}">Todos os tópicos</option>${E.topicos.filter((t) => t.m === mSel).map((t) => {
      const c = todasQuestoes().filter((q) => q.top === t.id).length;
      return `<option value="${t.id}" ${f === t.id ? "selected" : ""}>${h(t.t)} (${c})</option>`;
    }).join("")}</select>` : "";
    return `<h2>Questões</h2><div class="chips">${chips}</div>${topSel}
      <div class="card"><p><b>${pool.length}</b> questões neste filtro · ${nunca} inéditas · ${erradas} erradas na última tentativa</p>
      ${pool.length ? `<div class="row gap"><button class="btn" data-a="praticar" data-f="${f}" data-n="10">Praticar 10</button><button class="btn sec" data-a="praticar" data-f="${f}" data-n="5">Rápido: 5</button></div>` : `<p class="muted">Ainda não há questões deste tópico. Importe um pacote em Progresso → Dados.</p>`}
      <p class="muted small">Prioridade: inéditas → erradas → menor taxa de acerto. Errou? A questão vira card de revisão para amanhã.</p></div>`;
  };

  function blocoQuestao(q, escolha, revelar, acao) {
    const tx = q.texto && textos()[q.texto];
    return `${q.src ? `<p class="src">${h(q.src)}</p>` : ""}${tx ? `<details class="texto" open><summary>${h(tx.titulo)}</summary><p>${fmt(tx.corpo)}</p></details>` : ""}
      <p class="enun">${fmt(q.enun)}</p>
      <div class="alts">${q.alts.map((a, i) => {
        let cls = "";
        if (revelar) cls = i === q.ans ? "certa" : i === escolha ? "errada" : "";
        else if (i === escolha) cls = "marcada";
        return `<button class="alt ${cls}" data-a="${acao}" data-i="${i}" ${revelar ? "disabled" : ""}><b>${LETRAS[i]}</b><span>${fmt(a)}</span></button>`;
      }).join("")}</div>
      ${revelar ? `<div class="exp ${escolha === q.ans ? "ok" : "no"}"><b>${escolha === q.ans ? "Certo!" : escolha == null ? "Gabarito: " + LETRAS[q.ans] : "Errado — gabarito " + LETRAS[q.ans]}</b><p>${fmt(q.exp || "")}</p></div>` : ""}`;
  }

  function telaQuestao() {
    if (sessao.i >= sessao.qs.length) {
      const ok = sessao.qs.filter((id) => sessao.resp[id] === qPorId(id).ans).length;
      return `<h2>Resultado</h2><div class="card"><div class="big">${ok}/${sessao.qs.length}</div><p>${pct(ok, sessao.qs.length)}% de acerto. ${sessao.qs.length - ok ? "Os erros entraram na fila de revisão de amanhã." : "Perfeito!"}</p>
        <div class="row gap"><button class="btn" data-a="praticar" data-f="${sessao.filtro}" data-n="${sessao.qs.length}">Mais ${sessao.qs.length}</button><button class="btn sec" data-a="sairSessao">Voltar</button></div></div>`;
    }
    const q = qPorId(sessao.qs[sessao.i]);
    const r = sessao.resp[q.id];
    return `<div class="row"><span class="muted">${sessao.i + 1}/${sessao.qs.length} · ${h(MAT[q.m].nome)}</span><button class="link" data-a="sairSessao">sair</button></div>
      <div class="bar"><i style="width:${pct(sessao.i, sessao.qs.length)}%"></i></div>
      <div class="card"><p class="muted small">${h(nomeTop(q.top))}</p>${blocoQuestao(q, r, r != null, "responder")}</div>
      ${r != null ? `<button class="btn full" data-a="proxima">Próxima →</button>` : ""}`;
  }

  // ---- revisão ----
  let fila = null; // { ids:[], i, virado, escolha }
  views.revisao = () => {
    if (!fila || fila.i >= fila.ids.length) {
      const dev = cardsDevidos(), nov = cardsNovosHoje();
      const feito = fila && fila.ids.length;
      fila = null;
      const total = Object.keys(S.cards).length;
      return `<h2>Revisão espaçada</h2><div class="card">
        ${feito ? `<p>✅ Sessão concluída.</p>` : ""}
        <p><b>${dev.length}</b> devidos hoje · <b>${nov.length}</b> novos disponíveis · ${total} cards em estudo</p>
        ${dev.length + nov.length ? `<button class="btn" data-a="iniciarRev">Começar (${dev.length + nov.length})</button>` : `<p class="muted">Nada para hoje. Volte amanhã — ou faça questões, os erros viram cards.</p>`}
        <p class="muted small">Lembre ativamente a resposta ANTES de virar. Depois avalie com honestidade: errar aqui é barato, errar na prova não.</p></div>`;
    }
    const id = fila.ids[fila.i];
    let corpo;
    if (id.startsWith("q:")) {
      const q = qPorId(id.slice(2));
      if (!q) { fila.i++; return views.revisao(); }
      corpo = `<p class="muted small">Questão que você errou · ${h(nomeTop(q.top))}</p>${blocoQuestao(q, fila.escolha, fila.virado, "revEscolha")}`;
    } else {
      const c = todosCards().find((x) => "f:" + x.id === id);
      if (!c) { fila.i++; return views.revisao(); }
      corpo = `<p class="muted small">${h(nomeTop(c.top))}${S.cards[id] ? "" : " · novo"}</p><p class="frente">${fmt(c.f)}</p>${fila.virado ? `<hr><p class="verso">${fmt(c.v)}</p>` : ""}`;
    }
    const c = S.cards[id] || { reps: 0, int: 0, ease: 2.5 };
    const prev = (n) => { const r = n === 0 ? 1 : n === 1 ? Math.max(1, Math.round((c.int || 1) * 1.2)) : c.reps === 0 ? 1 : c.reps === 1 ? 3 : Math.round(c.int * c.ease); return n === 3 ? Math.round(r * 1.3) + 1 : r; };
    return `<div class="row"><span class="muted">${fila.i + 1}/${fila.ids.length}</span><button class="link" data-a="sairRev">sair</button></div>
      <div class="bar"><i style="width:${pct(fila.i, fila.ids.length)}%"></i></div>
      <div class="card">${corpo}</div>
      ${fila.virado
        ? `<div class="notas">${["Errei", "Difícil", "Bom", "Fácil"].map((n, i) => `<button class="nota n${i}" data-a="nota" data-n="${i}">${n}<small>${prev(i)}d</small></button>`).join("")}</div>`
        : `<button class="btn full" data-a="virar">Mostrar resposta</button>`}`;
  };

  // ---- simulado ----
  let timer = null, acabouDeEntregar = false;
  function montarSim(tipo) {
    const qs = todasQuestoes();
    if (tipo === "diag") return { tipo, nome: "Diagnóstico", qids: E.materias.flatMap((m) => qs.filter((q) => q.diag && q.m === m.id).map((q) => q.id)), lim: 150 };
    // formato real: 10/10/10/30, completando com o que houver
    const qids = E.materias.flatMap((m) => {
      const pool = qs.filter((q) => q.m === m.id);
      const inedit = shuffle(pool.filter((q) => !S.qstats[q.id])), resto = shuffle(pool.filter((q) => S.qstats[q.id]));
      // mantém juntas as questões que compartilham texto de apoio
      return inedit.concat(resto).slice(0, m.questoes).sort((a, b) => (a.texto || "~").localeCompare(b.texto || "~")).map((q) => q.id);
    });
    return { tipo, nome: "Simulado formato FGV", qids, lim: E.duracaoMin };
  }
  views.simulado = () => {
    const sa = S.simAtual;
    if (sa) {
      const q = qPorId(sa.qids[sa.i]);
      const resp = Object.keys(sa.resp).length;
      return `<div class="row"><b>${h(sa.nome)}</b><span id="timer" class="timer"></span></div>
        <div class="navq">${sa.qids.map((id, i) => `<button class="${i === sa.i ? "cur" : ""} ${sa.resp[id] != null ? "resp" : ""}" data-a="simIr" data-i="${i}">${i + 1}</button>`).join("")}</div>
        <div class="card"><p class="muted small">Questão ${sa.i + 1}/${sa.qids.length} · ${h(MAT[q.m].nome)}</p>${blocoQuestao(q, sa.resp[q.id], false, "simResp")}</div>
        <div class="row gap"><button class="btn sec" data-a="simIr" data-i="${sa.i - 1}" ${sa.i ? "" : "disabled"}>← Anterior</button>
        ${sa.i < sa.qids.length - 1 ? `<button class="btn" data-a="simIr" data-i="${sa.i + 1}">Próxima →</button>` : ""}</div>
        <button class="btn full fim" data-a="simFim">Entregar (${resp}/${sa.qids.length} respondidas)</button>
        <p class="muted small">O progresso é salvo automaticamente — pode fechar e continuar depois.</p>`;
    }
    const ult = S.sims.slice().reverse();
    const nQ = todasQuestoes().length;
    let topo = "";
    if (acabouDeEntregar && S.sims.length) {
      topo = `<h2>Resultado</h2>${cartaoResultado(S.sims[S.sims.length - 1], S.sims.length - 1)}<p class="muted small">Próximo passo: “Rever questões” e ler a explicação de cada erro. Eles já estão na fila de revisão.</p>`;
      acabouDeEntregar = false;
    }
    return `${topo}<h2>Simulados</h2>
      <div class="card"><h3>Diagnóstico</h3><p>41 questões de todas as matérias, sem feedback até o fim. Gera sua projeção de nota.</p><button class="btn" data-a="iniciarSim" data-tipo="diag">Iniciar diagnóstico</button></div>
      <div class="card"><h3>Formato da prova</h3><p>10 Português · 10 Inglês · 10 Normas · 30 Física, 4h. Prioriza questões inéditas.</p>
      ${nQ < 60 ? `<p class="muted small">O banco tem ${nQ} questões; o simulado completo precisa de 60. Importe mais pacotes em Progresso → Dados.</p>` : ""}
      <button class="btn sec" data-a="iniciarSim" data-tipo="fgv">Iniciar simulado</button></div>
      ${ult.length ? `<h3>Histórico</h3>${ult.map((s, i) => cartaoResultado(s, S.sims.length - 1 - i)).join("")}` : ""}`;
  };
  function corrigir(sa) {
    const por = {};
    for (const id of sa.qids) {
      const q = qPorId(id); if (!q) continue;
      const p = (por[q.m] = por[q.m] || { n: 0, ok: 0 });
      p.n++; if (sa.resp[id] === q.ans) p.ok++;
    }
    let total = 0, esp = 0, zerou = false;
    const linhas = E.materias.map((m) => {
      const p = por[m.id] || { n: 0, ok: 0 };
      const proj = p.n ? (p.ok / p.n) * m.questoes * m.peso : 0;
      if (p.n && !p.ok) zerou = true;
      total += proj; if (m.modulo === "II") esp += proj;
      return { id: m.id, n: p.n, ok: p.ok, proj: Math.round(proj * 10) / 10 };
    });
    return { linhas, total: Math.round(total * 10) / 10, esp: Math.round(esp * 10) / 10, zerou };
  }
  function cartaoResultado(s, idx) {
    const r = s.res;
    const aprov = r.esp >= E.corte.especificas && r.total >= E.corte.total && !r.zerou;
    return `<div class="card"><div class="row"><b>${h(s.nome)}</b><span class="muted">${s.data ? fmtData(s.data) : ""} · ${Math.round(s.seg / 60)} min</span></div>
      <div class="placar ${aprov ? "ok" : "no"}"><div><b>${r.total}</b>/150<small>projeção total (corte 75)</small></div><div><b>${r.esp}</b>/90<small>específicas (corte 45)</small></div></div>
      <table><tr><th>Matéria</th><th>Acertos</th><th>Pontos proj.</th></tr>${r.linhas.map((l) => `<tr><td>${h(MAT[l.id].nome.replace("Conhecimentos Específicos (Física)", "Física"))}</td><td>${l.ok}/${l.n} (${pct(l.ok, l.n)}%)</td><td>${l.proj}/${MAT[l.id].questoes * MAT[l.id].peso}</td></tr>`).join("")}</table>
      ${r.zerou ? `<p class="alerta">Zerou alguma matéria — isso elimina na prova real.</p>` : ""}
      <button class="btn sec" data-a="verSim" data-i="${idx}">Rever questões</button></div>`;
  }
  let revSim = null;
  views.gabarito = () => {
    const s = S.sims[revSim]; if (!s) return views.simulado();
    return `<div class="row"><h2>${h(s.nome)} — gabarito</h2><a class="link" href="#simulado">voltar</a></div>` +
      s.qids.map((id, i) => { const q = qPorId(id); return q ? `<div class="card"><p class="muted small">${i + 1} · ${h(nomeTop(q.top))}</p>${blocoQuestao(q, s.resp[id], true, "nada")}</div>` : ""; }).join("");
  };

  // ---- progresso ----
  views.progresso = () => {
    const pj = projecao();
    const totQ = Object.values(S.qstats).reduce((a, s) => a + s.n, 0);
    let html = `<h2>Progresso</h2>
      <div class="card"><h3>Nota projetada</h3>
      ${totQ ? `<div class="placar ${pj.esp >= E.corte.especificas && pj.total >= E.corte.total ? "ok" : "no"}"><div><b>${pj.total.toFixed(0)}</b>/150<small>total (corte 75)</small></div><div><b>${pj.esp.toFixed(0)}</b>/90<small>específicas (corte 45)</small></div></div>
      ${pj.temDados ? "" : `<p class="muted small">Alguma matéria ainda sem questões respondidas — a projeção conta 0 nela.</p>`}` : `<p class="muted">Responda questões para ver a projeção.</p>`}
      <table><tr><th>Matéria</th><th>Q×peso</th><th>Acerto</th><th>Pts</th></tr>${pj.linhas.map((l) => `<tr><td>${h(l.m.nome.replace("Conhecimentos Específicos (Física)", "Física"))}</td><td>${l.m.questoes}×${l.m.peso}</td><td>${l.s.n ? l.s.p + "%" : "—"}</td><td>${l.pts.toFixed(0)}</td></tr>`).join("")}</table>
      <p class="muted small">${totQ} respostas · ${Object.keys(S.cards).length} cards em estudo</p></div>
      <h2>Edital verticalizado</h2><p class="muted small">Marque o status de cada tópico. A taxa de acerto vem das suas questões.</p>`;
    for (const m of E.materias) {
      html += `<details class="card" ${m.id === "fis" ? "open" : ""}><summary><b>${h(m.nome)}</b> <span class="muted">· ${m.questoes} questões × peso ${m.peso}</span></summary><ul class="topicos">`;
      for (const t of E.topicos.filter((x) => x.m === m.id)) {
        const s = statsPor((q) => q.top === t.id);
        const st = S.topics[t.id] || "nao";
        html += `<li><div>${h(t.t)}<small class="${s.n ? (s.p >= 70 ? "bom" : s.p >= 50 ? "medio" : "ruim") : "muted"}">${s.n ? `${s.p}% (${s.ok}/${s.n})` : "sem questões"}</small></div>
          <select data-a="statusTop" data-t="${t.id}" class="st-${st}">${STATUS.map(([v, n]) => `<option value="${v}" ${st === v ? "selected" : ""}>${n}</option>`).join("")}</select></li>`;
      }
      html += `</ul></details>`;
    }
    html += `<h2>Dados</h2><div class="card">
      <p class="small">Os dados ficam só neste navegador. Para usar no celular e no computador, exporte de um e importe no outro.</p>
      <div class="row gap wrap"><button class="btn sec" data-a="exportar">Exportar backup</button>
      <label class="btn sec">Importar backup<input type="file" accept=".json,application/json" data-a="importar" hidden></label>
      <label class="btn sec">Importar pacote de questões<input type="file" accept=".json,application/json" data-a="pacote" hidden></label></div>
      ${S.packs.length ? `<p class="small">Pacotes: ${S.packs.map((p) => `${h(p.nome)} (${(p.questoes || []).length}q, ${(p.flashcards || []).length}c)`).join(" · ")}</p>` : ""}
      <label class="small">Novos cards por dia <input type="number" min="0" max="50" value="${S.settings.novosPorDia}" data-a="novosDia" style="width:4em"></label>
      <p><button class="link perigo" data-a="zerar">Apagar todos os dados</button></p></div>`;
    return html;
  };

  // ---------------- roteador ----------------
  function render() {
    const [rota, arg] = location.hash.slice(1).split("/");
    const r = views[rota] ? rota : "hoje";
    clearInterval(timer);
    $("#main").innerHTML = views[r](arg && decodeURIComponent(arg));
    document.querySelectorAll("nav a").forEach((a) => a.classList.toggle("on", a.getAttribute("href") === "#" + (r === "gabarito" ? "simulado" : r)));
    if (r === "simulado" && S.simAtual) { tick(); timer = setInterval(tick, 1000); }
  }
  function tick() {
    const el = $("#timer"), sa = S.simAtual; if (!el || !sa) return;
    const seg = sa.seg + Math.floor((Date.now() - sa.t0) / 1000);
    const rest = sa.lim * 60 - seg;
    const f = (x) => `${Math.floor(Math.abs(x) / 3600)}:${pad(Math.floor((Math.abs(x) % 3600) / 60))}:${pad(Math.abs(x) % 60)}`;
    el.textContent = rest >= 0 ? `⏱ ${f(rest)}` : `⏱ +${f(rest)} (tempo esgotado)`;
    el.classList.toggle("esgotado", rest < 0);
  }
  function pausarSim() { const sa = S.simAtual; if (sa && sa.t0) { sa.seg += Math.floor((Date.now() - sa.t0) / 1000); sa.t0 = Date.now(); save(); } }
  window.addEventListener("hashchange", () => { pausarSim(); if (!location.hash.startsWith("#questoes")) sessao = null; render(); window.scrollTo(0, 0); });
  document.addEventListener("visibilitychange", () => {
    const sa = S.simAtual; if (!sa) return;
    if (document.hidden) { pausarSim(); sa.t0 = null; save(); } else if (!sa.t0) { sa.t0 = Date.now(); save(); }
  });

  // ---------------- ações ----------------
  const A = {
    tarefa(d, el) { if (el.checked) S.plan[d.k] = 1; else delete S.plan[d.k]; save(); el.closest("li").classList.toggle("ok", el.checked); },
    praticar(d) {
      const qs = escolher(d.f, Number(d.n) || 10);
      if (!qs.length) return toast("Sem questões neste filtro.");
      sessao = { qs, i: 0, resp: {}, filtro: d.f };
      if (!location.hash.startsWith("#questoes")) location.hash = "#questoes"; else render();
    },
    responder(d) {
      const q = qPorId(sessao.qs[sessao.i]); if (sessao.resp[q.id] != null) return;
      sessao.resp[q.id] = Number(d.i); registrarResposta(q, Number(d.i)); render();
    },
    proxima() { sessao.i++; render(); window.scrollTo(0, 0); },
    sairSessao() { sessao = null; render(); },
    filtroTop(d, el) { location.hash = "#questoes/" + el.value; },
    iniciarRev() {
      const ids = shuffle(cardsDevidos()).concat(cardsNovosHoje());
      fila = { ids, i: 0, virado: false, escolha: null }; render();
    },
    revEscolha(d) { fila.escolha = Number(d.i); fila.virado = true; render(); },
    virar() { fila.virado = true; render(); },
    nota(d) {
      const id = fila.ids[fila.i], n = Number(d.n);
      agendar(id, n);
      if (n === 0 && !fila.ids.slice(fila.i + 1).includes(id)) fila.ids.push(id); // repete no fim da sessão
      fila.i++; fila.virado = false; fila.escolha = null; render(); window.scrollTo(0, 0);
    },
    sairRev() { fila = null; render(); },
    iniciarSim(d) {
      if (S.simAtual && !confirm("Há um simulado em andamento. Descartar e começar outro?")) { location.hash = "#simulado"; return; }
      const m = montarSim(d.tipo);
      if (!m.qids.length) return toast("Sem questões suficientes.");
      S.simAtual = Object.assign(m, { i: 0, resp: {}, seg: 0, t0: Date.now(), data: hoje() });
      save(); if (location.hash !== "#simulado") location.hash = "#simulado"; else render();
    },
    simResp(d) { const sa = S.simAtual; sa.resp[sa.qids[sa.i]] = Number(d.i); save(); render(); },
    simIr(d) { const i = Number(d.i); if (i < 0 || i >= S.simAtual.qids.length) return; S.simAtual.i = i; save(); render(); window.scrollTo(0, 0); },
    simFim() {
      const sa = S.simAtual, falta = sa.qids.length - Object.keys(sa.resp).length;
      if (falta && !confirm(`${falta} questões sem resposta. Entregar assim mesmo?`)) return;
      pausarSim();
      for (const id of sa.qids) { const q = qPorId(id); if (q && sa.resp[id] != null) registrarResposta(q, sa.resp[id]); }
      const reg = { tipo: sa.tipo, nome: sa.nome, data: sa.data, qids: sa.qids, resp: sa.resp, seg: sa.seg, res: corrigir(sa) };
      S.sims.push(reg); S.simAtual = null; acabouDeEntregar = true; save(); render(); window.scrollTo(0, 0);
    },
    verSim(d) { revSim = Number(d.i); location.hash = "#gabarito"; },
    statusTop(d, el) { S.topics[d.t] = el.value; el.className = "st-" + el.value; save(); },
    novosDia(d, el) { S.settings.novosPorDia = Math.max(0, Math.min(50, Number(el.value) || 0)); save(); },
    exportar() {
      const blob = new Blob([JSON.stringify(S, null, 1)], { type: "application/json" });
      const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
      a.download = `caneta-preta-backup-${hoje()}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    },
    importar(d, el) {
      lerJSON(el, (j) => {
        if (!j || j.v !== 1 || !j.qstats) return toast("Arquivo não é um backup válido.");
        if (!confirm("Substituir os dados deste aparelho pelo backup?")) return;
        S = Object.assign(vazio(), j); save(); render(); toast("Backup importado.");
      });
    },
    pacote(d, el) {
      lerJSON(el, (j) => {
        const ok = (q) => q && q.id && MAT[q.m] && Array.isArray(q.alts) && q.alts.length >= 2 && Number.isInteger(q.ans) && q.ans < q.alts.length && q.enun;
        const okC = (c) => c && c.id && c.f && c.v;
        const qs = (j.questoes || []).filter(ok), cs = (j.flashcards || []).filter(okC);
        if (!qs.length && !cs.length) return toast("Pacote sem questões/cards válidos.");
        const nome = j.nome || el.files[0].name;
        S.packs = S.packs.filter((p) => p.nome !== nome).concat([{ nome, questoes: qs, flashcards: cs, textos: j.textos || {} }]);
        save(); render(); toast(`Pacote "${nome}": ${qs.length} questões, ${cs.length} cards.`);
      });
    },
    zerar() { if (confirm("Apagar TODO o progresso deste aparelho? Exporte um backup antes.") && confirm("Tem certeza?")) { S = vazio(); save(); render(); } },
    nada() {},
  };
  function lerJSON(el, cb) {
    const f = el.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = () => { try { cb(JSON.parse(r.result)); } catch (e) { toast("JSON inválido."); } el.value = ""; };
    r.readAsText(f);
  }
  document.addEventListener("click", (e) => {
    const el = e.target.closest("[data-a]");
    if (!el || el.tagName === "SELECT" || el.tagName === "INPUT") return;
    const fn = A[el.dataset.a]; if (fn) { e.preventDefault(); fn(el.dataset, el); }
  });
  document.addEventListener("change", (e) => {
    const el = e.target.closest("[data-a]"); if (!el) return;
    const fn = A[el.dataset.a]; if (fn) fn(el.dataset, el);
  });

  // retoma o cronômetro de um simulado aberto
  if (S.simAtual && !S.simAtual.t0) { S.simAtual.t0 = Date.now(); save(); }
  render();

  if ("serviceWorker" in navigator && location.protocol !== "file:") navigator.serviceWorker.register("sw.js").catch(() => {});
})();
