<script setup lang="ts">
import { isExternalTool, tools } from "@/config/tools";
</script>

<template>
  <main class="page">
    <p class="eyebrow">工作輔助平台</p>
    <h1>選擇要使用的工具</h1>
    <p class="lede">目前提供 PES 診斷文本產生器與營養個案檢視。</p>

    <section class="tool-grid">
      <template v-for="tool in tools" :key="tool.id">
        <a
          v-if="isExternalTool(tool)"
          class="tool-card"
          :href="tool.href"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="tool-status" :data-status="tool.status">
            {{ tool.status === "ready" ? "可用" : "即將加入" }}
          </span>
          <h2>{{ tool.title }}</h2>
          <p>{{ tool.description }}</p>
        </a>
        <RouterLink v-else class="tool-card" :to="tool.route">
          <span class="tool-status" :data-status="tool.status">
            {{ tool.status === "ready" ? "可用" : "即將加入" }}
          </span>
          <h2>{{ tool.title }}</h2>
          <p>{{ tool.description }}</p>
        </RouterLink>
      </template>
    </section>
  </main>
</template>
