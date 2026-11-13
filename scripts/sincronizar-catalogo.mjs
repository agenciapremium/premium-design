#!/usr/bin/env node
/**
 * Sincronização do catálogo de componentes (registry do shadcn) a partir do Tasks.
 *
 * A origem das peças é o Tasks: o manifesto `src/components/ui/catalogo.json`
 * lista as peças e os arquivos. Este script:
 *
 * 1. lê o Tasks em `TASKS_DIR` (padrão `../tasks`, relativo à raiz deste repo);
 * 2. copia os arquivos do manifesto para `registry/`, no mesmo caminho relativo,
 *    byte a byte;
 * 3. deriva de cada arquivo, pelos imports, as `registryDependencies` (as outras
 *    peças do manifesto) e as `dependencies` (pacotes npm, com a versão do
 *    `package.json` do Tasks; `react`, `react-dom` e `next` ficam de fora, porque
 *    todo sistema Next já os tem);
 * 4. monta a peça base `premium-base` a partir de `css/` deste repo (tokens, tema,
 *    base, motion e os padrões de `css/patterns/` que as peças usam). Desde a
 *    v0.25.0, nenhuma peça a declara em `registryDependencies`: quem usa o
 *    pacote `@agenciapremium/premium-design` importa os tokens dele, e quem não
 *    usa copia a base uma vez. O `meta.padroes` da base diz que padrões cada
 *    peça usa;
 * 5. gera o `registry.json`, roda `shadcn build` para `public/r/` e grava
 *    `registry/origem.json` (commit do Tasks e sha256 de cada arquivo).
 *
 * Com `--verificar`, nada é escrito no repositório: o script compara o Tasks
 * atual, os arquivos de `registry/` e o `registry/origem.json`, confere que o
 * `registry.json` e o `public/r/` são os que a sincronização geraria, lista os
 * divergentes e sai com código 1.
 *
 * Uso:
 *   npm run catalogo:sincronizar            # TASKS_DIR=../tasks por padrão
 *   npm run catalogo:verificar
 *   TASKS_DIR=/caminho/do/tasks npm run catalogo:sincronizar
 *
 * As `registryDependencies` são URLs absolutas fixadas na tag da versão do
 * `package.json` (`CATALOGO_URL_BASE` sobrescreve, só para teste local): no
 * shadcn, um nome sem namespace sempre aponta para o registro oficial dele, e
 * um namespace só resolve no projeto que o configurou.
 *
 * Cada arquivo vai como `registry:file`, com `target` igual ao caminho no Tasks,
 * mesmo quando a peça é `registry:ui`, `registry:lib` ou `registry:hook`: o
 * `shadcn add` grava o `registry:file` sem passar pelos transformadores (que,
 * por exemplo, apagam o comentário de cabeçalho dos `.ts`). Assim o arquivo
 * copiado é idêntico ao do Tasks.
 */
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, posix, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const TASKS = resolve(RAIZ, process.env.TASKS_DIR ?? "../tasks");
const MANIFESTO = "src/components/ui/catalogo.json";
const PASTA_REGISTRO = join(RAIZ, "registry");
const PASTA_SAIDA = join(RAIZ, "public", "r");
const ARQUIVO_REGISTRO = join(RAIZ, "registry.json");
const ARQUIVO_ORIGEM = join(PASTA_REGISTRO, "origem.json");
const SHADCN = join(RAIZ, "node_modules", ".bin", "shadcn");

const PACOTE = JSON.parse(readFileSync(join(RAIZ, "package.json"), "utf8"));
const URL_BASE =
  process.env.CATALOGO_URL_BASE ??
  `https://raw.githubusercontent.com/agenciapremium/premium-design/v${PACOTE.version}/public/r/`;

/** Pacotes que todo sistema Next já tem: nunca entram como dependência a instalar. */
const PACOTES_DO_PROJETO = new Set(["react", "react-dom", "next"]);

/** Peça base: núcleo de `css/` deste repo, copiado para `src/styles/premium/`. */
const BASE_NOME = "premium-base";
const BASE_DESTINO = "src/styles/premium";
const BASE_NUCLEO = ["tokens.css", "theme.css", "base.css", "motion.css"];

const verificar = process.argv.includes("--verificar");

// ─── utilitários ────────────────────────────────────────────────────────────

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");
const ler = (abs) => readFileSync(abs);
const absDe = (raiz, rel) => join(raiz, ...rel.split("/"));

function falhar(msg) {
  console.error(`catalogo: ${msg}`);
  process.exit(1);
}

