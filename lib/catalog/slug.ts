const UK_TO_LATIN: Record<string, string> = {
  а: "a",
  б: "b",
  в: "v",
  г: "h",
  ґ: "g",
  д: "d",
  е: "e",
  є: "ie",
  ж: "zh",
  з: "z",
  и: "y",
  і: "i",
  ї: "i",
  й: "i",
  к: "k",
  л: "l",
  м: "m",
  н: "n",
  о: "o",
  п: "p",
  р: "r",
  с: "s",
  т: "t",
  у: "u",
  ф: "f",
  х: "kh",
  ц: "ts",
  ч: "ch",
  ш: "sh",
  щ: "shch",
  ь: "",
  ю: "iu",
  я: "ia",
  ё: "io",
};

function transliterate(value: string) {
  return [...value.toLowerCase()]
    .map((char) => UK_TO_LATIN[char] ?? char)
    .join("");
}

export function slugify(value: string) {
  const slug = transliterate(value.trim())
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  return slug || "item";
}

export function keyify(value: string) {
  return slugify(value).replace(/-/g, "_");
}

export async function uniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
) {
  const root = slugify(base);
  let slug = root;
  let n = 2;
  while (await exists(slug)) {
    slug = `${root}-${n}`;
    n += 1;
  }
  return slug;
}
