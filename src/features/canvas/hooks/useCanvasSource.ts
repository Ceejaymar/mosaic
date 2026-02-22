import type { CanvasDay } from './useCanvasData';
import { useCanvasData } from './useCanvasData';
import { useCanvasDbData } from './useCanvasDbData';

export type CanvasSourceState = {
  data: CanvasDay[];
  loading: boolean;
};

/**
 * Single data-source hook for canvas components.
 * Returns mock data when demoMode is true, live DB data otherwise.
 * Exposes `loading` so callers can render a skeleton state while fetching.
 */
export function useCanvasSource(month: number, year: number, demoMode: boolean): CanvasSourceState {
  const mockData = useCanvasData(month, year);
  const { days: dbData, loading } = useCanvasDbData(month, year, !demoMode);
  return demoMode ? { data: mockData, loading: false } : { data: dbData, loading };
}
