<script setup>
defineProps({
  merchants: {
    type: Array,
    default: () => [],
  },
  getMerchantUrl: {
    type: Function,
    required: true,
  },
});
</script>

<template>
  <div v-if="merchants?.length" class="w-full px-4 mb-4">
    <div class="text-lg font-semibold mb-4">{{ $t("new_establishments") }}</div>

    <div class="flex gap-3 overflow-x-auto">
      <router-link
        v-for="(item, index) in merchants"
        :key="index"
        :to="getMerchantUrl(item)"
        class="min-w-[260px] max-w-[260px] transition-all duration-300 rounded-2xl relative"
      >
        <div class="w-full h-[140px]">
          <img
            :src="`https://main.primeclub.uz/uploads/${item.image}`"
            :alt="item.name"
            class="w-full h-full object-cover rounded-2xl"
          />
        </div>
        <div class="p-2 flex justify-between items-center rounded-b-2xl">
          <div>
            <div
              class="text-sm font-semibold mb-1 flex items-center gap-1.5 line-clamp-2"
            >
              {{ item.name }}
            </div>
            <div class="text-xs text-[#8d94a6] line-clamp-2">
              {{ item.excerpt }}
            </div>
          </div>
        </div>
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  line-clamp: 2;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
