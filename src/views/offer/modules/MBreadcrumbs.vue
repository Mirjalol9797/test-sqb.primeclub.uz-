<script setup>
import { localePath } from "@/plugins/i18n";

const props = defineProps({
  breadcrumbs: {
    type: Object,
    default: {},
  },
});
</script>

<template>
  <div class="items-center gap-2 mb-6 text-xs !hidden">
    <button @click="$router.back()">
      <img src="/icons/p-offer/back-black.svg" alt="" class="w-4" />
    </button>
    <router-link :to="localePath('/offer')" class="text-1d98dc font-medium">{{
      $t("discounts")
    }}</router-link>
    /
    <router-link
      :to="localePath(`/offer/${breadcrumbs?.category?.slug}`)"
      class="text-1d98dc font-medium"
    >
      {{ breadcrumbs?.category?.name }}
    </router-link>
    /
    <div class="font-medium">
      {{ breadcrumbs?.name }}
    </div>
  </div>
</template>

<style></style>