/** Especificadores importados: estáticos, reexportações, `import()` e `require()`. */
function importsDe(fonte) {
  const out = [];
  const re =
    /(?:^|[\n;])\s*(?:import|export)\s[^;]*?\bfrom\s*["']([^"']+)["']|(?:^|[\n;])\s*import\s*["']([^"']+)["']|\bimport\(\s*["']([^"']+)["']\s*\)|\brequire\(\s*["']([^"']+)["']\s*\)/g;
  for (const m of fonte.matchAll(re)) out.push(m[1] ?? m[2] ?? m[3] ?? m[4]);
  return out;
}

/** Caminho relativo à raiz do Tasks para um import local, testando as extensões do TypeScript. */
function resolverLocal(arquivo, especificador) {
  const base = especificador.startsWith("@/")
    ? posix.join("src", especificador.slice(2))
    : posix.normalize(posix.join(posix.dirname(arquivo), especificador));
  for (const c of [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]) {
    const abs = absDe(TASKS, c);
    if (existsSync(abs) && statSync(abs).isFile()) return c;
  }
  return null;
}

/** Nome do pacote npm de um especificador (`@escopo/nome/sub` → `@escopo/nome`). */
function nomeDoPacote(especificador) {
  const partes = especificador.split("/");
  return especificador.startsWith("@") ? partes.slice(0, 2).join("/") : partes[0];
}

/** Arquivos (caminhos relativos com `/`) de uma pasta, recursivo. */
function listar(pasta, raiz = pasta) {
  if (!existsSync(pasta)) return [];
  const out = [];
  for (const e of readdirSync(pasta, { withFileTypes: true })) {
    const abs = join(pasta, e.name);
    if (e.isDirectory()) out.push(...listar(abs, raiz));
    else out.push(relative(raiz, abs).split(sep).join("/"));
  }
  return out.sort();
}

// ─── leitura da origem ──────────────────────────────────────────────────────

if (!existsSync(absDe(TASKS, MANIFESTO))) falhar(`manifesto não encontrado em ${absDe(TASKS, MANIFESTO)} (defina TASKS_DIR)`);

const manifesto = JSON.parse(readFileSync(absDe(TASKS, MANIFESTO), "utf8"));
const pacoteTasks = JSON.parse(readFileSync(join(TASKS, "package.json"), "utf8"));
const versoesTasks = { ...pacoteTasks.devDependencies, ...pacoteTasks.dependencies };
const commitTasks = execFileSync("git", ["-C", TASKS, "rev-parse", "HEAD"], { encoding: "utf8" }).trim();

/** Arquivo do manifesto → nome da peça. */
const donoDe = new Map();
for (const p of manifesto.pecas) for (const a of p.arquivos) donoDe.set(a, p.nome);

/** Código sem comentários, para um comentário que cita uma classe não contar como uso. */
const semComentarios = (fonte) => fonte.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:"'`])\/\/.*$/gm, "$1");

/**
 * Padrões de `css/patterns/` usados pelas peças, com as peças que usam cada um.
 * Conta como uso a classe, o atributo `data-*` ou a custom property registrada
 * pelo padrão aparecer no código da peça.
 */
