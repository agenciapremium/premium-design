"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { m } from "motion/react";
import {
  Bookmark,
  BookmarkCheck,
  Check,
  Link2,
  MoreHorizontal,
  Pencil,
  Star,
  Trash2,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { motionPreset } from "@/lib/motion";
import { useDialogoFoco } from "@/lib/hooks/use-dialogo-foco";
import { useToast } from "@/lib/hooks/use-toast";
import { ContextIconButton } from "@/components/ui/context-icon-button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  caminhoDaView,
  filtrosIndisponiveis,
  montarQueryDeView,
  normalizaNomeView,
  queryAoAplicarView,
  viewEstaAtiva,
  VIEW_NOME_MAX,
  type FiltroConhecido,
} from "@/lib/helpers/views-salvas";
import { useFiltrosPersistencia, type ViewSalva } from "@/components/ui/filtros-persistencia";

/**
 * Controle "Views" da zona de contexto da `FilterBar` (capability views-salvas,
 * design D2). Lista as views salvas da tela, indica a ativa e a padrão, e
 * oferece salvar, aplicar, renomear, copiar link, definir padrão e excluir.
 *
 * A view É a query string da tela: aplicar é navegar para ela, e o link
 * compartilhável é a URL da tela com essa query. Por isso o menu não conhece
 * nenhum filtro em particular e vale igual para toda tela com `telaKey`.
 *
 * As ações de cada view abrem em uma lista com rótulo escrito, dentro do próprio
 * painel: quatro ícones lado a lado caberiam, mas dependeriam de tooltip para
 * serem entendidos, e a linha já é estreita.
 *
 * Acessibilidade: gatilho com `aria-haspopup="menu"`, painel `role="menu"` com
 * itens `role="menuitem"`, `Esc` fecha e o foco volta ao gatilho
 * (`useDialogoFoco` no modo não modal, como o menu de conta).
 *
 * As views chegam pelo `FiltrosPersistenciaProvider` (change
 * catalogo-componentes-premium-design, D6). Sem provedor, o menu não carrega
 * nada e não aparece.
 */
