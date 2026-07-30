<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLoginStore } from "@/stores/login";
import { setLocale, SUPPORTED_LOCALES } from "@/plugins/i18n";

const router = useRouter();
const { t, te } = useI18n();
const loginStore = useLoginStore();

// Текст ошибки SSO: сначала сообщение от бэкенда, затем перевод по коду, иначе дефолт
function ssoErrorText(code, message) {
  if (message) return message;
  const key = `sso_errors.${code}`;
  return te(key) ? t(key) : t("sso_errors.default");
}

// Экраны: loading → consent (оферта) | error | (редирект)
const screen = ref("loading");
const errorText = ref("");

// Данные из URL (URLSearchParams корректно раскодирует параметры)
const params = new URLSearchParams(window.location.search);
const ssoToken = params.get("sso_token");
const phone = params.get("phone");
const name = params.get("name");
const lang = params.get("lang") || "ru";

const payload = () => ({
  sso_token: ssoToken,
  phone,
  name,
  lang,
});

function offerPath() {
  return lang === "uz" ? "/uz/offer" : "/offer";
}

function goGuest() {
  // Гостевой режим — ограниченная витрина без авторизации
  router.replace(offerPath());
}

async function accept() {
  const result = await loginStore.consentSso(payload());
  if (result.ok) {
    router.replace(offerPath());
  } else {
    errorText.value = ssoErrorText(result.error, result.message);
    screen.value = "error";
  }
}

onMounted(async () => {
  // Язык интерфейса из параметра lang
  if (SUPPORTED_LOCALES.includes(lang)) {
    setLocale(lang);
  }

  // Гость: нет sso_token → демо-авторизация, затем витрина
  if (!ssoToken) {
    await loginStore.demoLogin();
    goGuest();
    return;
  }

  // Автологин (SSO): показываем экран оферты. Авторизация завершится
  // после «Принять» вызовом consent (verify пока не используем).
  screen.value = "consent";
});
</script>

<template>
  <div
    class="fixed inset-0 z-[100] text-white bg-[radial-gradient(circle_at_top,_#111827_0%,_#04060b_45%,_#000000_100%)] max-w-[640px] mx-auto flex flex-col"
  >
    <!-- Загрузка / проверка -->
    <div v-if="screen === 'loading'" class="flex-1 flex items-center justify-center px-6">
      <div class="text-sm text-[#b7bfce]">{{ t("consent.checking") }}</div>
    </div>

    <!-- Экран оферты -->
    <div
      v-else-if="screen === 'consent'"
      class="min-h-full flex-1 flex flex-col justify-between px-6 pt-14 pb-10"
    >
      <div class="text-center">
        <div class="text-2xl font-bold leading-none">SQB Premium</div>
        <div class="mt-2 tracking-[1.2px] text-sm text-[#b7bfce]">
          {{ t("consent.program") }}
        </div>
      </div>

      <div class="text-center">
        <h1 class="text-xl font-bold mb-3">{{ t("consent.title") }}</h1>
        <p class="text-sm text-[#b7bfce] mb-6">{{ t("consent.description") }}</p>

        <p v-if="errorText" class="text-sm text-red-400 mb-3">{{ errorText }}</p>

        <button
          @click="accept"
          :disabled="loginStore.isAuthorizing"
          class="w-full min-h-12 rounded-2xl bg-white text-black text-base leading-none font-semibold disabled:opacity-60"
        >
          <span v-if="loginStore.isAuthorizing">{{ t("consent.processing") }}</span>
          <span v-else>{{ t("consent.accept") }}</span>
        </button>
      </div>
    </div>

    <!-- Ошибка авторизации -->
    <div v-else class="flex-1 flex flex-col items-center justify-center px-6 text-center">
      <h1 class="text-xl font-bold mb-3">{{ t("consent.error_title") }}</h1>
      <p class="text-sm text-red-400 mb-6">{{ errorText }}</p>
      <button
        @click="goGuest"
        class="w-full min-h-12 rounded-2xl bg-white text-black text-base leading-none font-semibold"
      >
        {{ t("consent.continue_guest") }}
      </button>
    </div>
  </div>
</template>
