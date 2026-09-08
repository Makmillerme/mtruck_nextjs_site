# uk-layout

Користувач міг набрати **українською** з **EN-розкладкою**.

## Дії

1. Правило: `.cursor/rules/ukrainian-wrong-keyboard-layout.mdc`
2. Декод із кореня **цього** репо:

```powershell
cd d:\Project\mtruck\mtruck_nextjs_site
node .cursor/scripts/decode-ukrainian-en-layout.mjs "ВСТАВ_ТЕКСТ_З_ЧАТУ"
```

За потреби повний прохід: `--no-smart`. Таблиця: `.cursor/uk-en-layout-map.json`.
3. Відповідай по **розшифрованому** змісту українською.

Команда: **/uk-layout**
