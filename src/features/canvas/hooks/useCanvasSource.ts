import type { CanvasDay } from './useCanvasData';
import { useCanvasData } from './useCanvasData';
import { useCanvasDbData } from './useCanvasDbData';

/**
 * Single data-source hook for canvas components.
 * Returns mock data when demoMode is true, live DB data otherwise.
 */
export function useCanvasSource(month: number, year: number, demoMode: boolean): CanvasDay[] {
  const mockData = useCanvasData(month, year);
  const { days: dbData } = useCanvasDbData(month, year, !demoMode);
  return demoMode ? mockData : dbData;
}
