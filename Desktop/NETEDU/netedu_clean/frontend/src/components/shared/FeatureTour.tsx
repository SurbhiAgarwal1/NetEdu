// src/components/shared/FeatureTour.tsx
import { useEffect, useState } from 'react';

export default function FeatureTour() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    // Placeholder component; actual guided tour is provided by OnboardingTour.
    setEnabled(false);
  }, []);

  if (!enabled) return null;
  return null;
}
