# Regras para agentes neste repositório

Este repo é a **fonte da verdade da identidade visual** da Agência Premium. Mudanças aqui propagam para todos os sistemas (Tasks, Central de Mídia, Ultra Popular, portais).

1. **Nunca invente valores.** Todo token novo ou alterado precisa de justificativa de contraste (AA no claro E no escuro) e entra em `css/tokens.css` nas duas variantes quando o valor muda por tema.
2. **Doc acompanha token.** Alterou `css/`, atualize `docs/tokens.md` (e `docs/dark-mode.md` se o par escuro mudou) no mesmo commit. O showroom (`docs/showroom.html`) demonstra todos os tokens — inclua o swatch novo.
3. **Semver disciplinado.** Correção de valor = patch; token/padrão novo = minor; remoção/renomeação = major com nota de migração no `CHANGELOG.md`. Toda release ganha tag `vX.Y.Z`.
4. **Idioma**: pt-BR formal, sempre acentuado, sem emoji.
5. **Sincronia com o Tasks**: a implementação de referência dos componentes vive em https://github.com/agenciapremium/tasks (que hoje mantém cópia dos tokens em `src/app/globals.css` e dos docs em `docs/design-system/`). Ao mudar algo aqui, avise que os consumidores precisam de bump — não edite os repos consumidores por fora do fluxo de versão.

## Catálogo de componentes (registry do shadcn)

6. **Sistema novo nunca reescreve componente do catálogo: copia pelo comando.** Antes de escrever um botão, um diálogo, uma barra de filtros ou um card de seção num sistema da agência, procure a peça em `registry.json` e copie:

   ```bash
   npx shadcn@latest add https://raw.githubusercontent.com/agenciapremium/premium-design/v0.27.0/public/r/filter-bar.json
   # ou, com o namespace no components.json do sistema:
   npx shadcn@latest add @premium/filter-bar
   ```

   Pré-requisitos, `components.json` recomendado e imports de CSS no [README](README.md#catálogo-de-componentes). A peça copiada não é editada no sistema: mudança de comportamento nasce no Tasks.
7. **A origem é o Tasks.** O manifesto `src/components/ui/catalogo.json` do Tasks diz o que entra no catálogo. Peça nova, mudança numa peça ou peça que sai começam lá (com a guarda `catalogo-guarda.test.ts` passando), nunca aqui. A exceção é o ajuste ao padrão estrito (regra 9).
8. **`registry/`, `registry.json` e `public/r/` nunca são editados à mão.** Para trazer o Tasks, rode `npm run catalogo:sincronizar` (Tasks em `../tasks`, ou `TASKS_DIR=<caminho>`) e revise o diff. A peça `premium-base` sai do `css/` deste repo: mudou `css/`, sincronize também.
9. **Ajuste ao padrão estrito mora em `ajustes/`, provisoriamente** (desde a v0.27.0). A camada é temporária: o destino é levar os ajustes ao Tasks e esvaziar `ajustes/`, e essa pendência continua aberta até isso acontecer. Não acrescente nada a ela além do ajuste estrito. As peças precisam passar, sem edição depois de copiadas, no `pnpm lint`, `pnpm lint:typed`, `pnpm format:check`, `pnpm typecheck` e `pnpm dry` de um sistema do `premium-stack` (TypeScript strict com `noUncheckedIndexedAccess`, Prettier com `printWidth` 100, 350 linhas por arquivo, cor só por token). A peça que precisa de ajuste para isso é reescrita em `ajustes/`, com a mesma API, e listada em `ajustes/catalogo-ajustes.json` com o sha256 do arquivo do Tasks de que partiu. Só tipos, formatação, divisão de arquivo, extração de auxiliar comum contra código clonado (peça nova com `nova: true`, quando o auxiliar serve a mais de uma peça) e troca de cor fixa por token entram ali; comportamento continua nascendo no Tasks. Quando o Tasks muda um arquivo ajustado, a sincronização para: refaça o ajuste sobre o arquivo novo, prove num sistema do `premium-stack` e atualize o sha256. Nenhuma peça importa de `@/lib/utils` outro nome que não o `cn`.
10. **`npm run catalogo:verificar` antes de toda release** (exit 0). Ele falha quando o Tasks, `registry/`, `registry/origem.json`, `registry.json` ou `public/r/` divergem, e lista os arquivos. As URLs das dependências entre peças são fixadas na tag da versão do `package.json`: subiu a versão, sincronize de novo antes da tag.
