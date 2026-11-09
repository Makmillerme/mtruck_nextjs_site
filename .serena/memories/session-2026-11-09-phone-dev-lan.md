# phone-dev LAN / Wi-Fi (2026-11-09)

- Script: `.cursor/scripts/phone-dev.ps1 -Mode Lan`
- Next 16: `allowedDevOrigins` from networkInterfaces in next.config.mjs
- Better Auth: in development use dynamic `baseURL: { allowedHosts: localhost + RFC1918 wildcards, protocol: http, fallback: BETTER_AUTH_URL }` plus exact LAN origins in trustedOrigins. Static baseURL=localhost broke cookies/CSRF when browsing via http://192.168.x.x:3000 (ADB works because Host is localhost).
- Google OAuth from LAN usually fails (redirect URI registered for localhost) — use email/password on Wi-Fi or ADB for Google.
- Restart next after auth/config changes.