export type GenerationQuota = {
  date: string;
  count: number;
};

const STORAGE_KEY = "reporead-generation-quota";
const DAILY_LIMIT = 15;

function localDate() {
  const today = new Date();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${today.getFullYear()}-${month}-${day}`;
}

export function normalizeGenerationQuota(stored: GenerationQuota | null, today: string): GenerationQuota {
  if (stored?.date === today && Number.isInteger(stored.count) && stored.count >= 0) {
    return { date: today, count: Math.min(stored.count, DAILY_LIMIT) };
  }
  return { date: today, count: 0 };
}

export function readGenerationQuota(): GenerationQuota {
  const today = localDate();
  if (typeof window === "undefined") return { date: today, count: 0 };

  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "null") as GenerationQuota | null;
    const quota = normalizeGenerationQuota(stored, today);
    if (quota.count > 0) return quota;
  } catch {
    // Invalid local data should never block a generation.
  }

  const quota = { date: today, count: 0 };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quota));
  return quota;
}

export function canGenerate(quota: GenerationQuota) {
  return quota.count < DAILY_LIMIT;
}

export function recordGeneration(): GenerationQuota {
  const current = readGenerationQuota();
  const next = { ...current, count: Math.min(current.count + 1, DAILY_LIMIT) };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

export const generationLimit = DAILY_LIMIT;
