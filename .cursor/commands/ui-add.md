# ui-add

**Shadcn First:** нові UI-блоки — лише з реєстру, після **перевірки**, що компонента ще немає (або що саме треба додати).

## Що зробити

1. **Перевір проєкт:** чи вже існує компонент у типовій теці shadcn (у цьому репозиторії — `components/ui/`). Не дублюй установку.
2. **Примітиви** (button, input, dialog): **`user-shadcn`** — `search_items_in_registries` / `get_add_command_for_items`.
3. **Блоки/секції** (hero, gallery): **`shadcnspace-mcp`** — `searchBlocks` / `getBlockInstall`, потім CLI. Правило: [`.cursor/rules/shadcnspace.mdc`](../rules/shadcnspace.mdc).
4. Потім кастомізація (tailwind-merge, варіанти), без винаходу примітивів з нуля.

Деталі: skill [`ui-engineering`](../skills/ui-engineering/SKILL.md); правило [`.cursor/rules/senior-agent-workflow.mdc`](../rules/senior-agent-workflow.mdc).

Ця команда доступна в чаті як /ui-add
