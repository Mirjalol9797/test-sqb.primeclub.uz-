<script setup>
import { localePath } from "@/plugins/i18n";

defineProps({
  merchants: {
    type: Array,
    default: () => [],
  },
  categories: {
    type: Array,
    default: () => [],
  },
});
</script>

<template>
  <div>
    <div
      v-if="merchants.length"
      class="grid grid-cols-4 gap-4 border-b border-[#ffffff1f] pb-4 mb-4 last:border-b-0 640:grid-cols-2 640:gap-2"
    >
      <router-link
        :to="localePath(`/offer/${item.category.slug}/${item.slug}`)"
        v-for="(item, index) in merchants"
        :key="index"
        class="flex flex-col items-center"
      >
        <div class="w-14 h-full mb-2">
          <img
            :src="`https://main.primeclub.uz/uploads/${item.logo}`"
            :alt="item.name"
            class="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div class="text-sm font-semibold text-height2 text-center">
          {{ item.name }}
        </div>
      </router-link>
    </div>

    <div
      v-if="categories.length"
      class="grid grid-cols-4 gap-4 border-b border-[#ffffff1f] pb-4 mb-4 last:border-b-0 640:grid-cols-2 640:gap-2"
    >
      <router-link
        :to="localePath(`/offer/${item.slug}`)"
        v-for="(item, index) in categories"
        :key="index"
        class="flex flex-col items-center"
      >
        <div class="w-14 h-full mb-2">
          <img
            :src="`https://main.primeclub.uz/uploads/${item.logo}`"
            :alt="item.name"
            class="w-full h-full object-contain rounded-lg"
          />
        </div>
        <div class="text-sm font-semibold text-height2 text-center">
          {{ item.name }}
        </div>
      </router-link>
    </div>
  </div>
</template>
