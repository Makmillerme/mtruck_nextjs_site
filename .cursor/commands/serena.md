# serena

Використовуй у **режимі Agent** після **закриття Plan** ([`/plan`](plan.md)). Усі правки коду — **Serena MCP** (`user-serena`), крім fallback у [`serena-editing.mdc`](../rules/serena-editing.mdc).

## Перед початком

1. `activate_project` → `{"project": "d:\\Project\\mtruck\\mtruck_nextjs_site"}`
2. Проєкт: `mtruck_nextjs_site`
3. App Router: `app/`, не `src/app/`

## Інструменти

`find_symbol`, `get_symbols_overview`, `replace_symbol_body`, `insert_after_symbol`, `insert_before_symbol`, `replace_content`, `read_file`, `create_text_file`, `search_for_pattern`, `find_referencing_symbols`, `rename_symbol`, `write_memory` / `read_memory` / `edit_memory`.

**name_path:** `MyClass/myMethod` або `/ComponentName`.

## Після змін

`write_memory` у `.serena/memories/` (напр. `session-YYYY-MM-DD-topic`).

Команда в чаті: **/serena**
