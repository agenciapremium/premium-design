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
   npx shadcn@latest add https://raw.githubusercontent.com/agenciapremium/premium-design/v0.25.0/public/r/filter-bar.json
   # ou, com o namespace no components.json do sistema:
   npx shadcn@latest add @premium/filter-bar
   ```

   Pré-requisitos, `components.json` recomendado e imports de CSS no [README](README.md#catálogo-de-componentes). A peça copiada não é editada no sistema: ajuste nasce no Tasks.
7. **A origem é o Tasks.** O manifesto `src/components/ui/catalogo.json` do Tasks diz o que entra no catálogo. Peça nova, mudança numa peça ou peça que sai começam lá (com a guarda `catalogo-guarda.test.ts` passando), nunca aqui.
8. **`registry/`, `registry.json` e `public/r/` nunca são editados à mão.** Para trazer o Tasks, rode `npm run catalogo:sincronizar` (Tasks em `../tasks`, ou `TASKS_DIR=<caminho>`) e revise o diff. A peça `premium-base` sai do `css/` deste repo: mudou `css/`, sincronize também.
9. **`npm run catalogo:verificar` antes de toda release** (exit 0). Ele falha quando o Tasks, `registry/`, `registry/origem.json`, `registry.json` ou `public/r/` divergem, e lista os arquivos. As URLs das dependências entre peças são fixadas na tag da versão do `package.json`: subiu a versão, sincronize de novo antes da tag.
