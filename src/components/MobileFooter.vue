<script setup>
import { useI18n } from "vue-i18n";
import { localePath } from "@/plugins/i18n";

const { t } = useI18n();
</script>

<template>
  <div
    class="text-[#8d94a6] flex justify-around rounded-t-2xl fixed bottom-[-2px] bg-[#141416] pt-[14px] pb-7 px-1 w-full z-10 text-xs shadow-[0_-3px_15px_rgba(0,0,0,0.1)] max-w-[640px] mx-auto"
  >
    <router-link
      :to="localePath('/offer')"
      class="flex items-center flex-col w-1/3"
      :class="{ 'text-white': $route.path === localePath('/offer') }"
    >
      <img
        src="/icons/profile/skidka-white.svg"
        class="mb-1.5 w-5 h-5"
        alt=""
        v-if="$route.path === localePath('/offer')"
      />
      <img
        src="/icons/profile/skidka.svg"
        alt=""
        class="mb-1.5 w-5 h-5"
        v-else
      />
      <div class="font-medium">{{ $t("catalog") }}</div>
    </router-link>
    <router-link
      :to="localePath('/certificates')"
      class="flex items-center flex-col w-1/3"
      :class="{ 'text-white': $route.path === localePath('/certificates') }"
    >
      <img
        src="/icons/profile/certificat-white.svg"
        class="mb-1.5 w-5 h-5"
        alt=""
        v-if="$route.path === localePath('/certificates')"
      />
      <img
        src="/icons/profile/certificat.svg"
        alt=""
        class="mb-1.5 w-5 h-5"
        v-else
      />

      <div class="font-medium">{{ $t("certificates") }}</div>
    </router-link>
    <router-link
      :to="localePath('/profile')"
      class="flex items-center flex-col w-1/3"
      :class="{ 'text-white': $route.path === localePath('/profile') }"
    >
      <img
        src="/icons/profile/profile-white.svg"
        class="mb-1.5 w-5 h-5"
        alt=""
        v-if="$route.path === localePath('/profile')"
      />
      <img
        src="/icons/profile/profile2.svg"
        alt=""
        class="mb-1.5 w-5 h-5"
        v-else
      />
      <div class="font-medium">{{ $t("profile") }}</div>
    </router-link>
  </div>
</template>

<style></style>
