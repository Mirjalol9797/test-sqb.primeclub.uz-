<script setup>
const props = defineProps({
  filials: {
    type: Object,
    default: {},
  },
});
</script>

<template>
  <div class="mb-4 text-sm">
    <div
      v-for="(item, index) in filials?.branches"
      :key="index"
      class="flex justify-between p-3 bg-[#141416] text-white rounded-xl mb-3 gap-1 last:mb-0"
    >
      <div>
        <div class="font-medium text-sm">
          {{ item.name }}, {{ item.address }}
        </div>
        <div class="text-xs">{{ $t("filial") }}</div>
      </div>
      <div class="min-w-8 max-w-8 h-8">
        <img src="/icons/p-offer/filial.png" alt="" />
      </div>
    </div>
  </div>
</template>

<style></style>
