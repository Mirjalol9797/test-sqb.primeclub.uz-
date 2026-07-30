<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { setLocale } from "@/plugins/i18n";

const { locale } = useI18n();
const route = useRoute();
const isLanguageDropdownOpen = ref(false);

const currentLocale = computed(() => locale.value);

function switchLocale(target) {
  console.log(`🌐 Switching language to: ${target}`);
  const full = route.fullPath;
  let next = full;

  if (target === "uz") {
    next = full.startsWith("/uz")
      ? full
      : "/uz" + (full.startsWith("/") ? full : "/" + full);
  } else {
    next = full.replace(/^\/uz(?=\/|$)/, "") || "/";
  }

  console.log(`🔄 New URL: ${next}`);

  // Сохраняем язык в localStorage
  setLocale(target);

  // Обновляем страницу с новым URL
  window.location.href = next;
}

function toggleLanguageDropdown() {
  isLanguageDropdownOpen.value = !isLanguageDropdownOpen.value;
}

function selectLanguage(lang) {
  switchLocale(lang);
  isLanguageDropdownOpen.value = false;
}
</script>

<template>
  <div class="language-selector">
    <button
      @click="toggleLanguageDropdown"
      class="flex items-center gap-2 px-3 py-2 border border-[#ffffff1f] rounded-lg shadow-sm hover:shadow-md transition-all duration-200 focus:outline-none"
    >
      <span class="text-sm font-medium uppercase">{{ currentLocale }}</span>
      <svg
        class="w-4 h-4 transition-transform duration-200"
        :class="{ 'rotate-180': isLanguageDropdownOpen }"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </button>

    <div
      v-if="isLanguageDropdownOpen"
      class="absolute top-full left-0 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden"
    >
      <button
        @click="selectLanguage('ru')"
        class="w-full text-left px-3 py-2 text-sm font-medium transition-colors duration-150"
        :class="
          currentLocale == 'ru' ? 'bg-white text-black' : 'bg-black text-white'
        "
      >
        <span class="uppercase">RU</span>
      </button>
      <button
        @click="selectLanguage('uz')"
        class="w-full text-left px-3 py-2 text-sm font-medium transition-colors duration-150"
        :class="
          currentLocale == 'uz' ? 'bg-white text-black' : 'bg-black text-white'
        "
      >
        <span class="uppercase">UZ</span>
      </button>
    </div>

    <!-- Фоновый overlay для закрытия dropdown при клике вне его -->
    <div
      class="inset-0 fixed z-40"
      v-if="isLanguageDropdownOpen"
      @click="isLanguageDropdownOpen = false"
    ></div>
  </div>
</template>

<style lang="scss">
.language-selector {
  .rotate-180 {
    transform: rotate(180deg);
  }
}
</style>
