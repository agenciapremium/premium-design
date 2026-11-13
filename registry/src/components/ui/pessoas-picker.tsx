"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { m } from "motion/react";
import { Search, Check, X, ChevronDown } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { popoverPos } from "@/lib/popover-pos";
import { motionPreset } from "@/lib/motion";

/**
 * Seletor de pessoas com busca + badges (Design System §"Seletor de pessoas").
 * Ao clicar, abre um popover com busca acento-insensível e lista de
 * colaboradores (opcionalmente agrupada em "Equipe do projeto"/"Outros"); as
 * pessoas escolhidas viram badges removíveis no campo. Suporta seleção única
 * (fecha ao escolher) e múltipla (mantém aberto, marca com check).
 *
 * - `PessoasSearchPanel`: só o conteúdo do dropdown (busca + lista). Reusado
 *   por hosts que já têm o próprio trigger/popover (ex.: colaborador-picker do
 *   workflow). Um grupo pode se declarar `revelarSoComBusca` para não abrir a
 *   lista inteira de cara (change seletor-pessoas-outros-sob-busca).
 * - `PessoasPicker`: o campo completo (trigger + badges + popover).
 */

export interface PessoaOption {
  id: string;
  nome: string;
  /** Cor do avatar; sem ela, deriva uma cor estável a partir do id. */
  cor?: string;
  /** Subtítulo opcional (ex.: departamento). */
  descricao?: string;
  /** Foto do colaborador (Colaborador.avatarUrl). */
  src?: string | null;
  /**
   * Selo ao lado do nome, quando a pessoa precisa de marcação (ex.: o `Badge`
   * "IA" do Colaborador IA, change colaborador-ia). Não entra na busca.
   */
  selo?: ReactNode;
}

export interface PessoaGrupo {
  /** Sem label, a lista é exibida sem cabeçalho de seção. */
  label?: string;
  itens: PessoaOption[];
  /**
   * Grupo revelado **apenas sob busca** (change seletor-pessoas-outros-sob-busca):
   * sem termo digitado ele não é desenhado, e uma dica avisa que os demais
   * aparecem ao buscar. Serve para não abrir o seletor com a agência inteira
   * quando o caso comum é alguém da equipe do projeto.
   *
   * Opt-in por grupo: quem monta a lista declara a intenção junto com os dados,
   * e listas de grupo único seguem intocadas. Itens **já selecionados** deste
   * grupo continuam visíveis mesmo sem busca — ver `gruposFiltrados` abaixo.
   */
  revelarSoComBusca?: boolean;
}

const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

/** Cor de avatar estável e clara (legível com texto preto) derivada de uma chave. */
export function corPorChave(chave: string): string {
  let h = 0;
  for (let i = 0; i < chave.length; i++) h = (h * 31 + chave.charCodeAt(i)) >>> 0;
  return `hsl(${h % 360} 68% 78%)`;
}

// ---------------------------------------------------------------------------
// Painel (conteúdo do dropdown): busca + lista agrupada
// ---------------------------------------------------------------------------

