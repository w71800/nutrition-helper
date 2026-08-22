<script setup lang="ts">
import { tools } from "@/config/tools";
</script>

<template>
  <main class="page">
    <p class="eyebrow">工作輔助平台</p>
    <h1>選擇要使用的工具</h1>
    <p class="lede">目前先提供 PES 診斷文本產生器。之後的工具會從這裡加入。</p>

    <section class="tool-grid">
      <RouterLink
        v-for="tool in tools"
        :key="tool.id"
        class="tool-card"
        :to="tool.route"
      >
        <span class="tool-status" :data-status="tool.status">
          {{ tool.status === "ready" ? "可用" : "即將加入" }}
        </span>
        <h2>{{ tool.title }}</h2>
        <p>{{ tool.description }}</p>
      </RouterLink>
    </section>
  </main>
</template>
