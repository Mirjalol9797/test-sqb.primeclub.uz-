<script setup>
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
  <div class="absolute inset-0 z-10 bg-black/40 flex items-end">
    <div
      class="w-full bg-[#f3f1f5] rounded-t-3xl px-4 pt-4 pb-6 text-[#1f1f27]"
    >
      <div class="w-14 h-1.5 bg-[#c8c7ce] rounded-full mx-auto mb-5"></div>
      <div class="relative">
        <button
          type="button"
          class="absolute right-0 top-[-10px] min-w-8 h-8 rounded-full border border-[#e5e5ea] flex items-center justify-center text-2xl leading-none text-[#2f2f35]"
          @click="emit('close')"
        >
          ×
        </button>
        <div class="text-xl font-semibold pr-12 mb-2">
          Сертификат уже получен
        </div>
      </div>
      <div class="text-sm text-[#5e6068] mb-4">
        Вы уже получали сертификат в этом заведении сегодня. Найти его можно в
        разделе Сертификаты
      </div>
      <button
        type="button"
        class="w-full py-4 rounded-2xl bg-[#11b097] text-white text-sm"
        @click="emit('go-certificates')"
      >
        Перейти к сертификатам
      </button>
      <button
        type="button"
        class="w-full mt-4 text-sm underline text-[#2c2d33]"
        @click="emit('close')"
      >
        Закрыть
      </button>
    </div>
  </div>
</template>
