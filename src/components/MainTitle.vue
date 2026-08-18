<script setup>
import { useAttrs } from "vue";
import { useRouter } from "vue-router";

// Единый хедер экрана: стрелка «Назад» слева, заголовок по центру.
// Кнопка встроена в поток (не плавает поверх контента), поэтому ничего
// не перекрывает — одинаково на iOS и Android.
defineProps({
  pageTitle: {
    type: String,
    required: true,
  },
  showBack: {
    type: Boolean,
    default: true,
  },
});

// `back` намеренно не объявлен в defineEmits: так слушатель остаётся в attrs
// и мы можем понять, задал ли родитель своё поведение (например, закрытие
// модалки сертификата). Если нет — обычная навигация назад.
const attrs = useAttrs();
const router = useRouter();

function goBack() {
  if (typeof attrs.onBack === "function") {
    attrs.onBack();
    return;
  }
  router.back();
}
</script>

<template>
  <div class="flex items-center gap-2 w-full min-h-[44px] py-2">
    <button
      v-if="showBack"
      @click="goBack"
      type="button"
      class="w-11 h-11 -ml-2.5 shrink-0 text-white hover:opacity-80 active:scale-95 transition-all flex items-center justify-center rounded-full"
      aria-label="Назад"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-6 h-6"
      >
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
    </button>

    <div class="flex-1 min-w-0 text-lg font-semibold text-center truncate">
      {{ pageTitle }}
    </div>

    <!-- Зеркальный отступ под кнопку, чтобы заголовок стоял ровно по центру -->
    <div class="shrink-0 flex items-center justify-end min-w-[34px]">
      <slot name="action" />
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
