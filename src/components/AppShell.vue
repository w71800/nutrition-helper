<script setup lang="ts">
import { RouterLink, RouterView } from "vue-router";
</script>

<template>
  <div class="shell">
    <header class="topbar">
      <RouterLink class="brand" to="/">營養師工作台</RouterLink>
      <nav class="nav">
        <RouterLink to="/">工具</RouterLink>
        <RouterLink to="/tools/pes">PES 產生器</RouterLink>
        <RouterLink to="/internal/pes-preview">資料預覽</RouterLink>
      </nav>
    </header>
    <RouterView />
  </div>
</template>
