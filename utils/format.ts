export const formatCurrency = (amount: number | null, locale = 'uk') => {
  const value = amount || 0;
  const intlLocale = locale === 'uk' ? 'uk-UA' : 'en-US';
  return new Intl.NumberFormat(intlLocale, {
    style: 'currency',
    currency: 'USD',
  }).format(value);
};

export const formatMileage = (km: number) => {
  if (km >= 1000) {
    return `${Math.round(km / 1000)}т км`;
  }
  return `${km} км`;
};

export const formatDate = (date: Date, _locale = "uk") => {
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};
