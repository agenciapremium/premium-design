# Regras para agentes neste repositório

Este repo é a **fonte da verdade da identidade visual** da Agência Premium. Mudanças aqui propagam para todos os sistemas (Tasks, Central de Mídia, Ultra Popular, portais).

1. **Nunca invente valores.** Todo token novo ou alterado precisa de justificativa de contraste (AA no claro E no escuro) e entra em `css/tokens.css` nas duas variantes quando o valor muda por tema.
2. **Doc acompanha token.** Alterou `css/`, atualize `docs/tokens.md` (e `docs/dark-mode.md` se o par escuro mudou) no mesmo commit. O showroom (`docs/showroom.html`) demonstra todos os tokens — inclua o swatch novo.
3. **Semver disciplinado.** Correção de valor = patch; token/padrão novo = minor; remoção/renomeação = major com nota de migração no `CHANGELOG.md`. Toda release ganha tag `vX.Y.Z`.
4. **Idioma**: pt-BR formal, sempre acentuado, sem emoji.
5. **Sincronia com o Tasks**: a implementação de referência dos componentes vive em https://github.com/agenciapremium/tasks (que hoje mantém cópia dos tokens em `src/app/globals.css` e dos docs em `docs/design-system/`). Ao mudar algo aqui, avise que os consumidores precisam de bump — não edite os repos consumidores por fora do fluxo de versão.
