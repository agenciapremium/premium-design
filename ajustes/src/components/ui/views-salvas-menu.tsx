"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { useDialogoFoco } from "@/lib/hooks/use-dialogo-foco";
import { useToast } from "@/lib/hooks/use-toast";
import { ContextIconButton } from "@/components/ui/context-icon-button";
import {
  caminhoDaView,
  montarQueryDeView,
  normalizaNomeView,
  queryAoAplicarView,
  viewEstaAtiva,
  type FiltroConhecido,
} from "@/lib/helpers/views-salvas";
import { useFiltrosPersistencia, type ViewSalva } from "@/components/ui/filtros-persistencia";
import { DialogoNomeView, PainelViews } from "@/components/ui/views-salvas-painel";

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
      if (containerRef.current && !containerRef.current.contains(e.target as Node))
        setAberto(false);
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
        ? await persistencia.salvarView(telaKey, {
            nome: nome.trim(),
            query: montarQueryDeView(params, paramsDeNavegacao),
          })
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
        : atuais.map((v) => (v.id === salva.id ? salva : v)),
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
      atuais.map((v) => ({ ...v, padrao: virandoPadrao && v.id === view.id ? true : undefined })),
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
        : "A tela volta a abrir como você deixou.",
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
            className="pointer-events-none absolute -top-[2px] -right-[2px] min-w-[16px] rounded-full bg-[var(--premium-ink)] px-[4px] text-center text-[10px] leading-[16px] font-bold text-[var(--premium-paper)]"
          >
            {total}
          </span>
        )}
      </span>

      {aberto && (
        <PainelViews
          menuRef={menuRef}
          views={views}
          ativaId={ativa?.id}
          expandida={expandida}
          filtros={filtros}
          onExpandir={(id) => setExpandida((atual) => (atual === id ? null : id))}
          onAplicar={aplicar}
          onPadrao={(view) => void alternarPadrao(view)}
          onRenomear={(view) => abrirDialogo("renomear", view)}
          onCopiar={(view) => void copiarLink(view)}
          onExcluir={(view) => void excluir(view)}
          onSalvar={() => abrirDialogo("salvar")}
        />
      )}

      <DialogoNomeView
        modo={dialogo?.modo ?? null}
        nome={nome}
        onNome={setNome}
        duplicado={duplicado}
        salvando={salvando}
        erro={erro}
        onClose={fecharDialogo}
        onConfirm={() => void confirmarDialogo()}
      />
    </div>
  );
}
