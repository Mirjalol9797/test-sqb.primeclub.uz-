<script setup>
import {
  defineProps,
  defineExpose,
  ref,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { useLoginStore } from "@/stores/login";
import { useSettingsStore } from "@/stores/settings";
import TmButton from "@/components/ui/TmButton.vue";
import { useFavoritesStore } from "@/stores/favorites.js";
import ModalAboniment from "@/components/modals/ModalAboniment.vue";

const loginStore = useLoginStore();
const settingsStore = useSettingsStore();
const favoritesStore = useFavoritesStore();
const route = useRoute();
const bottomButton = ref(null);
const showCodes = ref({});
const certificateContainer = ref(null);

const scrollToButton = () => {
  if (certificateContainer.value) {
    certificateContainer.value.scrollIntoView({
      behavior: "smooth",
      top: 90,
    });
  }
};

defineExpose({
  scrollToButton,
});

const props = defineProps({
  merchant: {
    type: Object,
    default: () => ({}),
  },
  merchantOffer: {
    type: Object,
    required: true,
  },
  offerCode: {
    type: String,
    default: "",
  },
  showOfferCodeBtn: {
    type: Boolean,
    required: true,
  },
  codeError: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits([
  "getOfferCode",
  "copyOfferCode",
  "createCertificate",
  "openMerchantBranches",
]);

const handleToggleFavorite = () => {
  if (props.merchant?.is_favorite) {
    favoritesStore.deleteFavorite(props.merchant.id);
  } else {
    favoritesStore.addFavorite(props.merchant.id);
  }
  // Обновляем состояние локально для мгновенной обратной связи
  props.merchant.is_favorite = !props.merchant.is_favorite;
};

function showCode(item) {
  emit("getOfferCode", item);
  showCodes.value[item.id] = true;
}

// Копировать код для конкретного предложения
function copyCode(item) {
  emit("copyOfferCode", item._code);
}

function openDownloadAppModal() {
  settingsStore.isDownloadAppModal = true;
}

watch(
  () => route.path,
  () => {
    // Закрываем модалку при изменении маршрута
    settingsStore.isAboniment = false;
  }
);

onUnmounted(() => {
  settingsStore.isAboniment = false;
});
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
    <div class="mb-4">
      <div class="font-semibold text-base">
        {{ merchant?.name }}
      </div>
      <div class="text-gray-500 text-sm">
        {{ merchant?.category?.name }}
      </div>
    </div>

    <div v-for="(item, index) in merchantOffer" :key="index">
      <div class="text-sm 768:mb-2 font-semibold">
        {{ item?.name }}
      </div>

      <div class="hidden 768:block">
        <template v-if="item?.skip_certificate == true">
          <button
            class="site-btn-grey w-full !h-11 !max-w-full !rounded-lg gap-2 show-code-btn"
            @click="showCode(item)"
            v-if="
              !showCodes[item.id] ||
              (codeError && Object.keys(codeError).length > 0)
            "
          >
            <img src="/icons/p-offer/show1.svg" alt="" class="w-5" />
            {{ $t("show_code") }}
          </button>
          <button
            class="site-btn-grey w-full !h-11 !max-w-full !rounded-lg gap-2 show-code"
            v-else
            @click="copyCode(item)"
          >
            <img src="/icons/p-offer/copy.svg" alt="" class="w-4" />
            {{ item._code }}
          </button>
        </template>
        <template v-else>
          <button
            class="site-btn-grey w-full"
            @click="$emit('createCertificate', item?.id)"
            v-if="merchant?.type == 'single'"
          >
            {{ $t("get_certificate") }}
          </button>
          <button
            class="site-btn-grey w-full"
            @click="$emit('openMerchantBranches', item?.id)"
            v-else
          >
            {{ $t("get_certificate") }}
          </button>
        </template>
      </div>
    </div>

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

  <ModalAboniment v-if="settingsStore.isAboniment" />
</template>

<style lang="scss" scoped>
.discount-card {
  background: linear-gradient(
    50deg,
    #ffffff 0%,
    #ffffff 50%,
    #ffffff 65%,
    rgba(46, 250, 199, 0.6) 120%
  );
  border: 1px solid rgba(243, 244, 246, 1);
  background-color: rgba(249, 250, 251, 1);

  @media (max-width: 768px) {
    min-width: 320px;
  }
}
</style>
