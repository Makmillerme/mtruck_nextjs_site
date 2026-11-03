# OptionEditor shows MULTI_SELECT options (2026-11-02)

Bug: field sheet for «Комплектація» (MULTI_SELECT) showed no option tags because `OptionEditor` early-returned `attribute.type !== "SELECT"`.

Fix: allow both SELECT and MULTI_SELECT via `attributeHasOptions`; cascade parent labels only when `type === "SELECT"`.

Data was fine (25 options in DB). UI only.