export function ViewsSalvasMenu({
  telaKey,
  filtros = [],
  paramsDeNavegacao = [],
  local = false,
}: {
  telaKey: string;
  /** Filtros da tela, para avisar quando a view aponta para opção inexistente. */
  filtros?: FiltroConhecido[];
  /**
   * Parâmetros que dizem onde a tela está (o mês do calendário do time): ficam
   * fora da view salva e da detecção da ativa, e seguem na URL ao aplicar
   * (change calendario-time-filtros, D7).
   */
  paramsDeNavegacao?: string[];
  /** A tela recorta no navegador: aplicar usa `history.pushState` (D5). */
  local?: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const toast = useToast();
  const persistencia = useFiltrosPersistencia();

  const [views, setViews] = useState<ViewSalva[]>([]);
  const [aberto, setAberto] = useState(false);
  const [expandida, setExpandida] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Diálogo de nomear/renomear (coleta rápida, design D3).
  const [dialogo, setDialogo] = useState<{ modo: "salvar" | "renomear"; id?: string } | null>(null);
  const [nome, setNome] = useState("");
  const [erro, setErro] = useState<string | undefined>(undefined);
  const [salvando, setSalvando] = useState(false);

  // Carga única por tela: o contador e a marcação da view ativa precisam existir
  // antes de o menu abrir (a barra mostra os dois com o menu fechado).
  useEffect(() => {
    if (!persistencia) return;
    let cancelado = false;
    void persistencia.listarViews(telaKey).then((lista) => {
      if (!cancelado) setViews(lista);
    });
    return () => {
      cancelado = true;
    };
  }, [telaKey, persistencia]);

  useDialogoFoco({
    aberto,
    ref: menuRef,
    inicial: "primeiro",
    prender: false,
    reforcoInert: false,
  });

  useEffect(() => {
    if (!aberto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setAberto(false);
    }
    function onPointer(e: Event) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setAberto(false);
    }
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onPointer);
    };
  }, [aberto]);

  const params = new URLSearchParams(searchParams.toString());
  const ativa = views.find((v) => viewEstaAtiva(v.query, params, paramsDeNavegacao));
  const nomeNormalizado = normalizaNomeView(nome);
  const duplicado =
    nomeNormalizado.length > 0 &&
    views.some((v) => v.id !== dialogo?.id && normalizaNomeView(v.nome) === nomeNormalizado);

  function fechar() {
    setAberto(false);
    setExpandida(null);
  }

  function abrirDialogo(modo: "salvar" | "renomear", view?: ViewSalva) {
    fechar();
    setErro(undefined);
    setNome(view?.nome ?? "");
    setDialogo({ modo, id: view?.id });
  }

  function fecharDialogo() {
    setDialogo(null);
    setErro(undefined);
    setNome("");
  }

  async function confirmarDialogo() {
    if (!persistencia || !dialogo || salvando || duplicado || nome.trim().length === 0) return;
    setSalvando(true);
    setErro(undefined);
    const resultado =
      dialogo.modo === "salvar"
        ? await persistencia.salvarView(telaKey, { nome: nome.trim(), query: montarQueryDeView(params, paramsDeNavegacao) })
        : await persistencia.renomearView(telaKey, dialogo.id ?? "", nome.trim());
    setSalvando(false);
    if (!resultado.success) {
      setErro(resultado.error);
      return;
    }
    const salva = resultado.view;
    setViews((atuais) =>
      dialogo.modo === "salvar"
        ? [...atuais, salva]
        : atuais.map((v) => (v.id === salva.id ? salva : v))
    );
    toast.success(dialogo.modo === "salvar" ? "View salva." : "View renomeada.");
    fecharDialogo();
  }

  function aplicar(view: ViewSalva) {
    fechar();
    // Aplicar em dezembro continua em dezembro: os parâmetros de navegação da URL
    // atual seguem junto. O link copiado leva só a query da view.
    const url = caminhoDaView(pathname, queryAoAplicarView(view.query, params, paramsDeNavegacao));
    if (local) window.history.pushState(null, "", url);
    else router.push(url, { scroll: false });
  }

  async function copiarLink(view: ViewSalva) {
    fechar();
    const url = `${window.location.origin}${caminhoDaView(pathname, view.query)}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Link da view copiado.");
    } catch {
      toast.warning("Não foi possível copiar o link.");
    }
  }

  async function alternarPadrao(view: ViewSalva) {
    if (!persistencia) return;
    const virandoPadrao = !view.padrao;
    const anterior = views;
    setViews((atuais) =>
      atuais.map((v) => ({ ...v, padrao: virandoPadrao && v.id === view.id ? true : undefined }))
    );
    const resultado = await persistencia.definirViewPadrao(telaKey, virandoPadrao ? view.id : null);
    if (!resultado.success) {
      setViews(anterior);
      toast.warning(resultado.error);
      return;
    }
    toast.success(
      virandoPadrao
        ? `"${view.nome}" passa a abrir esta tela.`
        : "A tela volta a abrir como você deixou."
    );
  }

  async function excluir(view: ViewSalva) {
    if (!persistencia) return;
    fechar();
    const anterior = views;
    setViews((atuais) => atuais.filter((v) => v.id !== view.id));
    const resultado = await persistencia.excluirView(telaKey, view.id);
    if (!resultado.success) {
      setViews(anterior);
      toast.warning(resultado.error);
      return;
    }
    const { view: removida, posicao } = resultado;
    toast.success(`View "${removida.nome}" excluída.`, {
      action: {
        label: "Desfazer",
        onClick: () => {
          void persistencia.restaurarView(telaKey, removida, posicao).then((volta) => {
            if (volta.success) setViews(anterior);
            else toast.warning(volta.error);
          });
        },
      },
    });
  }

  const total = views.length;
  const rotulo = ativa
    ? `Views salvas (${total}). Ativa: ${ativa.nome}`
    : total > 0
      ? `Views salvas (${total})`
      : "Views salvas (nenhuma)";

  // Sem provedor de persistência não há onde ler nem gravar views.
  if (!persistencia) return null;

  return (
    <div ref={containerRef} className="relative shrink-0">
      <span className="relative inline-flex">
        <ContextIconButton
          icon={ativa ? BookmarkCheck : Bookmark}
          label={rotulo}
          onClick={() => (aberto ? fechar() : setAberto(true))}
          aria-haspopup="menu"
          aria-expanded={aberto}
          className={ativa ? "text-[var(--premium-ink)]" : undefined}
        />
        {total > 0 && (
          <span
            aria-hidden
            className="pointer-events-none absolute -right-[2px] -top-[2px] min-w-[16px] rounded-full bg-[var(--premium-ink)] px-[4px] text-center text-[10px] font-bold leading-[16px] text-[var(--premium-paper)]"
          >
            {total}
          </span>
        )}
      </span>

      {aberto && (
        <m.div
          {...motionPreset("menu")}
          ref={menuRef}
          role="menu"
          aria-label="Views salvas"
          className="absolute right-0 top-full z-[60] mt-1 w-[300px] max-w-[calc(100vw-2rem)] rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--premium-paper)] p-1 shadow-[var(--sh-md)]"
        >
          {total === 0 ? (
            <p className="px-2 py-3 text-[12.5px] leading-[1.5] text-[var(--premium-steel)]">
              Nenhuma view salva nesta tela. Guarde o recorte atual (filtros, visão e ordenação) com
              um nome para voltar a ele com um clique.
            </p>
          ) : (
            <ul className="max-h-[320px] overflow-y-auto">
              {views.map((view) => (
                <ItemView
                  key={view.id}
                  view={view}
                  ativa={ativa?.id === view.id}
                  expandida={expandida === view.id}
                  indisponiveis={filtrosIndisponiveis(view.query, filtros)}
                  onExpandir={() => setExpandida((atual) => (atual === view.id ? null : view.id))}
                  onAplicar={() => aplicar(view)}
                  onPadrao={() => void alternarPadrao(view)}
                  onRenomear={() => abrirDialogo("renomear", view)}
                  onCopiar={() => void copiarLink(view)}
                  onExcluir={() => void excluir(view)}
                />
              ))}
            </ul>
          )}

          <div className="mt-1 border-t border-[var(--premium-mist)] pt-1">
            <button
              type="button"
              role="menuitem"
              onClick={() => abrirDialogo("salvar")}
              className="flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 text-left text-[13px] font-medium text-[var(--premium-ink)] transition-colors hover:bg-[var(--premium-bone)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none"
            >
              <Bookmark size={14} className="text-[var(--premium-gray)]" />
              Salvar view atual…
            </button>
            <p className="px-2 pb-1 pt-[2px] text-[11px] leading-[1.5] text-[var(--premium-gray)]">
              A view padrão abre a tela; sem ela, a tela abre como você deixou.
            </p>
          </div>
        </m.div>
      )}

      <ConfirmDialog
        open={dialogo !== null}
        onClose={fecharDialogo}
        onConfirm={() => void confirmarDialogo()}
        title={dialogo?.modo === "renomear" ? "Renomear view" : "Salvar view atual"}
        message={
          dialogo?.modo === "renomear"
            ? "Escolha um novo nome para esta view."
            : "Guarde o recorte atual (filtros, visão e ordenação) com um nome."
        }
        confirmLabel={dialogo?.modo === "renomear" ? "Renomear" : "Salvar"}
        variant="primary"
        tone="neutral"
        loading={salvando}
        error={erro}
        autoFocusConfirm={false}
        confirmDisabled={nome.trim().length === 0 || duplicado}
      >
        <Input
          label="Nome da view"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          maxLength={VIEW_NOME_MAX}
          placeholder="Atrasadas do mês"
          autoFocus
          error={duplicado ? "Já existe uma view com esse nome nesta tela." : undefined}
        />
      </ConfirmDialog>
    </div>
  );
}

/**
 * Uma view no menu: a linha aplica; o botão de reticências abre, ali mesmo, as
 * ações daquela view com o rótulo escrito.
 */
function ItemView({
  view,
  ativa,
  expandida,
  indisponiveis,
  onExpandir,
  onAplicar,
  onPadrao,
  onRenomear,
  onCopiar,
  onExcluir,
}: {
  view: ViewSalva;
  ativa: boolean;
  expandida: boolean;
  indisponiveis: string[];
  onExpandir: () => void;
  onAplicar: () => void;
  onPadrao: () => void;
  onRenomear: () => void;
  onCopiar: () => void;
  onExcluir: () => void;
}) {
  return (
    <li>
      <div
        className={cn(
          "flex items-center gap-1 rounded-[var(--r-sm)]",
          // View ativa: assinatura amarelo sobre tinta da marca (ui-guidelines §4).
          ativa && "bg-[var(--brand-ink)]"
        )}
      >
        <button
          type="button"
          role="menuitem"
          onClick={onAplicar}
          aria-current={ativa ? "true" : undefined}
          className={cn(
            "flex min-h-[40px] min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 text-left text-[13px] transition-colors focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
            ativa
              ? "font-bold text-[var(--brand-on-ink)]"
              : "text-[var(--premium-ink)] hover:bg-[var(--premium-bone)]"
          )}
        >
          {ativa ? (
            <Check size={14} className="shrink-0 text-[var(--yellow)]" />
          ) : (
            <span aria-hidden className="w-[14px] shrink-0" />
          )}
          <span className="min-w-0 flex-1">
            <span className="block truncate">{view.nome}</span>
            {indisponiveis.length > 0 && (
              <span
                className={cn(
                  "block truncate text-[11px] font-normal",
                  ativa ? "text-[var(--yellow)]" : "text-[var(--premium-gray)]"
                )}
              >
                Filtro indisponível: {indisponiveis.join(" · ")}
              </span>
            )}
          </span>
          {view.padrao && (
            <Star
              size={12}
              aria-hidden
              className={cn(
                "shrink-0",
                ativa ? "text-[var(--yellow)]" : "text-[var(--premium-gray)]"
              )}
            />
          )}
        </button>
        <button
          type="button"
          role="menuitem"
          onClick={onExpandir}
          aria-label={`Ações da view "${view.nome}"`}
          aria-expanded={expandida}
          className={cn(
            "flex min-h-[40px] min-w-[40px] shrink-0 cursor-pointer items-center justify-center rounded-[var(--r-sm)] transition-colors focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
            ativa
              ? "text-[var(--brand-on-ink)] hover:text-[var(--yellow)]"
              : "text-[var(--premium-gray)] hover:bg-[var(--premium-bone)] hover:text-[var(--premium-ink)]"
          )}
        >
          <MoreHorizontal size={15} />
        </button>
      </div>

      {expandida && (
        <div role="group" aria-label={`Ações da view "${view.nome}"`} className="pb-1 pl-4">
          <AcaoDaView
            icon={Star}
            label={view.padrao ? "Deixar de ser a padrão" : "Definir como padrão"}
            onClick={onPadrao}
          />
          <AcaoDaView icon={Pencil} label="Renomear…" onClick={onRenomear} />
          <AcaoDaView icon={Link2} label="Copiar link" onClick={onCopiar} />
          <AcaoDaView icon={Trash2} label="Excluir" perigo onClick={onExcluir} />
        </div>
      )}
    </li>
  );
}

function AcaoDaView({
  icon: Icon,
  label,
  perigo,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  perigo?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={cn(
        "flex min-h-[40px] w-full cursor-pointer items-center gap-2 rounded-[var(--r-sm)] px-2 text-left text-[13px] transition-colors hover:bg-[var(--premium-bone)] focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] focus-visible:outline-none",
        perigo ? "text-[var(--danger)]" : "text-[var(--premium-ink)]"
      )}
    >
      <Icon size={14} className={perigo ? undefined : "text-[var(--premium-gray)]"} />
      {label}
    </button>
  );
}
