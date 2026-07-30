<script setup>
import { onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Header from "@/components/Header.vue";
import MobileFooter from "@/components/MobileFooter.vue";
import { useLoginStore } from "@/stores/login";

const route = useRoute();
const router = useRouter();

const loginStore = useLoginStore();
function siteScrollTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

const hideHeader = computed(() => {
  // Скрываем для входных экранов (login-форвардер, partner-вход), поиска
  const hidePaths = [
    "/search",
    "/login",
    "/uz/login",
    "/app/partner",
    "/uz/app/partner",
  ];
  if (hidePaths.some((path) => route.path.startsWith(path))) {
    return true;
  }

  if (route.meta.guest) {
    return true;
  }

  return false;
});

onMounted(() => {
  if (loginStore.token) {
    loginStore.checkAuthToken(router);
  }
  window.addEventListener("scroll", function () {
    const scrollElem = document.querySelector(".site-scroll-top");

    if (scrollElem) {
      if (document.documentElement.scrollTop > 400) {
        scrollElem.style.opacity = "1";
        scrollElem.style.zIndex = "10";
      } else {
        scrollElem.style.opacity = "0";
        scrollElem.style.zIndex = "-1";
      }
    }
  });
});
</script>

<template>
  <Header v-if="!hideHeader" />
  <RouterView />
  <MobileFooter v-if="!hideHeader" />

  <div class="site-scroll-top" @click="siteScrollTop">
    <img src="./assets/images/wwww.svg" alt="scroll-top" />
  </div>
</template>

<style scoped></style>
