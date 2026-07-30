<script setup>
import { computed } from "vue";
import { useRouter, useRoute } from "vue-router";
import CMLanguage from "@/components/ui/CMLanguage.vue";
import { useLoginStore } from "@/stores/login";
import { localePath } from "@/plugins/i18n";

const loginStore = useLoginStore();
const router = useRouter();
const route = useRoute();

const menuItems = computed(() => [
  {
    to: localePath("/offer"),
    icon: "/icons/menu/menu-1.svg",
    text: "discounts",
    role: "all",
  },
]);

const filteredMenuItems = computed(() => {
  return menuItems.value.filter(
    (item) => item.role === "all" || loginStore.user?.role === item.role
  );
});

const isActiveRoute = (path) => {
  return route.path === localePath(path);
};

function logOut() {
  loginStore.logout();
  localStorage.removeItem("telegramAuthCode"); // опционально: если хранишь
  router.push(localePath("/offer"));
}
</script>

<template>
  <header class="header shadow-header relative z-1 bg-white 768:hidden">
    <!---->
  </header>
</template>

<style lang="scss">
.user-wrap {
  &:hover {
    .user-info {
      display: block;
    }
  }
}

.header-logo {
  font-family: "Outfit", sans-serif;
}
</style>
