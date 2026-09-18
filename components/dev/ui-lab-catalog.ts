export const LAB_CATEGORIES = [
  { id: "all", label: "Усі" },
  { id: "layout", label: "Розмітка" },
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
    id: "layout",
    category: "layout",
    title: "Правила розмітки",
    hint: "Глобальний канон: Manrope (єдиний шрифт), gutters (.page-container / .page-content), section-spacing, вкладеність full-bleed.",
    keywords:
      "layout розмітка gutter відступ padding page-container page-content section-spacing typography шрифт font manrope кирилиця full-bleed",
  },
  {
    id: "catalog-filter",
    category: "layout",
    title: "Фільтр каталогу",
    hint: "Вкладений Accordion type=single: сусід закриває сусіда; поля isFacet лише в листку папки.",
    keywords:
      "filter каталог фільтр accordion папка folder facet isFacet cascade дерево",
  },
  {
    id: "catalog-pagination",
    category: "layout",
    title: "Пагінація каталогу",
    hint: "Стрілки + сторінка/усього + Select 10/25/40. Той самий блок на /products.",
    keywords:
      "pagination пагінація page pagesize 10 25 40 каталог products",
  },
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
    id: "homepage-close",
    category: "brand",
    title: "Кейси / CTA / футер",
    hint: "Триптих-маніфест продажів, CustomOrder CTA по центру, компактна форма 01+03, фрагмент футера на navy.",
    keywords:
      "sales cases кейси продажі триптих маніфест custom-order заявка cta callback footer футер телеграм",
    chrome: "own",
  },
  {
    id: "finder",
    category: "brand",
    title: "Підбір каталогу",
    hint: "Живий CategoryFinder: біла плитка без заголовка. Марка, рік від/до, пробіг від/до, CTA. Наявність — лише в каталозі.",
    keywords:
      "finder catalog каталог фільтр марка рік пробіг плитка category",
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
    hint: "01+03: default = navy fill на white/pastel, біла пластина на hero/navy. Inverse — друга дія на темному. CustomOrder: default по центру, не ghost.",
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
    id: "tabs",
    category: "fields",
    title: "Tabs",
    hint: "Сегменти в спільній navy-рамці: не окремі outline-кнопки. Активний — заливка primary.",
    keywords:
      "tabs таби сегмент cms folders fields папки поля",
  },
  {
    id: "table",
    category: "fields",
    title: "Table",
    hint: "Лічильник над таблицею, шапка secondary, uppercase tracking — єдиний патерн для адмінки.",
    keywords:
      "table таблиця sales orders products адмінка",
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
    title: "Dropdown / Popover / Tooltip / Sheet / AlertDialog",
    hint: "Видалення завжди через ConfirmDelete (AlertDialog z-[110]). Icon → ConfirmDeleteIcon; Sheet footer → ConfirmDeleteFormButton. CMS folders/fields — двокрокове підтвердження в sheet.",
    keywords:
      "dropdown popover tooltip sheet alert dialog confirm delete menu overlay меню фільтри панель видалення підтвердження",
  },
  {
    id: "cascade",
    category: "overlays",
    title: "Cascade select",
    hint: "Клік відкриває список; наведення — колонка справа; у кнопці — повний шлях.",
    keywords:
      "cascade cascader folder папка submenu підменю path шлях taxonomy каскад",
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
    hint: "Живий VehicleCard: PhotoCarousel, ціна + Детальніше w-full знизу. Сітка 1/2/3. Тінь + zoom — не те саме, що кнопки без drop-shadow.",
    keywords:
      "vehicle card картка техніки тягач man overlay статус heart сердечко тінь zoom hover shadow carousel карусель details детальніше",
    chrome: "own",
  },
  {
    id: "carousel",
    category: "overlays",
    title: "PhotoCarousel",
    hint: "Єдиний Embla-компонент: variant card (dots) і page (thumbs). Підключати на картках і PDP, не дублювати.",
    keywords:
      "carousel карусель embla photo gallery галерея thumbs dots слайд",
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
