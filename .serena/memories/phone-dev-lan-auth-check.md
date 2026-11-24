# Phone LAN + email/password auth (2026-11-24)

- Dev server: `npm run dev -- -H 0.0.0.0 -p 3000` (bind all interfaces for Wi‑Fi).
- LAN IP (this session): `192.168.0.231` → **http://192.168.0.231:3000**
- Tool: `.cursor/scripts/phone-dev.ps1 -Mode Lan -OpenFirewall` (firewall may need Admin).
- Better-Auth: `emailAndPassword.enabled: true`, minPasswordLength 8; `trustedOrigins` includes LAN origins.
- Verified HTTP 200: `/uk/sign-in` and `/uk/sign-up` both render email+password fields.
- Google OAuth on LAN usually fails (redirect URI / cookie host); email/password is the path for phone preview.
