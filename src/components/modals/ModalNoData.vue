<script setup>
import { onMounted, onUnmounted } from "vue";

// Блокирующая модалка «Недостаточно данных».
//
// Показывается, когда приложение не получило от сервера данные, без которых
// работать невозможно: WebView открыт без sso_token либо SSO-авторизация не
// прошла. Гостевого режима больше нет, поэтому продолжать не с чем — модалка
// намеренно без крестика и без клика по фону: выйти можно только повторным
// входом из приложения банка с корректным sso_token.
function lockScroll() {
  document.body.style.overflow = "hidden";
}

function unlockScroll() {
  document.body.style.overflow = "";
}

onMounted(lockScroll);
onUnmounted(unlockScroll);
</script>

<template>
  <div
    class="fixed inset-0 z-[200] max-w-[640px] mx-auto flex items-center justify-center px-6 modal-safe-area bg-[radial-gradient(circle_at_top,_#111827_0%,_#04060b_45%,_#000000_100%)]"
  >
    <div
      class="w-full max-w-[400px] rounded-3xl border border-[#ffffff1f] bg-[#0b0f16] px-6 py-9 text-center text-white"
    >
      <div
        class="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#ffffff0f]"
      >
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            d="M12 8v5"
            stroke="#b7bfce"
            stroke-width="1.8"
            stroke-linecap="round"
          />
          <circle cx="12" cy="16.2" r="1.05" fill="#b7bfce" />
          <circle
            cx="12"
            cy="12"
            r="9"
            stroke="#b7bfce"
            stroke-width="1.8"
            stroke-opacity="0.45"
          />
        </svg>
      </div>

      <h1 class="mb-3 text-xl font-bold leading-tight">
        {{ $t("no_data.title") }}
      </h1>
      <p class="text-sm leading-relaxed text-[#b7bfce]">
        {{ $t("no_data.description") }}
      </p>
    </div>
  </div>
</template>
