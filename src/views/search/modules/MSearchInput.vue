<script setup>
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useMerchantsStore } from "@/stores/merchants";
import { localePath } from "@/plugins/i18n";
import { buildCategoryIconDataUrl } from "@/utils/categoryIcons";

const emit = defineEmits(["update:modelValue"]);
const { t, locale } = useI18n();
const searchInput = ref(null);
const route = useRoute();
const merchantsStore = useMerchantsStore();

defineProps({
  modelValue: {
    type: String,
    default: "",
  },
});

const updateValue = (event) => {
  emit("update:modelValue", event.target.value);
};

onMounted(() => {
  searchInput.value.focus();
  merchantsStore.getMerchantCategories();
});
</script>

<template>
  <div class="flex items-center gap-4 mb-6">
    <button @click="$router.back()">
      <img src="/icons/p-offer/back-white.svg" alt="" class="w-6" />
    </button>
    <div class="relative rounded-lg flex items-center w-full">
      <img
        src="/icons/p-offer/search.svg"
        alt=""
        class="absolute left-3 640:left-2"
      />
      <input
        type="text"
        ref="searchInput"
        :value="modelValue"
        @input="updateValue"
        class="bg-[#000] border border-[#ffffff1f] text-white pl-11 py-3 pr-3 w-full rounded-2xl focus-visible:outline-none text-sm"
        :placeholder="$t('search')"
      />
    </div>
  </div>
  <div v-if="!modelValue">
    <router-link
      v-for="(category, index) in merchantsStore.merchantCategories"
      :key="index"
      :to="localePath('/offer/' + category?.slug)"
      class="flex items-center gap-4 mb-2 pb-2 border-b border-[#ffffff1f] text-sm"
      @click="closeModal"
    >
      <img
        :src="buildCategoryIconDataUrl(category?.name)"
        :alt="category.name"
        class="w-8 h-8"
      />
      <div class="font-medium">
        {{ category?.name }}
      </div>
    </router-link>
  </div>
</template>
