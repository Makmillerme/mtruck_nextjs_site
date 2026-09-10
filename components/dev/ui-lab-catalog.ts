export const LAB_CATEGORIES = [
  { id: "all", label: "Усі" },
  { id: "brand", label: "Бренд" },
  { id: "icons", label: "Іконки" },
  { id: "buttons", label: "Кнопки" },
  { id: "fields", label: "Поля" },
  { id: "marks", label: "Мітки" },
  { id: "overlays", label: "Оверлеї" },
  { id: "feedback", label: "Стани" },
  { id: "cards", label: "Картки" },
] as const;

export type LabCategory = Exclude<(typeof LAB_CATEGORIES)[number]["id"], "all">;
export type LabCategoryFilter = (typeof LAB_CATEGORIES)[number]["id"];

export type LabSectionMeta = {
  id: string;
  category: LabCategory;
  title: string;
  hint?: string;
  keywords: string;
  chrome?: "section" | "own";
};

export const LAB_SECTION_META: LabSectionMeta[] = [
  {
    id: "logo",
    category: "brand",
    title: "Лого",
    hint: "Ті самі три поверхні, що були в public/logo-preview.html",
    keywords:
      "logo лого wordmark марка favicon сталь white pastel navy",
  },
  {
    id: "header",
    category: "brand",
    title: "Header",
    hint: "Скло на .site-header-glass, хамелеон на .site-header. Light на white/pastel, dark на photo/navy. Без нижньої риски.",
    keywords:
      "header хедер navbar скло glass blur backdrop хамелеон sticky",
  },
  {
    id: "icons",
    category: "icons",
    title: "Іконки",
    hint: "Усі значки з продакшен-коду: lucide, react-icons, Radix. White / pastel / navy. У клітинці — stroke, primary, muted, disk і square. TruckIcon = аліас Truck.",
    keywords:
      "icons іконки lucide react-icons radix truck heart phone chevron search",
  },
  {
    id: "buttons",
    category: "buttons",
    title: "Button",
    hint: "01+03: default = navy fill на white/pastel, біла пластина на hero/navy. Inverse — друга дія на темному. Це те, що стоїть на сайті.",
    keywords:
      "button кнопка cta default outline inverse ghost destructive link primary navy",
  },
  {
    id: "fields",
    category: "fields",
    title: "Поля",
    hint: "Input, Select, Textarea — h-11 / rounded-sm. Є disabled.",
    keywords:
      "input select textarea checkbox label поле форма телефон марка disabled",
  },
  {
    id: "marks",
    category: "marks",
    title: "Мітки і знаки",
    hint: "Теги, чіпи, обране, breadcrumb, рисочки й стрілки — те, що стоїть на сайті після 01+03.",
    keywords:
      "badge tag тег чіп chip heart сердечко обране favorite breadcrumb крихти стрілка chevron separator рисочка tick крок hero cue статус",
  },
  {
    id: "overlays",
    category: "overlays",
    title: "Dropdown / Popover / Tooltip / Sheet",
    keywords:
      "dropdown popover tooltip sheet menu overlay меню фільтри панель",
  },
  {
    id: "feedback",
    category: "feedback",
    title: "Accordion",
    keywords: "accordion faq акордеон питання",
  },
  {
    id: "states",
    category: "feedback",
    title: "Avatar / Empty / Skeleton",
    keywords:
      "avatar empty skeleton loading порожній завантаження пусто",
  },
  {
    id: "card",
    category: "cards",
    title: "Card (оболонка)",
    hint: "Сирий shadcn Card. Картка техніки — нижче, окремим блоком.",
    keywords: "card картка оболонка shadcn",
  },
  {
    id: "vehicle",
    category: "cards",
    title: "Картка техніки",
    hint: "Живий VehicleCard на пастелі каталогу.",
    keywords:
      "vehicle card картка техніки тягач man overlay статус heart сердечко",
    chrome: "own",
  },
];

export function matchesLabSection(
  section: LabSectionMeta,
  query: string,
  category: LabCategoryFilter
) {
  if (category !== "all" && section.category !== category) return false;
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = `${section.title} ${section.hint ?? ""} ${section.keywords}`.
    toLowerCase();
  return q.split(/\s+/).every((token) => hay.includes(token));
}
