export type SourceTheme = "dark" | "light";

export const SOURCE_THEME_STORAGE_KEY = "copymyui.source-editor-theme";

export function getInitialSourceTheme(): SourceTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  try {
    const storedTheme = window.localStorage.getItem(SOURCE_THEME_STORAGE_KEY);
    return storedTheme === "light" ? "light" : "dark";
  } catch {
    return "dark";
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
