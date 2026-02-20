import { useState } from 'react';
import type { SafariLog } from '../types/state';
import { loadSafariLog } from '../utils/safariLog';

export function useSafariLog() {
  const [log] = useState<SafariLog>(() => loadSafariLog());
  return { log };
}
