<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
import { CASE_VIEWER_URL } from "@/config/tools";
import { useTheme } from "@/composables/useTheme";

const { theme, toggleTheme } = useTheme();
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink class="brand" to="/">營養師工作台</RouterLink>
      <div class="topbar-end">
        <nav class="nav">
          <RouterLink to="/">工具</RouterLink>
          <RouterLink to="/tools/pes">PES 產生器</RouterLink>
          <a
            :href="CASE_VIEWER_URL"
            target="_blank"
            rel="noopener noreferrer"
          >個案檢視</a>
          <RouterLink to="/internal/pes-preview">資料預覽</RouterLink>
        </nav>
        <button
          type="button"
          class="theme-switch"
          role="switch"
          :aria-checked="theme === 'dark'"
          :aria-label="theme === 'dark' ? '切換日間模式' : '切換夜晚模式'"
          @click="toggleTheme"
        >
          <span class="theme-switch-icon theme-switch-sun" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="4" />
              <path
                d="M12 3v1.5M12 19.5V21M4.93 4.93l1.06 1.06M18.01 18.01l1.06 1.06M3 12h1.5M19.5 12H21M4.93 19.07l1.06-1.06M18.01 5.99l1.06-1.06"
              />
            </svg>
          </span>
          <span class="theme-switch-track">
            <span class="theme-switch-thumb" />
          </span>
          <span class="theme-switch-icon theme-switch-moon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path
                d="M17.5 15.5A7 7 0 1 1 10 4.5 5.5 5.5 0 0 0 17.5 15.5z"
              />
            </svg>
          </span>
        </button>
      </div>
    </header>
    <RouterView />
  </div>
</template>
