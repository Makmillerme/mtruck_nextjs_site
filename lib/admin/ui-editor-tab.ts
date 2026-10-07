export type UiEditorTab =
  | "filter"
  | "cardPreview"
  | "productCard"
  | "layout";

export const UI_EDITOR_TABS: UiEditorTab[] = [
  "filter",
  "cardPreview",
  "productCard",
  "layout",
];

export function parseUiEditorTab(value?: string | null): UiEditorTab {
  if (value && (UI_EDITOR_TABS as string[]).includes(value)) {
    return value as UiEditorTab;
  }
  return "filter";
}
