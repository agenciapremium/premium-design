"use client";

import { useEffect, useRef } from "react";
import { Picker } from "emoji-mart";
// Dataset local (empacotado) e traduções pt — sem nenhuma chamada a serviços
// remotos. `@emoji-mart/data` resolve para um JSON de emojis (native set).
import emojiData from "@emoji-mart/data";
import ptI18n from "@emoji-mart/data/i18n/pt.json";

/**
 * Painel do emoji-mart montado de forma "vanilla" (sem @emoji-mart/react, cujo
 * peer trava em React 18). Instanciamos o `Picker` do core — agnóstico de
 * framework — e deixamos que ele se anexe ao contêiner via `parent`. O picker
 * vive num shadow DOM próprio, então seus estilos NÃO vazam para o app.
 *
 * Renderiza emojis **nativos** (`set: "native"`) — a seleção devolve o
 * CARACTERE unicode (`emoji.native`), compatível com os campos `emoji` do banco.
 * Carregado apenas por import dinâmico (ssr:false) na abertura do popover, de
 * modo que o peso do dataset não entra no bundle inicial do board.
 */

interface EmojiPickerPanelProps {
  /** Recebe o caractere unicode nativo do emoji selecionado. */
  onSelect: (emoji: string) => void;
  /** Tema ativo do Tasks (segue a classe `dark` do documento, não o do sistema). */
  dark: boolean;
}

export default function EmojiPickerPanel({ onSelect, dark }: EmojiPickerPanelProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  // Mantém a callback fresca sem recriar o picker a cada render.
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    // Limpa antes de montar (evita duplicação no StrictMode/dev).
    host.replaceChildren();

    const picker = new Picker({
      data: emojiData,
      i18n: ptI18n,
      locale: "pt",
      theme: dark ? "dark" : "light",
      set: "native",
      previewPosition: "none",
      // Tom de pele acessível pelo seletor ao lado da busca.
      skinTonePosition: "search",
      searchPosition: "sticky",
      navPosition: "top",
      // Nossa própria linha de "frequentes" fica acima; escondemos a do picker.
      maxFrequentRows: 0,
      autoFocus: true,
      // Grade fixa: `dynamicWidth` mede o contêiner na montagem, mas o popover
      // ainda não tem layout nesse instante (import dinâmico recém-resolvido) —
      // a grade calculava 0 colunas e o painel renderizava achatado.
      perLine: 7,
      emojiButtonSize: 36,
      emojiSize: 22,
      onEmojiSelect: (emoji: { native?: string }) => {
        if (emoji?.native) onSelectRef.current(emoji.native);
      },
      parent: host,
    });

    // O :host padrão do em-emoji-picker é `width: min-content; height: 435px`,
    // com sombra e cantos arredondados próprios — dentro do nosso popover isso
    // vira "caixa dentro de caixa". Mantém a largura natural (min-content: a
    // grade de 7 colunas), contém a altura e zera o chrome duplicado
    // (sombra/raio) — a moldura e a largura são do popover do EmojiPicker,
    // que abraça o painel (w-max).
    const el = picker as unknown as HTMLElement;
    if (el instanceof HTMLElement) {
      el.style.height = "18rem";
      el.style.minHeight = "18rem";
      el.style.boxShadow = "none";
      el.style.borderRadius = "0";
    }

    return () => {
      // Remove o elemento custom do picker ao desmontar.
      try {
        (picker as unknown as { remove?: () => void }).remove?.();
      } catch {
        /* noop */
      }
      host.replaceChildren();
    };
  }, [dark]);

  return <div ref={hostRef} className="w-max max-w-full" />;
}
