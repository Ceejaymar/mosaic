import type { CanvasDay } from './useCanvasData';
import { useCanvasData } from './useCanvasData';
import { useCanvasDbData } from './useCanvasDbData';

export type CanvasSourceState = {
  data: CanvasDay[];
  loading: boolean;
  error: unknown;
};

/**
 * Single data-source hook for canvas components.
 * Returns mock data when demoMode is true, live DB data otherwise.
 * Exposes `loading` and `error` so callers can render skeleton / error states.
 */
export function useCanvasSource(month: number, year: number, demoMode: boolean): CanvasSourceState {
  const mockData = useCanvasData(month, year);
  const { days: dbData, loading, error } = useCanvasDbData(month, year, !demoMode);
  return demoMode
    ? { data: mockData, loading: false, error: undefined }
    : { data: dbData, loading, error };
}