export function PessoasSearchPanel({
  grupos,
  selectedIds,
  multiple,
  onPick,
  loading,
  erro,
  searchPlaceholder = "Buscar colaborador...",
}: {
  grupos: PessoaGrupo[];
  selectedIds: string[];
  multiple?: boolean;
  onPick: (id: string, pessoa: PessoaOption) => void;
  loading?: boolean;
  erro?: string | null;
  searchPlaceholder?: string;
}) {
  const [busca, setBusca] = useState("");
  const termo = norm(busca.trim());

  const gruposFiltrados = useMemo(
    () =>
      grupos
        .map((g) => {
          if (termo) return { ...g, itens: g.itens.filter((c) => norm(c.nome).includes(termo)) };
          // Sem termo, o grupo revelado sob busca desenha SÓ os já selecionados
          // (design D4). Não é "não renderizar o grupo": nos hosts que usam este
          // painel inline, sem badges, a lista é a única superfície da seleção —
          // esconder um selecionado o deixaria escolhido e invisível, impossível
          // de desmarcar.
          if (g.revelarSoComBusca) return { ...g, itens: g.itens.filter((c) => selectedIds.includes(c.id)) };
          return g;
        })
        .filter((g) => g.itens.length > 0),
    [grupos, termo, selectedIds]
  );

  /** Há gente escondida atrás da busca agora? Decide a dica e o estado vazio. */
  const haOcultosSobBusca = useMemo(
    () =>
      !termo &&
      grupos.some((g) => g.revelarSoComBusca && g.itens.some((c) => !selectedIds.includes(c.id))),
    [grupos, termo, selectedIds]
  );

  // "Ainda não buscou" é diferente de "buscou e não achou" (design D5): com gente
  // escondida atrás da busca, a mensagem orienta a digitar em vez de negar que
  // exista alguém.
  const vazio = !loading && !erro && gruposFiltrados.length === 0 && !haOcultosSobBusca;
  const soDica = !loading && !erro && gruposFiltrados.length === 0 && haOcultosSobBusca;

  return (
    <div>
      <div className="relative mb-3">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--premium-gray)]" />
        <input
          type="text"
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder={searchPlaceholder}
          aria-label="Buscar colaborador"
          autoFocus
          className="w-full rounded-[var(--r-md)] border border-[var(--premium-mist)] bg-[var(--c-surface)] py-[11px] pl-9 pr-3 text-[13px] focus:border-[var(--premium-ink)] focus:outline-none focus:shadow-[0_0_0_2px_var(--yellow-50)]"
        />
      </div>

      {erro && (
        <div className="text-[12.5px] text-[var(--danger)] bg-[var(--danger-bg)] border border-[var(--danger)] rounded-[var(--r-md)] px-3 py-2">
          {erro}
        </div>
      )}

      {loading && (
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-[44px] rounded-[var(--r-md)] bg-[var(--premium-bone)] animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !erro && (
        <div className="space-y-3">
          {gruposFiltrados.map((g, gi) => (
            <div key={g.label ?? gi}>
              {g.label && <div className="eyebrow mb-1">{g.label}</div>}
              <div className="space-y-[2px]">
                {g.itens.map((c) => {
                  const ativo = selectedIds.includes(c.id);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => onPick(c.id, c)}
                      aria-pressed={ativo}
                      className={`flex w-full items-center gap-3 rounded-[var(--r-md)] px-3 py-2 text-left transition-colors min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] ${
                        ativo
                          ? "bg-[var(--gold-bg)] border border-[var(--gold)]"
                          : "border border-transparent hover:bg-[var(--premium-bone)]"
                      }`}
                    >
                      <Avatar name={c.nome} color={c.cor ?? corPorChave(c.id)} size="md" src={c.src} className="shrink-0" />
                      <span className="flex-1 min-w-0">
                        <span className="flex min-w-0 items-center gap-2">
                          <span className="block text-[13.5px] font-medium text-[var(--c-ink)] truncate">{c.nome}</span>
                          {c.selo && <span className="shrink-0">{c.selo}</span>}
                        </span>
                        {c.descricao && (
                          <span className="block text-[11.5px] text-[var(--premium-gray)] truncate">{c.descricao}</span>
                        )}
                      </span>
                      {multiple && ativo && <Check size={16} className="shrink-0 text-[var(--gold)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {/* Dica no lugar do grupo escondido (design D3). Sem ela a economia vira
              mentira por omissão: o usuário conclui que só a equipe do projeto
              pode ser escolhida. */}
          {soDica && (
            <div className="text-center py-8 text-[var(--premium-gray)] text-[13px]">
              Busque pelo nome para encontrar um colaborador.
            </div>
          )}
          {haOcultosSobBusca && gruposFiltrados.length > 0 && (
            <div className="pt-1 text-[12.5px] text-[var(--premium-gray)]">
              Outros colaboradores aparecem ao buscar pelo nome.
            </div>
          )}
          {vazio && (
            <div className="text-center py-8 text-[var(--premium-gray)] text-[13px]">
              Nenhum colaborador encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Campo completo: trigger com badges + popover
// ---------------------------------------------------------------------------

export function PessoasPicker({
  value,
  onChange,
  multiple,
  minSelecionados = 0,
  colaboradores,
  grupos,
  loading,
  erro,
  disabled,
  placeholder = "Selecionar...",
  label,
  ariaLabel,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  multiple?: boolean;
  /** Mínimo de selecionados; impede remover abaixo deste número (ex.: 1). */
  minSelecionados?: number;
  /** Lista simples (sem seções). Use `grupos` para separar equipe/outros. */
  colaboradores?: PessoaOption[];
  grupos?: PessoaGrupo[];
  loading?: boolean;
  erro?: string | null;
  disabled?: boolean;
  placeholder?: string;
  label?: string;
  ariaLabel?: string;
}) {
  const [open, setOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const gruposResolvidos = useMemo<PessoaGrupo[]>(
    () => grupos ?? [{ itens: colaboradores ?? [] }],
    [grupos, colaboradores]
  );
  const todos = useMemo(() => gruposResolvidos.flatMap((g) => g.itens), [gruposResolvidos]);
  const selecionados = useMemo(
    () => value.map((id) => todos.find((p) => p.id === id)).filter((p): p is PessoaOption => Boolean(p)),
    [value, todos]
  );
  const podeRemover = value.length > minSelecionados && !disabled;

  // Fecha ao clicar fora do trigger e do painel (que vive em portal). Ignora
  // popovers de Select/DatePicker para conviver dentro de formulários.
  useEffect(() => {
    if (!open) return;
    function onDown(ev: MouseEvent) {
      const t = ev.target as Element | null;
      if (panelRef.current?.contains(t as Node)) return;
      if (triggerRef.current?.contains(t as Node)) return;
      if (t?.closest?.("[data-select-pop], [data-datepicker-pop]")) return;
      setOpen(false);
    }
    function onKey(ev: KeyboardEvent) {
      if (ev.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function abrir() {
    if (disabled) return;
    setRect(triggerRef.current?.getBoundingClientRect() ?? null);
    setOpen((o) => !o);
  }

  function handlePick(id: string) {
    if (multiple) {
      if (value.includes(id)) {
        if (value.length <= minSelecionados) return;
        onChange(value.filter((v) => v !== id));
      } else {
        onChange([...value, id]);
      }
    } else {
      onChange([id]);
      setOpen(false);
    }
  }

  function remover(id: string) {
    if (value.length <= minSelecionados) return;
    onChange(value.filter((v) => v !== id));
  }

  return (
    <div className="flex flex-col gap-[7px]">
      {label && (
        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--premium-gray)]">{label}</span>
      )}
      <div
        ref={triggerRef}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-disabled={disabled || undefined}
        onClick={abrir}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            abrir();
          }
        }}
        className={`flex min-h-[44px] w-full items-center gap-2 rounded-[var(--r-md)] border bg-[var(--c-surface)] px-3 py-2 text-left transition-colors focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)] ${
          disabled
            ? "border-[var(--premium-mist)] opacity-50 cursor-not-allowed"
            : `cursor-pointer ${open ? "border-[var(--premium-ink)]" : "border-[var(--premium-mist)] hover:border-[var(--premium-ink)]"}`
        }`}
      >
        {selecionados.length === 0 ? (
          <span className="flex-1 text-[13px] text-[var(--premium-gray)]">{placeholder}</span>
        ) : (
          <span className="flex flex-1 flex-wrap gap-[6px]">
            {selecionados.map((p) => (
              <span
                key={p.id}
                className="inline-flex items-center gap-[6px] rounded-full bg-[var(--premium-bone)] py-[3px] pl-[3px] pr-[6px]"
              >
                <Avatar name={p.nome} color={p.cor ?? corPorChave(p.id)} size="sm" src={p.src} />
                <span className="text-[12px] font-medium text-[var(--c-ink)]">{p.nome}</span>
                {p.selo}
                {podeRemover && (
                  <button
                    type="button"
                    aria-label={`Remover ${p.nome}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      remover(p.id);
                    }}
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full text-[var(--premium-gray)] hover:bg-[var(--premium-mist)] hover:text-[var(--c-ink)] focus-visible:outline-none focus-visible:shadow-[0_0_0_2px_var(--yellow-50)]"
                  >
                    <X size={13} />
                  </button>
                )}
              </span>
            ))}
          </span>
        )}
        <ChevronDown size={16} className="ml-auto shrink-0 text-[var(--premium-gray)]" />
      </div>

      {open &&
        rect &&
        createPortal(
          <m.div
            ref={panelRef}
            {...motionPreset("menu")}
            data-pessoas-pop=""
            role="dialog"
            aria-label={ariaLabel ?? label ?? "Selecionar pessoas"}
            style={popoverPos(rect, Math.max(rect.width, 280), 380)}
            className="z-[60] max-h-[360px] overflow-y-auto rounded-[var(--r-lg)] border border-[var(--premium-mist)] bg-[var(--c-surface)] p-3 shadow-[var(--sh-lg)]"
          >
            <PessoasSearchPanel
              grupos={gruposResolvidos}
              selectedIds={value}
              multiple={multiple}
              onPick={(id) => handlePick(id)}
              loading={loading}
              erro={erro}
            />
          </m.div>,
          document.body
        )}
    </div>
  );
}
