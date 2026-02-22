import { useMemo } from 'react';

export type CanvasDay = {
  date: string; // 'YYYY-MM-DD'
  entries: string[]; // 0–4 hex colors
};

// Mock palette echoing the app's emotion color range
const PALETTE = [
  '#F4A261',
  '#E76F51',
  '#E9C46A',
  '#2A9D8F',
  '#457B9D',
  '#A8DADC',
  '#6D6875',
  '#B5838D',
];

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

export function useCanvasData(month: number, year: number): CanvasDay[] {
  return useMemo(() => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    return Array.from({ length: daysInMonth }, (_, i) => {
      const day = i + 1;
      const date = new Date(year, month, day);
      const mm = String(month + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      const dateStr = `${year}-${mm}-${dd}`;

      // Future days have no entries
      if (date > today) return { date: dateStr, entries: [] };

      const seed = year * 10000 + (month + 1) * 100 + day;
      const r = seededRand(seed);
      const count = r < 0.28 ? 0 : r < 0.52 ? 1 : r < 0.72 ? 2 : r < 0.88 ? 3 : 4;

      const entries = Array.from({ length: count }, (_, j) => {
        const idx = Math.floor(seededRand(seed * 7 + j * 13) * PALETTE.length);
        return PALETTE[idx];
      });

      return { date: dateStr, entries };
    });
  }, [month, year]);
}
