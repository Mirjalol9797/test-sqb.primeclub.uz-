<script setup>
import { computed, nextTick, onMounted, onUnmounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useLoginStore } from "@/stores/login";
import { useSettingsStore } from "@/stores/settings";

// Чат поддержки поверх API chat.primeclub.uz.
//
// Готовый виджет (chat.primeclub.uz/widget/sdk.js) не используем: файл
// /widget/assets/widget.js там отдаётся неcобранным и с синтаксической
// ошибкой, смонтировать его нельзя. Само API рабочее, поэтому общаемся с ним
// напрямую — так же, как это сделано в проекте prime_club.
//
// В деве ходим через прокси dev-сервера (см. vite.config.js): CORS на
// chat.primeclub.uz выдаётся по белому списку origin-ов, и порт может в него
// не попасть. В прод-сборке — напрямую.
const API_BASE = import.meta.env.DEV
  ? "/api/widget"
  : "https://chat.primeclub.uz/api/widget";
const API_KEY = "widget_KInVAdTARR0Uc0c2La6BpwMf9MP3Ukfv";
const REQUEST_TIMEOUT = 15000;
// Пока вебсокет не поднялся, историю догоняем опросом.
const POLL_INTERVAL = 10000;
const WS_RETRY_DELAY = 3000;

const { locale } = useI18n();
const loginStore = useLoginStore();
const settingsStore = useSettingsStore();

const messages = ref([]);
const draft = ref("");
const isLoading = ref(true);
const loadFailed = ref(false);
const isSending = ref(false);
const isOnline = ref(false);

const sessionId = ref(null);
const chatId = ref(null);

const listRef = ref(null);
let socket = null;
let pollTimer = null;
let retryTimer = null;
// После закрытия модалки ответы вебсокета и таймеры не должны ничего делать.
let disposed = false;

const canSend = computed(() => !!draft.value.trim() && !isSending.value);

