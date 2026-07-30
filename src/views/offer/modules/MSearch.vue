<script setup>
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { localePath } from "@/plugins/i18n";

const router = useRouter();
const { t } = useI18n();

function goToSearchPage() {
  router.push(localePath("/search")); // Используем localePath для поддержки языков
}
</script>
<template>
  <div class="relative rounded-lg flex items-center">
    <img src="/icons/p-offer/search.svg" alt="" class="absolute left-3" />
    <input
      type="text"
      class="bg-[#000] border border-[#ffffff1f] text-white pl-11 py-3 pr-3 w-full rounded-2xl focus-visible:outline-none text-sm"
      :placeholder="$t('search_establishments_offers')"
      @focus="goToSearchPage"
    />
  </div>
</template>
<style lang="scss"></style>
