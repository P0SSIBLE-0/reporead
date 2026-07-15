import type { RepositoryAnalysis } from "./types";

export interface SavedReadme {
  id: string;
  fullName: string;
  markdown: string;
  analysis: RepositoryAnalysis;
  savedAt: number;
}

const STORAGE_KEY = "reporead_saved_readmes";

export function getSavedReadmes(): SavedReadme[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to parse saved readmes", e);
    return [];
  }
}

export function saveReadme(
  fullName: string,
  markdown: string,
  analysis: RepositoryAnalysis,
  id?: string
): SavedReadme {
  const readmes = getSavedReadmes();
  // Safe simple unique ID generation fallback for environments without crypto.randomUUID
  const targetId = id || Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
  const index = readmes.findIndex((r) => r.id === targetId);

  const newItem: SavedReadme = {
    id: targetId,
    fullName,
    markdown,
    analysis,
    savedAt: Date.now(),
  };

  if (index >= 0) {
    readmes[index] = newItem;
  } else {
    readmes.unshift(newItem);
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(readmes));
  } catch (e) {
    console.error("Failed to save readme to localStorage", e);
  }

  return newItem;
}

export function deleteReadme(id: string): SavedReadme[] {
  const readmes = getSavedReadmes();
  const filtered = readmes.filter((r) => r.id !== id);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (e) {
    console.error("Failed to delete readme from localStorage", e);
  }
  return filtered;
}
