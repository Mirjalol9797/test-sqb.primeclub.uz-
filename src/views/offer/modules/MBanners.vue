<script setup>
const props = defineProps({
  banners: {
    type: Array,
    default: [],
  },
});
</script>
<template>
  <div class="text-xl font-medium mb-6 768:text-base 768:mb-3">Новые места</div>
  <div class="flex overflow-x-auto">
    <div class="flex gap-4 flex-nowrap min-w-max">
      <router-link
        :to="banner?.link"
        v-for="(banner, index) in banners"
        :key="index"
      >
        <img
          :src="`https://main.primeclub.uz/uploads/${banner?.image}`"
          :alt="banner?.name"
          class="max-w-[220px] w-full h-[120px] object-cover rounded-lg"
        />
      </router-link>
    </div>
  </div>
</template>
<style lang="scss"></style>
