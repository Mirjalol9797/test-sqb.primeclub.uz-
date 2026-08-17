<script setup>
const props = defineProps({
  pageTitle: {
    type: String,
    required: true,
  },
  showBack: {
    type: Boolean,
    default: true,
  },
});
</script>

<template>
  <div class="py-2.5 flex items-center justify-between w-full relative">
    <button
      v-if="showBack"
      @click="$router.back()"
      class="p-2 -ml-2 text-white hover:opacity-80 active:scale-95 transition-all flex items-center justify-center rounded-full z-10"
      aria-label="Back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6 text-white"
      >
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
    </button>
    <div
      class="text-lg font-semibold text-center flex-1 pr-6 truncate"
      :class="{ 'pl-6': !showBack }"
    >
      {{ pageTitle }}
    </div>
  </div>
</template>

<style lang="scss" scoped></style>

