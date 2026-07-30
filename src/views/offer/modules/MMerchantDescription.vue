<script setup>
const props = defineProps({
  description: {
    type: Object,
    default: {},
  },
});
</script>

<template>
  <div class="mb-3 text-sm" v-html="description?.description"></div>
</template>

<style></style>
