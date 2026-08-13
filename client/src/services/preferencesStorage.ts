import type { ResponseStyle, ThemeMode } from "../types/dsa";

const THEME_KEY = "dsa-instructor-theme";
const STYLE_KEY = "dsa-instructor-response-style";

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function loadTheme(): ThemeMode {
  if (!canUseStorage()) return "dark";
  const value = window.localStorage.getItem(THEME_KEY);
  return value === "light" ? "light" : "dark";
}

export function saveTheme(theme: ThemeMode): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(THEME_KEY, theme);
}

export function loadResponseStyle(): ResponseStyle {
  if (!canUseStorage()) return "simple";
  const value = window.localStorage.getItem(STYLE_KEY);
  return value === "detailed" ? "detailed" : "simple";
}

export function saveResponseStyle(style: ResponseStyle): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STYLE_KEY, style);
}

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  document.documentElement.dataset.theme = theme;
}
