<script setup>
// Шторка «Сертификат уже получен». Оформление один в один со шагом
// «Вы уже здесь?» из ModalGlobalDownloadCertificate: тёмный фон, та же
// ручка, та же кнопка закрытия, те же типографика и кнопки.
defineProps({
  title: {
    type: String,
    default: "Сертификат уже получен",
  },
  description: {
    type: String,
    default:
      "Вы уже получали сертификат в этом заведении сегодня. Найти его можно в разделе Сертификаты",
  },
});

const emit = defineEmits(["close", "go-certificates"]);
</script>

<template>
  <div class="absolute inset-0 z-10 bg-black/45 flex items-end">
    <div
      class="relative w-full bg-[#141416] text-white border-t border-white rounded-t-3xl px-5 pt-3 pb-6"
    >
      <div class="w-[56px] h-[6px] rounded-full bg-[#e4e4e4] mx-auto mb-4"></div>
      <button
        type="button"
        class="absolute right-4 top-7 min-w-8 h-8 rounded-full border border-[#e5e5ea] flex items-center justify-center text-2xl leading-none text-white"
        @click="emit('close')"
      >
        ×
      </button>

      <div class="text-base font-semibold mb-1 pr-12">{{ title }}</div>
      <div class="text-sm text-[#5e6068] mb-3">{{ description }}</div>

      <button
        type="button"
        class="w-full mt-4 site-btn-grey"
        @click="emit('go-certificates')"
      >
        {{ $t("go_to_certificates") }}
      </button>
      <button
        type="button"
        class="w-full mt-3 text-sm underline text-[#5e6068]"
        @click="emit('close')"
      >
        {{ $t("close") }}
      </button>
    </div>
  </div>
</template>
