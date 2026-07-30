<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useStaticPagesStore } from "@/stores/static-pages";
const route = useRoute();
const slug = route.params.slug;
const staticPagesStore = useStaticPagesStore();

// Здесь ваша логика для обработки slug
console.log("Текущий slug:", slug);

onMounted(async () => {
  if (slug !== "404") {
    await staticPagesStore.getPage(slug);
  }
});
</script>

<template>
  <div v-if="slug == 'welcome'">
    <Welcome :merchant="staticPagesStore?.page?.merchants" />
  </div>
  <div v-else>
    <OtherPages :merchant="staticPagesStore?.page" />
  </div>
</template>
