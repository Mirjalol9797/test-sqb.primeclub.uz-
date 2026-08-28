<script setup>
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useLoginStore, CONSENT_KEY_PREFIX } from "@/stores/login";
import { useSettingsStore } from "@/stores/settings";
import { setLocale, SUPPORTED_LOCALES } from "@/plugins/i18n";

const router = useRouter();
const { t } = useI18n();
const loginStore = useLoginStore();
const settingsStore = useSettingsStore();

// Экраны: loading → consent (оферта) | blocked | редирект на витрину.
// На blocked вью не рисует ничего: весь экран перекрывает ModalNoData,
// подключённая в App.vue.
const screen = ref("loading");

// Гостевого режима нет. Если данных для авторизации не пришло или SSO не
// прошёл — продолжать не с чем, показываем блокирующую заглушку.
// Причину пишем в консоль: в модалке общий текст, а для разбора обращений
// нужен код ошибки (TOKEN_EXPIRED, NONCE_REUSED и т.п.).
function blockNoData(reason) {
  console.error("Вход по SSO не выполнен:", reason);
  settingsStore.isNoData = true;
  screen.value = "blocked";
}

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

async function accept() {
  const result = await loginStore.consentSso(payload());
  if (result.ok) {
    if (phone) {
      localStorage.setItem(`${CONSENT_KEY_PREFIX}_${phone}`, "true");
    }
    localStorage.setItem(CONSENT_KEY_PREFIX, "true");
    router.replace(offerPath());
    return;
  }

  // Флаг согласия НЕ сбрасываем: неуспешный автологин (протухший/повторно
  // использованный sso_token) — это проблема авторизации, а не отзыв
  // оферты. Раньше сброс приводил к показу Terms of Use при каждом входе.
  blockNoData(result.message || result.error);
}

onMounted(async () => {
  // Входной экран начинает с чистого листа: заглушку, если она осталась от
  // предыдущего перехода, снимаем — решение принимаем заново ниже.
  settingsStore.isNoData = false;

  // Язык интерфейса из параметра lang
  if (SUPPORTED_LOCALES.includes(lang)) {
    setLocale(lang);
  }

  // Обязательных данных от приложения банка не пришло
  if (!ssoToken) {
    blockNoData("в URL нет sso_token");
    return;
  }

  // Проверяем, давал ли пользователь оферту ранее
  const hasAccepted =
    (phone &&
      localStorage.getItem(`${CONSENT_KEY_PREFIX}_${phone}`) === "true") ||
    localStorage.getItem(CONSENT_KEY_PREFIX) === "true" ||
    Boolean(loginStore.token);

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
    v-if="screen !== 'blocked'"
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
  </div>
</template>
