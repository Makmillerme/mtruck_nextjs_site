# CTA copy when phone known

**Date:** 2026-11-06

- Phone field already hidden via `ContactForm knownPhone`.
- Dialog + contact/callback sections use `ContactSection.subtitleKnownPhone` when profile has primary phone (uk/en/de).
- Hero / custom-order primary buttons stay white via `[data-header-surface=dark]` → `--primary` white (verified computed).