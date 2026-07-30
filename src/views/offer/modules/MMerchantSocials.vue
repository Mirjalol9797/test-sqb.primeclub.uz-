<script setup>
const props = defineProps({
  socials: {
    type: Object,
    default: {},
  },
  blockClass: {
    type: String,
  },
});
</script>

<template>
  <div :class="blockClass" class="p-4 rounded-2xl mb-4 480:mb-3 480:text-sm">
    <div class="text-sm mb-2.5 font-semibold">
      {{ $t("contacts") }}
    </div>

    <div class="text-sm font-medium mb-2.5" v-if="socials?.address">
      {{ $t("address") }}: {{ socials?.address }}
    </div>

    <div class="grid grid-cols-2 gap-3 480:grid-cols-1">
      <div
        v-if="socials?.phones?.length > 0"
        v-for="(phone, index) in socials?.phones"
        :key="index"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl h-[52px]"
      >
        <a :href="`tel:${phone}`" class="flex items-center gap-2">
          <img src="/icons/socials/phone.svg" alt="" class="w-6" />
          <div class="font-medium text-sm">{{ phone }}</div>
        </a>
      </div>
      <!-- telegram -->
      <div
        v-if="socials?.socials?.telegram"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl"
      >
        <div class="flex items-center gap-2">
          <img src="/icons/socials/tg2.svg" alt="" class="w-6" />
          <div class="font-medium text-sm">Telegram</div>
        </div>
        <a
          :href="socials?.socials?.telegram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/socials/link.svg" alt="" />
        </a>
      </div>
      <!-- instagram -->
      <div
        v-if="socials?.socials?.instagram"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl"
      >
        <div class="flex items-center gap-2">
          <img src="/icons/socials/inst.svg" alt="" class="w-6" />
          <div class="font-medium text-sm">Instagram</div>
        </div>
        <a
          :href="socials?.socials?.instagram"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/socials/link.svg" alt="" class="w-6" />
        </a>
      </div>
      <!-- website -->
      <div
        v-if="socials?.socials?.website"
        class="flex items-center justify-between bg-[#141416] px-3 py-2 rounded-xl"
      >
        <div class="flex items-center gap-2">
          <img src="/icons/socials/web.svg" alt="" class="w-6" />
          <div class="font-medium text-sm">Website</div>
        </div>
        <a
          :href="socials?.socials?.website"
          target="_blank"
          rel="noopener noreferrer"
        >
          <img src="/icons/socials/link.svg" alt="" />
        </a>
      </div>
    </div>
  </div>
</template>

<style></style>
