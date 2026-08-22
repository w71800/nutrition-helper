import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import PesToolView from "@/views/tools/PesToolView.vue";
import PesPreviewView from "@/views/internal/PesPreviewView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "home", component: HomeView, meta: { title: "工具一覽" } },
    {
      path: "/tools/pes",
      name: "pes-tool",
      component: PesToolView,
      meta: { title: "PES 診斷文本" },
    },
    {
      path: "/internal/pes-preview",
      name: "pes-preview",
      component: PesPreviewView,
      meta: { title: "PES 資料預覽" },
    },
  ],
  scrollBehavior() {
    return { top: 0 };
  },
});

router.afterEach((to) => {
  const title = typeof to.meta.title === "string" ? to.meta.title : "營養師工作台";
  document.title = `${title} · 營養師工作台`;
});
