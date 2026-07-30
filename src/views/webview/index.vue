<script setup>
import { onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLoginStore } from "@/stores/login";
import { localePath } from "@/plugins/i18n";

const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const loginStore = useLoginStore();

const errorText = ref("");

// Токен приходит в URL WebView: /webview?token=<TOKEN>
function readTokenFromUrl() {
  return (
    route.query.token ||
    new URLSearchParams(window.location.search).get("token") ||
    null
  );
}

// Убираем токен из адресной строки, чтобы он не попал в историю/Referer/аналитику
function stripTokenFromUrl() {
  if (window.history?.replaceState) {
    const url = new URL(window.location.href);
    url.searchParams.delete("token");
    window.history.replaceState({}, document.title, url.pathname + url.search);
  }
}

// Только для теста: задан тестовый ключ (грузится лишь в development-режиме,
// в прод-сборке ключа нет — эмуляция выключается автоматически)
const canDevPartnerLogin = !!import.meta.env.VITE_PARTNER_TEST_KEY;

async function authorize() {
  errorText.value = "";

  const urlToken = readTokenFromUrl();
  const token = urlToken || loginStore.token;

  let ok = false;
  if (token) {
    // Штатный поток (шаг 3): токен пришёл из URL WebView
    ok = await loginStore.authorizeWithToken(String(token));
    stripTokenFromUrl();
  } else if (canDevPartnerLogin) {
    // DEV: эмулируем банк — подписываем assertion и получаем токен
    ok = await loginStore.partnerLoginDev();
  } else {
    errorText.value = t("entry.no_token");
    return;
  }

  if (ok) {
    router.replace(localePath("/offer"));
  } else {
    errorText.value = t("entry.auth_failed");
  }
}

onMounted(() => {
  // Если в URL нет нового токена, а сессия уже есть — сразу внутрь
  if (!readTokenFromUrl() && loginStore.token) {
    router.replace(localePath("/offer"));
  }
});
</script>

<template>
  <div
    class="fixed inset-0 z-[100] text-white bg-[radial-gradient(circle_at_top,_#111827_0%,_#04060b_45%,_#000000_100%)] max-w-[640px] mx-auto flex items-center justify-center px-6"
  >
    <div class="w-full">
      <p v-if="errorText" class="text-sm text-red-400 mb-3 text-center">
        {{ errorText }}
      </p>

      <button
        @click="authorize"
        :disabled="loginStore.isAuthorizing"
        class="w-full min-h-12 rounded-2xl bg-white text-black text-base leading-none font-semibold disabled:opacity-60"
      >
        <span v-if="loginStore.isAuthorizing">{{ t("entry.loading") }}</span>
        <span v-else>{{ t("entry.login") }}</span>
      </button>
    </div>
  </div>
</template>