function padroesUsados() {
  const usados = {};
  for (const nome of listar(join(RAIZ, "css", "patterns"))) {
    const css = readFileSync(join(RAIZ, "css", "patterns", nome), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");
    const marcas = [
      ...new Set([
        ...[...css.matchAll(/\.([a-zA-Z][\w-]*)/g)].map((m) => m[1]),
        ...[...css.matchAll(/\[(data-[\w-]+)/g)].map((m) => m[1]),
        ...[...css.matchAll(/@property\s+(--[\w-]+)/g)].map((m) => m[1]),
      ]),
    ].map((m) => new RegExp(`(^|[^\\w-])${m.replace(/[-]/g, "\\-")}(?![\\w-])`));
    const pecas = manifesto.pecas
      .filter((p) => p.arquivos.some((a) => marcas.some((re) => re.test(semComentarios(readFileSync(absDe(TASKS, a), "utf8"))))))
      .map((p) => p.nome);
    if (pecas.length) usados[nome] = pecas;
  }
  return usados;
}

const padroes = padroesUsados();

/** Arquivos da peça base: caminho em `css/` → destino no projeto. */
const arquivosBase = [
  ...BASE_NUCLEO.map((n) => ({ origem: `css/${n}`, destino: `${BASE_DESTINO}/${n}` })),
  ...Object.keys(padroes).map((n) => ({ origem: `css/patterns/${n}`, destino: `${BASE_DESTINO}/patterns/${n}` })),
];

// ─── derivação das dependências ─────────────────────────────────────────────

function derivar(peca) {
  const registro = new Set();
  const npm = new Map();
  for (const arquivo of peca.arquivos) {
    const fonte = readFileSync(absDe(TASKS, arquivo), "utf8");
    for (const imp of importsDe(fonte)) {
      if (imp.startsWith("@/") || imp.startsWith(".")) {
        const alvo = resolverLocal(arquivo, imp);
        const dono = alvo && donoDe.get(alvo);
        if (!dono) falhar(`${arquivo}: import "${imp}" fora do manifesto (rode a guarda do Tasks: catalogo-guarda.test.ts)`);
        if (dono !== peca.nome) registro.add(dono);
        continue;
      }
      const nome = nomeDoPacote(imp);
      if (PACOTES_DO_PROJETO.has(nome)) continue;
      const versao = versoesTasks[nome];
      if (!versao) falhar(`${arquivo}: pacote "${nome}" não está no package.json do Tasks`);
      npm.set(nome, `${nome}@${versao}`);
    }
  }
  // A `premium-base` não entra: copiá-la junto com cada peça duplicava os
  // tokens de quem já importa o pacote (change
  // catalogo-filterbar-faixa-busca-correcoes do Tasks, D7).
  const deps = [...registro].sort();
  return { registryDependencies: deps.map((n) => `${URL_BASE}${n}.json`), dependencies: [...npm.values()].sort() };
}

function montarRegistro() {
  const itens = [
    {
      name: BASE_NOME,
      type: "registry:style",
      title: "Premium base",
      description:
        "Tokens, tema Tailwind v4, base e motion do premium-design, e os padrões de css/patterns/ usados pelas peças. Para quem não usa o pacote @agenciapremium/premium-design: copie uma vez, antes da primeira peça, e importe os arquivos de src/styles/premium/ no globals.css. Quem usa o pacote importa os tokens e os padrões dele e não copia esta peça.",
      extends: "none",
      meta: { padroes },
      files: arquivosBase.map((f) => ({ path: `registry/${f.destino}`, type: "registry:file", target: f.destino })),
    },
    ...manifesto.pecas.map((p) => {
      const { registryDependencies, dependencies } = derivar(p);
      return {
        name: p.nome,
        type: p.tipo,
        title: p.nome,
        description: `Peça do Tasks copiada byte a byte: ${p.arquivos.join(", ")}.`,
        ...(dependencies.length ? { dependencies } : {}),
        ...(registryDependencies.length ? { registryDependencies } : {}),
        files: p.arquivos.map((a) => ({ path: `registry/${a}`, type: "registry:file", target: a })),
      };
    }),
  ];
  return {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "premium",
    homepage: "https://github.com/agenciapremium/premium-design",
    items: itens,
  };
}

/** Conteúdo esperado de cada arquivo de `registry/` (exceto origem.json): caminho → bytes. */
function arquivosEsperados() {
  const mapa = new Map();
  for (const p of manifesto.pecas) for (const a of p.arquivos) mapa.set(a, { bytes: ler(absDe(TASKS, a)), origem: "tasks" });
  for (const f of arquivosBase) mapa.set(f.destino, { bytes: ler(absDe(RAIZ, f.origem)), origem: f.origem });
  return mapa;
}

function montarOrigem(esperados) {
  const tasks = {};
  const base = {};
  for (const [caminho, { bytes, origem }] of esperados) {
    if (origem === "tasks") tasks[caminho] = sha256(bytes);
    else base[caminho] = { origem, sha256: sha256(bytes) };
  }
  return {
    $comentario:
      "Gerado por scripts/sincronizar-catalogo.mjs. Não edite à mão: rode npm run catalogo:sincronizar. tasksCommit é o HEAD do Tasks na sincronização; arquivos guarda o sha256 de cada arquivo copiado.",
    tasksCommit: commitTasks,
    arquivos: tasks,
    base,
  };
}

const json = (obj) => `${JSON.stringify(obj, null, 2)}\n`;

function build(registroAbs, saidaAbs) {
  execFileSync(SHADCN, ["build", registroAbs, "--output", saidaAbs, "--cwd", RAIZ], { stdio: ["ignore", "ignore", "inherit"] });
}

// ─── sincronizar ────────────────────────────────────────────────────────────

function sincronizar() {
  const esperados = arquivosEsperados();
  rmSync(join(PASTA_REGISTRO, "src"), { recursive: true, force: true });
  for (const [caminho, { bytes }] of esperados) {
    const abs = join(PASTA_REGISTRO, ...caminho.split("/"));
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, bytes);
  }
  const registro = montarRegistro();
  writeFileSync(ARQUIVO_REGISTRO, json(registro));
  rmSync(PASTA_SAIDA, { recursive: true, force: true });
  build(ARQUIVO_REGISTRO, PASTA_SAIDA);
  writeFileSync(ARQUIVO_ORIGEM, json(montarOrigem(esperados)));
  console.log(
    `catalogo: ${registro.items.length} peças (${manifesto.pecas.length} do Tasks + ${BASE_NOME}), ${esperados.size} arquivos, Tasks em ${commitTasks.slice(0, 8)}.`,
  );
}

// ─── verificar ──────────────────────────────────────────────────────────────

function verificarCatalogo() {
  const problemas = [];
  const esperados = arquivosEsperados();
  const origem = existsSync(ARQUIVO_ORIGEM) ? JSON.parse(readFileSync(ARQUIVO_ORIGEM, "utf8")) : null;
  if (!origem) problemas.push("registry/origem.json: não existe (rode npm run catalogo:sincronizar)");

  for (const [caminho, { bytes, origem: de }] of esperados) {
    const hashAtual = sha256(bytes);
    const abs = join(PASTA_REGISTRO, ...caminho.split("/"));
    const fonte = de === "tasks" ? `Tasks:${caminho}` : de;
    if (!existsSync(abs)) {
      problemas.push(`${caminho}: está em ${fonte}, mas falta em registry/`);
      continue;
    }
    if (sha256(ler(abs)) !== hashAtual) problemas.push(`${caminho}: registry/ difere de ${fonte}`);
    const hashOrigem = de === "tasks" ? origem?.arquivos?.[caminho] : origem?.base?.[caminho]?.sha256;
    if (origem && hashOrigem !== hashAtual) problemas.push(`${caminho}: origem.json difere de ${fonte}`);
  }
  for (const caminho of listar(PASTA_REGISTRO)) {
    if (caminho === "origem.json") continue;
    if (!esperados.has(caminho)) problemas.push(`${caminho}: está em registry/, mas não no manifesto do Tasks nem na peça base`);
  }

  const registroEsperado = json(montarRegistro());
  const registroAtual = existsSync(ARQUIVO_REGISTRO) ? readFileSync(ARQUIVO_REGISTRO, "utf8") : "";
  if (registroAtual !== registroEsperado) problemas.push("registry.json: difere do que a sincronização geraria (peças, dependências ou versão)");

  // Gera em pasta temporária o que a sincronização geraria e compara com public/r/.
  const tmp = mkdtempSync(join(tmpdir(), "catalogo-"));
  try {
    const raizTmp = join(tmp, "raiz");
    for (const [caminho, { bytes }] of esperados) {
      const abs = join(raizTmp, "registry", ...caminho.split("/"));
      mkdirSync(dirname(abs), { recursive: true });
      writeFileSync(abs, bytes);
    }
    writeFileSync(join(raizTmp, "registry.json"), registroEsperado);
    execFileSync(SHADCN, ["build", join(raizTmp, "registry.json"), "--output", join(tmp, "r"), "--cwd", raizTmp], {
      stdio: ["ignore", "ignore", "inherit"],
    });
    const gerados = listar(join(tmp, "r"));
    const atuais = listar(PASTA_SAIDA);
    for (const f of gerados) {
      const abs = join(PASTA_SAIDA, f);
      if (!existsSync(abs)) problemas.push(`public/r/${f}: falta (rode npm run catalogo:sincronizar)`);
      else if (sha256(ler(abs)) !== sha256(ler(join(tmp, "r", f)))) problemas.push(`public/r/${f}: difere do que a sincronização geraria a partir da origem`);
    }
    for (const f of atuais) if (!gerados.includes(f)) problemas.push(`public/r/${f}: sobra, a sincronização não o geraria`);
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }

  if (problemas.length) {
    console.error(`catalogo: ${problemas.length} divergência(s) entre o catálogo e a origem (Tasks em ${TASKS}):`);
    for (const p of problemas) console.error(`  - ${p}`);
    console.error("Rode npm run catalogo:sincronizar e revise o diff.");
    process.exit(1);
  }
  const mesmoCommit = origem.tasksCommit === commitTasks;
  console.log(
    `catalogo: sem divergência (${esperados.size} arquivos). Sincronizado do Tasks em ${origem.tasksCommit.slice(0, 8)}${mesmoCommit ? "" : `; o Tasks está em ${commitTasks.slice(0, 8)}, sem mudança nas peças`}.`,
  );
}

if (verificar) verificarCatalogo();
else sincronizar();

