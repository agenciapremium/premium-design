// Barra de progresso indeterminada para feedback de auto-save em superficies
// que NAO usam SlideOver (ex.: telas/cartoes full-page). O SlideOver tem o seu
// proprio indicador via prop `loading`. Estilo em globals.css (.autosave-bar).

export function AutoSaveBar({ active }: { active: boolean }) {
  return (
    <div
      className="h-[2px] w-full overflow-hidden bg-[var(--premium-bone)]"
      style={{ visibility: active ? "visible" : "hidden" }}
      role="progressbar"
      aria-label="Salvando"
      aria-hidden={!active}
    >
      <div className="autosave-bar h-full bg-[var(--premium-ink)]" />
    </div>
  );
}
