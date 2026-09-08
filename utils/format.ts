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

export const formatDate = (date: Date, locale = 'uk') => {
  const intlLocale = locale === 'uk' ? 'uk-UA' : 'en-US';
  return new Intl.DateTimeFormat(intlLocale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
};
