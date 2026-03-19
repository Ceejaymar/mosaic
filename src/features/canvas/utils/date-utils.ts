const THREE_MONTHS_AGO: Date = (() => {
  const d = new Date();
  d.setMonth(d.getMonth() - 3);
  d.setHours(0, 0, 0, 0);
  return d;
})();

/** Returns true if dateKey (YYYY-MM-DD) falls within the past 3 months (inclusive of today). */
export function isWithinThreeMonths(dateKey: string): boolean {
  const [y, m, day] = dateKey.split('-').map(Number);
  return new Date(y, m - 1, day) >= THREE_MONTHS_AGO;
}
