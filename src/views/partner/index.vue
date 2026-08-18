<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLoginStore, CONSENT_KEY_PREFIX } from "@/stores/login";
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

// Раскодируем payload JWT (UTF-8 безопасно — имя может быть кириллицей)
function decodeJwtPayload(token) {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch (e) {
    return null;
  }
}

const params = new URLSearchParams(window.location.search);
const ssoToken = params.get("sso_token");
const ssoPayload = ssoToken ? decodeJwtPayload(ssoToken) : null;

// phone/name/lang берём из подписанного payload — они гарантированно совпадают
// с тем, что проверяет бэкенд. URL-параметр phone может прийти с "+" или без —
// это уже неважно, каноничные значения тянем из токена.
const phone = ssoPayload?.phone ?? params.get("phone");
const name = ssoPayload?.name ?? params.get("name");
const lang = ssoPayload?.lang ?? params.get("lang") ?? "ru";

const payload = () => ({
  sso_token: ssoToken,
  phone,
  name,
  lang,
});

function offerPath() {
  return lang === "uz" ? "/uz/offer" : "/offer";
}

async function goGuest() {
  // Гостевой режим: демо-авторизация (статические креды) → витрина.
  // Каталог требует токен, поэтому без демо-логина были бы 401.
  if (!loginStore.token) {
    await loginStore.demoLogin();
  }
  router.replace(offerPath());
}

async function accept() {
  const result = await loginStore.consentSso(payload());
  if (result.ok) {
    if (phone) {
      localStorage.setItem(`${CONSENT_KEY_PREFIX}_${phone}`, "true");
    }
    localStorage.setItem(CONSENT_KEY_PREFIX, "true");
    router.replace(offerPath());
  } else {
    // Флаг согласия НЕ сбрасываем: неуспешный автологин (протухший/повторно
    // использованный sso_token) — это проблема авторизации, а не отзыв
    // оферты. Раньше сброс приводил к показу Terms of Use при каждом входе.
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
    await goGuest();
    return;
  }

  // Проверяем, давал ли пользователь оферту ранее
  const hasAccepted =
    (phone &&
      localStorage.getItem(`${CONSENT_KEY_PREFIX}_${phone}`) === "true") ||
    localStorage.getItem(CONSENT_KEY_PREFIX) === "true" ||
    (loginStore.token && !loginStore.isDemo);

  if (hasAccepted) {
    // Автоматически авторизуемся без повторного показа оферты
    screen.value = "loading";
    await accept();
    return;
  }

  // Первый вход: показываем экран оферты
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
      class="min-h-full flex-1 flex flex-col justify-between px-6 pt-[calc(var(--safe-top)+3.5rem)] pb-10"
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
