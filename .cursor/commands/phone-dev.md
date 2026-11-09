# phone-dev

Тимчасовий доступ до локального `next dev` зі смартфона (Chrome). **Не** частина продукту: не чіпати `package.json`, `app/`. У `next.config.mjs` дозволено лише `allowedDevOrigins` (LAN IP для Next 16).

## Не MCP

Не піднімати окремий MCP-сервер. Це одноразова системна команда, не довгоживучий інструмент у чаті.

## Режими

| Режим | Коли | URL на телефоні |
|-------|------|-----------------|
| **Adb** (за замовч.) | Android + USB | `http://localhost:3000` |
| **Lan** | той самий Wi‑Fi, без кабелю | `http://<IP-ПК>:3000` |

## Дії агента

1. Якщо користувач хоче **без кабелю / по Wi‑Fi** — `-Mode Lan`. Інакше — ADB reverse.
2. `adb` — portable у `.cursor/tools/platform-tools` (не npm). Якщо немає:

```powershell
powershell -NoProfile -File .cursor/scripts/install-platform-tools.ps1
```

ADB:

```powershell
powershell -NoProfile -File .cursor/scripts/phone-dev.ps1
```

Wi‑Fi / LAN:

```powershell
powershell -NoProfile -File .cursor/scripts/phone-dev.ps1 -Mode Lan
```

Порт інший ніж 3000: `-Port 3001`. Якщо Windows ріже вхід — `-OpenFirewall` (може потрібен Admin).

3. Переконатися, що `next dev` уже запущений користувачем (агент **не** стартує dev сам).
   Для LAN слухай усі інтерфейси:

```powershell
npm run dev -- -H 0.0.0.0 -p 3000
```

4. Сказати URL з виводу скрипта (LAN IP або localhost через ADB).
5. Auth з телефону по Wi‑Fi: у `lib/auth.ts` (dev) динамічний `baseURL.allowedHosts` + LAN `trustedOrigins`; у `next.config.mjs` — `allowedDevOrigins`. Після змін — рестарт `next dev`. Email/password — ок; Google OAuth з LAN зазвичай ні (callback у консолі Google = localhost) — для Google краще ADB.
6. Після від’єднання USB (ADB) — скрипт треба повторити. LAN працює, доки ПК і телефон в одній мережі і dev крутиться.

Команда в чаті: **/phone-dev**.
