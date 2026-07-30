<script setup>
import { localePath } from "@/plugins/i18n";
</script>
<template>
  <div class="p-4 bg-[#141416] border-b border-[#ffffff1f] !hidden">
    <router-link class="flex items-center gap-3" :to="localePath('/profile')">
      <div
        class="w-9 h-9 rounded-full border border-[#ffffff1f] text-white flex items-center justify-center"
      >
        AI
      </div>
      <div>
        <div class="text-sm font-medium">Александра</div>
        <div class="flex items-center gap-1 text-xs text-[#8d94a6]">
          <span>★</span>
          Premium
        </div>
      </div>
    </router-link>
  </div>
</template>
<style lang="scss"></style>
