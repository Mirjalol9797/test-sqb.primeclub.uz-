<script setup>
const props = defineProps({
  pageTitle: {
    type: String,
    required: true,
  },
});
</script>
<template>
  <div class="pb-4 flex items-center">
    <button @click="$router.back()">
      <img src="/icons/p-offer/back-white.svg" alt="" class="w-6" />
    </button>
    <div class="text-lg font-semibold site-container text-center">
      {{ pageTitle }}
    </div>
  </div>
</template>
<style lang="scss"></style>