async function request(endpoint, options = {}) {
  if (!loginStore.token) throw new Error("NO_TOKEN");

  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${loginStore.token}`,
    },
    // AbortSignal.timeout появился только в iOS 16 — на старых WebView
    // обходимся без таймаута, иначе запрос упадёт с TypeError.
    signal: AbortSignal.timeout
      ? AbortSignal.timeout(REQUEST_TIMEOUT)
      : undefined,
    ...options,
  });

  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

// Сообщения клиента приходят с from_operator: false, ответы поддержки — с
// true. Сравнивать user_id не нужно: чат в сессии всегда один и наш.
function mapMessage(raw) {
  return {
    id: raw.id,
    text: raw.message || raw.content || "",
    isOwn: !raw.from_operator,
    createdAt: raw.created_at,
    pending: false,
  };
}

function replaceMessages(list) {
  const mapped = (Array.isArray(list) ? list : [])
    .map(mapMessage)
    .filter((message) => message.text);

  // Отправленные, но ещё не подтверждённые сервером, держим в конце списка.
  const pending = messages.value.filter((message) => message.pending);
  messages.value = [...mapped, ...pending];
}

function appendMessage(message) {
  if (messages.value.some((item) => item.id === message.id)) return;

  // Своё же сообщение сервер присылает обратно событием message.sent — уже с
  // настоящим id. Им заменяем оптимистичный пузырь, иначе одно сообщение
  // показывалось бы дважды (до перезагрузки страницы).
  if (message.isOwn) {
    const pendingIndex = messages.value.findIndex(
      (item) =>
        String(item.id).startsWith("temp_") &&
        item.isOwn &&
        item.text === message.text
    );
    if (pendingIndex !== -1) {
      messages.value[pendingIndex] = message;
      scrollToBottom();
      return;
    }
  }

  messages.value.push(message);
  scrollToBottom();
}

function scrollToBottom() {
  nextTick(() => {
    if (listRef.value) listRef.value.scrollTop = listRef.value.scrollHeight;
  });
}

function formatTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString(locale.value === "uz" ? "uz-UZ" : "ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

// --- Вебсокет (Reverb говорит по протоколу pusher) ---

function subscribe(channel) {
  if (!channel || socket?.readyState !== WebSocket.OPEN) return;
  socket.send(JSON.stringify({ event: "pusher:subscribe", data: { channel } }));
}

function handleSocketEvent(payload) {
  const isNewMessage =
    payload.event === "new-message" ||
    payload.event === "message.sent" ||
    payload.event === "MessageSent";
  if (!isNewMessage) return;

  let data = payload.data;
  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch (error) {
      return;
    }
  }
  if (!data) return;

  const raw =
    data.message && typeof data.message === "object" ? data.message : data;
  const text = typeof raw.message === "string" ? raw.message : raw.content;
  if (!text) return;

  appendMessage({
    id: raw.id ?? `ws_${Date.now()}`,
    text,
    isOwn: !raw.from_operator,
    createdAt: raw.created_at || new Date().toISOString(),
    pending: false,
  });
}

function connectSocket(config) {
  if (disposed || !config?.ws_url || !config?.app_key) {
    startPolling();
    return;
  }

  const url = `${config.ws_url}/app/${config.app_key}?protocol=7&client=js&version=8.4.0-rc2&flash=false`;

  try {
    socket = new WebSocket(url);
  } catch (error) {
    startPolling();
    return;
  }

  socket.onopen = () => {
    if (disposed) return;
    isOnline.value = true;
    stopPolling();

    subscribe(sessionId.value && `widget.session.${sessionId.value}`);
    subscribe(chatId.value && `chat.${chatId.value}`);
    subscribe(loginStore.user?.id && `user.chats.${loginStore.user.id}`);
  };

  socket.onmessage = (event) => {
    if (disposed) return;
    try {
      handleSocketEvent(JSON.parse(event.data));
    } catch (error) {
      // Служебные кадры протокола игнорируем.
    }
  };

  socket.onerror = () => {
    isOnline.value = false;
  };

  socket.onclose = (event) => {
    isOnline.value = false;
    if (disposed) return;

    // Пока вебсокета нет, новые сообщения ловим опросом.
    startPolling();

    // 1000/1001 — закрытие по нашей инициативе или уход со страницы.
    if (event.code !== 1000 && event.code !== 1001) {
      retryTimer = setTimeout(() => connectSocket(config), WS_RETRY_DELAY);
    }
  };
}

// --- Опрос истории (запасной канал) ---

async function refreshMessages() {
  if (!chatId.value) return;
  try {
    const response = await request(`/chats/${chatId.value}/messages`);
    if (!disposed) replaceMessages(response?.messages || response?.data);
  } catch (error) {
    // Молча: следующий тик опроса попробует снова.
  }
}

function startPolling() {
  if (pollTimer || disposed) return;
  pollTimer = setInterval(refreshMessages, POLL_INTERVAL);
}

function stopPolling() {
  if (!pollTimer) return;
  clearInterval(pollTimer);
  pollTimer = null;
}

// --- Инициализация и отправка ---

async function bootstrap() {
  isLoading.value = true;
  loadFailed.value = false;

  try {
    // POST /session отдаёт всё сразу: id сессии и чата, историю и параметры
    // вебсокета. GET /session историю не возвращает, а ws_url там локальный.
    const session = await request("/session", {
      method: "POST",
      body: JSON.stringify({ api_key: API_KEY }),
    });

    sessionId.value =
      session?.session_id || session?.config?.session_id || null;
    chatId.value = session?.chat_id || session?.config?.chat_id || null;
    replaceMessages(session?.messages);

    connectSocket(session?.config);
    scrollToBottom();
  } catch (error) {
    console.error("Чат поддержки недоступен:", error);
    loadFailed.value = true;
  } finally {
    isLoading.value = false;
  }
}

async function send() {
  const text = draft.value.trim();
  if (!text || isSending.value) return;

  const tempId = `temp_${Date.now()}`;
  messages.value.push({
    id: tempId,
    text,
    isOwn: true,
    createdAt: new Date().toISOString(),
    pending: true,
  });
  draft.value = "";
  isSending.value = true;
  scrollToBottom();

  try {
    const response = await request("/message", {
      method: "POST",
      body: JSON.stringify({ session_id: sessionId.value, message: text }),
    });

    // POST /message отдаёт сообщение вложенным: { message: { message, ... } },
    // и без id. Поэтому текст берём аккуратно (иначе в пузырь попадал весь
    // объект), а временный id оставляем — его заменит эхо из вебсокета.
    const created =
      response?.message && typeof response.message === "object"
        ? response.message
        : response;

    const index = messages.value.findIndex((item) => item.id === tempId);
    if (index !== -1) {
      messages.value[index] = {
        id: created?.id ?? tempId,
        text: typeof created?.message === "string" ? created.message : text,
        isOwn: true,
        createdAt: created?.created_at || messages.value[index].createdAt,
        pending: false,
      };
    }
  } catch (error) {
    console.error("Сообщение не отправлено:", error);
    // Набранный текст возвращаем в поле, чтобы он не потерялся.
    messages.value = messages.value.filter((item) => item.id !== tempId);
    draft.value = text;
  } finally {
    isSending.value = false;
  }
}

function close() {
  settingsStore.isModalSupportChat = false;
}

onMounted(() => {
  document.body.style.overflow = "hidden";
  bootstrap();
});

onUnmounted(() => {
  disposed = true;
  stopPolling();
  clearTimeout(retryTimer);
  if (socket) {
    socket.onclose = null;
    socket.close(1000);
    socket = null;
  }
  document.body.style.overflow = "";
});
</script>

<template>
  <div
    class="support-chat modal-safe-area fixed inset-0 z-[120] mx-auto flex max-w-[640px] flex-col bg-[#04060b] text-white"
  >
    <header
      class="support-chat__header flex shrink-0 items-center gap-3 border-b border-[#ffffff1f] px-4 pb-3"
    >
      <button
        type="button"
        @click="close"
        class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#ffffff0f]"
      >
        <svg class="w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
      </button>
      <div class="min-w-0">
        <div class="truncate font-medium">{{ $t("chat.supportChat") }}</div>
        <div class="flex items-center gap-1.5 text-xs text-[#b7bfce]">
          <span
            class="h-1.5 w-1.5 rounded-full"
            :class="isOnline ? 'bg-[#4ade80]' : 'bg-[#f59e0b]'"
          ></span>
          {{ isOnline ? $t("chat.operatorsOnline") : $t("chat.connecting") }}
        </div>
      </div>
    </header>

    <div ref="listRef" class="flex-1 overflow-y-auto px-4 py-4">
      <div v-if="isLoading" class="pt-10 text-center text-sm text-[#b7bfce]">
        {{ $t("chat.loading") }}
      </div>

      <div v-else-if="loadFailed" class="pt-10 text-center">
        <p class="mb-4 text-sm text-[#b7bfce]">{{ $t("chat.loadFailed") }}</p>
        <button
          type="button"
          @click="bootstrap"
          class="rounded-full border border-[#ffffff1f] px-5 py-2 text-sm"
        >
          {{ $t("chat.retry") }}
        </button>
      </div>

      <div
        v-else-if="!messages.length"
        class="pt-10 text-center text-sm text-[#b7bfce]"
      >
        {{ $t("chat.writeMessage") }}
      </div>

      <div v-else class="flex flex-col gap-2">
        <div
          v-for="message in messages"
          :key="message.id"
          class="flex"
          :class="message.isOwn ? 'justify-end' : 'justify-start'"
        >
          <div
            class="max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm leading-snug"
            :class="
              message.isOwn
                ? 'bg-[#FF8945] text-white'
                : 'bg-[#ffffff14] text-white'
            "
          >
            <p class="whitespace-pre-wrap break-words">{{ message.text }}</p>
            <div
              class="mt-1 text-right text-[10px]"
              :class="message.isOwn ? 'text-[#ffffffcc]' : 'text-[#b7bfce]'"
            >
              {{ message.pending ? "…" : formatTime(message.createdAt) }}
            </div>
          </div>
        </div>
      </div>
    </div>

    <form
      @submit.prevent="send"
      class="flex shrink-0 items-end gap-2 border-t border-[#ffffff1f] px-4 pb-4 pt-3"
    >
      <textarea
        v-model="draft"
        rows="1"
        :placeholder="$t('chat.inputPlaceholder')"
        :disabled="loadFailed"
        @keydown.enter.exact.prevent="send"
        class="max-h-28 min-h-[44px] flex-1 resize-none rounded-2xl border border-[#ffffff1f] bg-[#ffffff0a] px-4 py-3 text-sm outline-none placeholder:text-[#7d8798]"
      ></textarea>
      <button
        type="submit"
        :disabled="!canSend"
        class="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#FF8945] disabled:opacity-40"
      >
        <svg class="w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M5 12h14M13 6l6 6-6 6"
          ></path>
        </svg>
      </button>
    </form>
  </div>
</template>

<style lang="scss" scoped>
// Кнопка «назад» стоит в левом верхнем углу — над ней плавает круглая кнопка
// хост-приложения, поэтому шапку опускаем ниже неё (см. base.scss).
.support-chat__header {
  padding-top: calc(var(--host-controls-top) + 12px);
}
</style>
