import { createContext, type Dispatch, type SetStateAction, useContext } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────

type OnboardingContextValue = {
  selectedIntents: string[];
  setSelectedIntents: Dispatch<SetStateAction<string[]>>;
};

// ─── Context ──────────────────────────────────────────────────────────────────

export const OnboardingContext = createContext<OnboardingContextValue>({
  selectedIntents: [],
  setSelectedIntents: () => {},
});

export function useOnboardingContext() {
  return useContext(OnboardingContext);
}
