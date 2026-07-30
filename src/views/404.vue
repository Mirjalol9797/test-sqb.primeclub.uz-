<script setup>
import { localePath } from "@/plugins/i18n";
</script>
<template>
  <div class="mt-10 pb-10">
    <div class="site-container">
      <div class="max-w-[576px] mx-auto">
        <div class="mb-10 w-[80%] mx-auto">
          <img src="/icons/404/404-1.svg" alt="" />
        </div>
        <div class="text-xl font-semibold mb-4 text-center">
          {{ $t("page_not_found") }}
        </div>
        <div class="text-center text-sm">
          {{ $t("page_not_found_description") }}
        </div>
        <div class="flex justify-center text-center mt-2">
          <router-link :to="localePath('/offer')" class="text-336fee">{{
            $t("main_page2")
          }}</router-link>
        </div>
      </div>
    </div>
  </div>
</template>
<style lang="scss"></style>
