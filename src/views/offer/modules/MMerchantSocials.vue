<script setup>
import { callPhone, telHref } from "@/utils/phoneCall";

// Переход на tel: перехватываем всегда: в Android WebView необработанная схема
// уводит страницу на ERR_UNKNOWN_URL_SCHEME и убивает SPA. Если host-приложение
// набор номера не открыло — просто ничего не показываем.
async function onPhoneClick(phone, e) {
  e.preventDefault();
  await callPhone(phone);
}

// Внешние ссылки (Telegram, Instagram, сайт) открываем переходом верхнего
// уровня, а не через target="_blank": в WebView новое окно по умолчанию не
// создаётся (Android нужен onCreateWindow, iOS — createWebViewWith), переход
// молча отбрасывается и кнопка выглядит мёртвой. Переход верхнего уровня натив
// видит в shouldOverrideUrlLoading (Android) / decidePolicyFor (iOS) и может
// отдать ссылку в приложение Telegram/Instagram или во внешний браузер.
function onLinkClick(url, e) {
  if (!url) return;
  e.preventDefault();
  window.location.href = url;
}

const props = defineProps({
  socials: {
    type: Object,
    default: {},
  },
  blockClass: {
    type: String,
  },
});
</script>

<template>
  <div :class="blockClass" class="p-4 rounded-2xl mb-4 480:mb-3 480:text-sm">
    <div class="text-sm mb-2.5 font-semibold">
      {{ $t("contacts") }}
    </div>

    <div class="text-sm font-medium mb-2.5" v-if="socials?.address">
      {{ $t("address") }}: {{ socials?.address }}
    </div>

    <div class="grid grid-cols-2 gap-3 480:grid-cols-1">
      <div
        v-if="socials?.phones?.length > 0"
        v-for="(phone, index) in socials?.phones"
        :key="index"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl h-[52px]"
      >
        <a
          :href="telHref(phone)"
          class="flex items-center gap-2"
          @click="onPhoneClick(phone, $event)"
        >
          <img src="/icons/socials/phone.svg" alt="" class="w-6" />
          <div class="font-medium text-sm">{{ phone }}</div>
        </a>
      </div>
      <!-- telegram -->
      <a
        v-if="socials?.socials?.telegram"
        :href="socials?.socials?.telegram"
        rel="noopener noreferrer"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl"
        @click="onLinkClick(socials?.socials?.telegram, $event)"
      >
        <span class="flex items-center gap-2">
          <img src="/icons/socials/tg2.svg" alt="" class="w-6" />
          <span class="font-medium text-sm">Telegram</span>
        </span>
        <img src="/icons/socials/link.svg" alt="" class="w-6" />
      </a>
      <!-- instagram -->
      <a
        v-if="socials?.socials?.instagram"
        :href="socials?.socials?.instagram"
        rel="noopener noreferrer"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl"
        @click="onLinkClick(socials?.socials?.instagram, $event)"
      >
        <span class="flex items-center gap-2">
          <img src="/icons/socials/inst.svg" alt="" class="w-6" />
          <span class="font-medium text-sm">Instagram</span>
        </span>
        <img src="/icons/socials/link.svg" alt="" class="w-6" />
      </a>
      <!-- website -->
      <a
        v-if="socials?.socials?.website"
        :href="socials?.socials?.website"
        rel="noopener noreferrer"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl"
        @click="onLinkClick(socials?.socials?.website, $event)"
      >
        <span class="flex items-center gap-2">
          <img src="/icons/socials/web.svg" alt="" class="w-6" />
          <span class="font-medium text-sm">Website</span>
        </span>
        <img src="/icons/socials/link.svg" alt="" class="w-6" />
      </a>
    </div>
  </div>
</template>

<style></style>
