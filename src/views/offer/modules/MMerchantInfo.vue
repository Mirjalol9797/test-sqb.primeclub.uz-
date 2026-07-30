<script setup>
import { computed, defineProps, ref } from "vue";
import TmButton from "@/components/ui/TmButton.vue";
import { useFavoritesStore } from "@/stores/favorites.js";
import { useSettingsStore } from "@/stores/settings";

const favoritesStore = useFavoritesStore();
const settingsStore = useSettingsStore();
const isDetailsVisible = ref(false);

const props = defineProps({
  merchant: {
    type: Object,
    default: () => ({}),
  },
  onScrollToCertificate: {
    type: Function,
  },
  merchantOffer: {
    type: [Array, Object],
    default: () => [],
  },
});

const normalizedMerchantOffers = computed(() => {
  if (Array.isArray(props.merchantOffer)) {
    return props.merchantOffer;
  }
  if (Array.isArray(props.merchantOffer?.data)) {
    return props.merchantOffer.data;
  }
  return [];
});

const warningOffer = computed(() => {
  return (
    normalizedMerchantOffers.value.find((item) => {
      const warning = item?.warning_text;
      return (
        warning &&
        typeof warning === "object" &&
        (warning.warning_title ||
          warning.warning_description ||
          warning.button_text?.text ||
          warning.button_text?.data)
      );
    }) || null
  );
});

const handleToggleFavorite = () => {
  if (props.merchant?.is_favorite) {
    favoritesStore.deleteFavorite(props.merchant.id);
  } else {
    favoritesStore.addFavorite(props.merchant.id);
  }
  // Обновляем состояние локально для мгновенной обратной связи
  props.merchant.is_favorite = !props.merchant.is_favorite;
};
</script>

<template>
  <div class="mb-4 w-full p-3 rounded-2xl relative border border-[#ffffff1f]">
    <div class="w-16 mb-4 rounded-lg">
      <img
        :src="`https://main.primeclub.uz/uploads/${merchant?.logo}`"
        alt=""
        class="rounded-lg"
      />
    </div>
    <div>
      <div class="font-semibold text-base">
        {{ merchant?.name }}
      </div>
      <div class="text-gray-500 text-sm">
        {{ merchant?.category?.name }}
      </div>
    </div>
    <div
      v-if="warningOffer"
      class="mt-3 border border-[#ffffff1f] rounded-2xl p-3"
    >
      <div class="font-medium mb-1">
        {{ warningOffer.warning_text?.warning_title || $t("attention") }}
      </div>
      <div class="text-sm mb-2">
        {{
          warningOffer.warning_text?.warning_description || $t("attention_desc")
        }}
      </div>
      <button
        class="bg-white text-black text-xs px-3 py-1.5 rounded-lg"
        @click="isDetailsVisible = !isDetailsVisible"
      >
        {{
          isDetailsVisible
            ? warningOffer.warning_text?.button_text?.text || $t("hide")
            : $t("show_more")
        }}
      </button>
      <div
        v-if="isDetailsVisible"
        class="text-sm border border-[#ffffff1f] p-3 rounded-2xl mt-2"
      >
        {{
          warningOffer.warning_text?.button_text?.data || $t("attention_desc2")
        }}
      </div>
    </div>
    <!-- <button class="site-btn-grey w-full" @click="onScrollToCertificate">
      {{ $t("get_certificate") }}
    </button> -->

    <!-- <button
      class="absolute top-4 right-4"
      @click="handleToggleFavorite"
      v-if="merchant?.is_favorite"
    >
      <img src="/icons/p-offer/favorite-like.svg" alt="" class="w-5" />
    </button>
    <button class="absolute top-4 right-4" @click="handleToggleFavorite" v-else>
      <img src="/icons/p-offer/favorite.svg" alt="" class="w-5" />
    </button> -->
  </div>
</template>
