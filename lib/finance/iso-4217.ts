export type IsoCurrencyOption = {
  code: string;
  name: string;
  nameEn: string;
  numericCode: number;
  minorUnits: number;
};

/** Popular ISO 4217 subset for admin "Add currency" (static, not live API). */
export const ISO_4217_CATALOG: IsoCurrencyOption[] = [
  { code: "UAH", name: "Українська гривня", nameEn: "Ukrainian hryvnia", numericCode: 980, minorUnits: 2 },
  { code: "USD", name: "Долар США", nameEn: "US Dollar", numericCode: 840, minorUnits: 2 },
  { code: "EUR", name: "Євро", nameEn: "Euro", numericCode: 978, minorUnits: 2 },
  { code: "GBP", name: "Фунт стерлінгів", nameEn: "Pound sterling", numericCode: 826, minorUnits: 2 },
  { code: "PLN", name: "Злотий", nameEn: "Zloty", numericCode: 985, minorUnits: 2 },
  { code: "CHF", name: "Швейцарський франк", nameEn: "Swiss franc", numericCode: 756, minorUnits: 2 },
  { code: "CZK", name: "Чеська крона", nameEn: "Czech koruna", numericCode: 203, minorUnits: 2 },
  { code: "RON", name: "Румунський лей", nameEn: "Romanian leu", numericCode: 946, minorUnits: 2 },
  { code: "HUF", name: "Форинт", nameEn: "Forint", numericCode: 348, minorUnits: 2 },
  { code: "TRY", name: "Турецька ліра", nameEn: "Turkish lira", numericCode: 949, minorUnits: 2 },
  { code: "CNY", name: "Юань", nameEn: "Yuan Renminbi", numericCode: 156, minorUnits: 2 },
  { code: "JPY", name: "Єна", nameEn: "Yen", numericCode: 392, minorUnits: 0 },
  { code: "CAD", name: "Канадський долар", nameEn: "Canadian dollar", numericCode: 124, minorUnits: 2 },
  { code: "AUD", name: "Австралійський долар", nameEn: "Australian dollar", numericCode: 36, minorUnits: 2 },
  { code: "SEK", name: "Шведська крона", nameEn: "Swedish krona", numericCode: 752, minorUnits: 2 },
  { code: "NOK", name: "Норвезька крона", nameEn: "Norwegian krone", numericCode: 578, minorUnits: 2 },
  { code: "DKK", name: "Данська крона", nameEn: "Danish krone", numericCode: 208, minorUnits: 2 },
  { code: "BGN", name: "Болгарський лев", nameEn: "Bulgarian lev", numericCode: 975, minorUnits: 2 },
  { code: "GEL", name: "Грузинський ларі", nameEn: "Lari", numericCode: 981, minorUnits: 2 },
  { code: "MDL", name: "Молдовський лей", nameEn: "Moldovan leu", numericCode: 498, minorUnits: 2 },
  { code: "AED", name: "Дирхам ОАЕ", nameEn: "UAE dirham", numericCode: 784, minorUnits: 2 },
  { code: "KRW", name: "Південнокорейська вона", nameEn: "Won", numericCode: 410, minorUnits: 0 },
];

const byCode = new Map(ISO_4217_CATALOG.map((row) => [row.code, row]));

export function getIsoCurrency(code: string): IsoCurrencyOption | undefined {
  return byCode.get(code.toUpperCase());
}
