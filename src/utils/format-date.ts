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

// Returns standard lowercase suffixes (e.g., "1st", "2nd") for general reuse
export const getDayWithSuffix = (day: number): string => {
  if (day > 3 && day < 21) return `${day}th`;
  switch (day % 10) {
    case 1:
      return `${day}st`;
    case 2:
      return `${day}nd`;
    case 3:
      return `${day}rd`;
    default:
      return `${day}th`;
  }
};

// Specifically formats to e.g. "THURSDAY, FEBRUARY 19TH"
export const getFormattedDateLabel = (date: Date = new Date(), locale = 'en-US'): string => {
  const weekday = date.toLocaleDateString(locale, { weekday: 'long' }).toUpperCase();
  const month = date.toLocaleDateString(locale, { month: 'long' }).toUpperCase();
  const day = date.getDate();
  const dayWithSuffix = getDayWithSuffix(day).toUpperCase();

  return `${weekday}, ${month} ${dayWithSuffix}`;
};
