import { onMounted, onUnmounted, ref } from "vue";

export type Theme = "light" | "dark";

const STORAGE_KEY = "nh-theme";
const theme = ref<Theme>(readDocumentTheme());

function systemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function storedTheme(): Theme | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === "light" || saved === "dark" ? saved : null;
  } catch {
    return null;
  }
}

function resolveTheme(): Theme {
  return storedTheme() ?? systemTheme();
}

function readDocumentTheme(): Theme {
  if (typeof document === "undefined") return "light";
  const attr = document.documentElement.dataset.theme;
  return attr === "dark" || attr === "light" ? attr : "light";
}

function applyTheme(next: Theme) {
  document.documentElement.dataset.theme = next;
  document.documentElement.style.colorScheme = next;
}

export function useTheme() {
  function setTheme(next: Theme, persist: boolean) {
    theme.value = next;
    applyTheme(next);
    if (!persist) return;
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* ignore quota / private mode */
    }
  }

  function toggleTheme() {
    setTheme(theme.value === "dark" ? "light" : "dark", true);
  }

  function syncFromSystem() {
    if (storedTheme()) return;
    setTheme(systemTheme(), false);
  }

  let media: MediaQueryList | undefined;

  onMounted(() => {
    setTheme(resolveTheme(), false);
    media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", syncFromSystem);
  });

  onUnmounted(() => {
    media?.removeEventListener("change", syncFromSystem);
  });

  return { theme, toggleTheme };
}
