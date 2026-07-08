export const THEME_STORAGE_KEY = "theme";
export const DEFAULT_THEME = "dark";
export const THEME_MODES = ["dark", "light"] as const;
export const THEME_CHANGE_EVENT = "themechange";

export type ThemeMode = (typeof THEME_MODES)[number];

export function isThemeMode(value: string | null): value is ThemeMode {
    return value === "dark" || value === "light";
}

export function getStoredTheme(): ThemeMode {
    if (typeof window === "undefined") return DEFAULT_THEME;

    try {
        const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
        return isThemeMode(storedTheme) ? storedTheme : DEFAULT_THEME;
    } catch {
        return DEFAULT_THEME;
    }
}

export function applyTheme(theme: ThemeMode) {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    document.documentElement.style.colorScheme = theme;
}

export function saveTheme(theme: ThemeMode) {
    try {
        window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
        // Theme persistence is best-effort when storage is unavailable.
    }
}

export function applyThemePreference(theme: ThemeMode) {
    applyTheme(theme);
    saveTheme(theme);

    window.dispatchEvent(
        new CustomEvent<ThemeMode>(THEME_CHANGE_EVENT, {
            detail: theme,
        })
    );
}