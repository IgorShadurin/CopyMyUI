export type SourceTheme = "dark" | "light";

export const SOURCE_THEME_STORAGE_KEY = "copymyui.source-editor-theme";
export const DEFAULT_SOURCE_THEME: SourceTheme = "dark";

export function getInitialSourceTheme(): SourceTheme {
  return DEFAULT_SOURCE_THEME;
}

export function readStoredSourceTheme(): SourceTheme {
  if (typeof window === "undefined") {
    return DEFAULT_SOURCE_THEME;
  }

  try {
    const storedTheme = window.localStorage.getItem(SOURCE_THEME_STORAGE_KEY);
    return storedTheme === "light" ? "light" : DEFAULT_SOURCE_THEME;
  } catch {
    return DEFAULT_SOURCE_THEME;
  }
}

export function storeSourceTheme(theme: SourceTheme) {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(SOURCE_THEME_STORAGE_KEY, theme);
  } catch {
    // no-op: localStorage can be unavailable in private mode / blocked contexts
  }
}
