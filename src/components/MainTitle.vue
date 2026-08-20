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
  <div class="flex items-center justify-center gap-2 w-full min-h-[44px] py-2">
    <div class="text-lg font-semibold text-center truncate">
      {{ pageTitle }}
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
