export const formatDate = (date: Date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatDateShort = (date: Date, locale = 'en-US') => {
  return date.toLocaleDateString(locale, {
    month: 'short',
    day: 'numeric',
  });
};
