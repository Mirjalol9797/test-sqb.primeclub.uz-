<!-- src/components/modules/MCategory.vue -->
<script setup>
import { computed, ref } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useMerchantsStore } from "@/stores/merchants";
import { localePath } from "@/plugins/i18n";
import { buildCategoryIconDataUrl } from "@/utils/categoryIcons";

const route = useRoute();
const { t } = useI18n();
const merchantsStore = useMerchantsStore();
const showAllCategories = ref(false);
const INITIAL_VISIBLE_ITEMS = 8;

const props = defineProps({
  categoriesType: {
    type: String,
    default: "offer",
  },
});

const emit = defineEmits(["closeModal"]);
async function closeModal(id) {
  if (props.categoriesType === "filter-modal") {
    emit("closeModal");
  }
  merchantsStore.getSummaryMerchants(id || null);
}

const shouldCollapseCategories = computed(
  () => props.categoriesType === "offer"
);
const visibleCategories = computed(() => {
  if (!shouldCollapseCategories.value || showAllCategories.value) {
    return merchantsStore.merchantCategories;
  }

  // Показываем 8 элементов вместе с "Все", значит категорий здесь 7.
  return merchantsStore.merchantCategories.slice(0, INITIAL_VISIBLE_ITEMS - 1);
});

const hasHiddenCategories = computed(
  () =>
    shouldCollapseCategories.value &&
    !showAllCategories.value &&
    merchantsStore.merchantCategories.length > INITIAL_VISIBLE_ITEMS - 1
);
</script>

<template>
  <div
    class="categories w-full bg-[#141416] p-4"
    :class="
      categoriesType == 'filter-modal'
        ? 'categories-filter-modal'
        : categoriesType == 'fixed-header'
        ? 'categories-fixed-header'
        : ''
    "
  >
    <div class="grid grid-cols-4 gap-2">
      <!-- "Все" -->
      <router-link
        :to="localePath('/offer')"
        :class="[
          'categories__item flex items-center gap-2  text-xs flex-col text-center text-[#8d94a6]',
        ]"
        @click="closeModal('')"
      >
        <div
          :class="!route.params.slug ? 'bg-white' : ''"
          class="rounded-lg categories__item-icon transition-colors flex items-center justify-center"
        >
          <img
            :src="buildCategoryIconDataUrl('all', !route.params.slug)"
            alt="все"
            class="w-10 h-10"
          />
        </div>
        <div
          :class="!route.params.slug ? 'font-medium' : ''"
          class="categories__item-name"
        >
          {{ $t("all") }}
        </div>
      </router-link>
      <!-- Категории -->
      <router-link
        v-for="(category, index) in visibleCategories"
        :key="index"
        :to="localePath('/offer/' + category?.slug)"
        :class="[
          'categories__item flex items-center gap-2  text-xs flex-col  text-center min-w-[80px] text-[#8d94a6]',
        ]"
        @click="closeModal(category?.id)"
      >
        <div
          :class="route.params.slug === category?.slug ? 'bg-white' : ''"
          class="rounded-lg categories__item-icon transition-colors flex items-center justify-center"
        >
          <img
            :src="
              buildCategoryIconDataUrl(
                category?.name,
                route.params.slug === category?.slug
              )
            "
            :alt="category.name"
            class="w-10 h-10"
          />
        </div>
        <div
          :class="route.params.slug === category?.slug ? 'font-medium' : ''"
          class="categories__item-name"
        >
          {{ category?.name }}
        </div>
      </router-link>
    </div>

    <button
      v-if="hasHiddenCategories"
      type="button"
      class="w-full mt-3 rounded-xl border border-[#ffffff2b] text-[#d5d9e2] py-2.5 text-sm font-medium hover:bg-[#ffffff0f] transition-colors"
      @click="showAllCategories = true"
    >
      {{ $t("show_all") }}
    </button>
  </div>
</template>

<style lang="scss" scoped>
.categories-filter-modal {
  .categories__wrap {
    flex-wrap: wrap;
    display: grid;
    grid-template-columns: repeat(6, minmax(0, 1fr));

    @media (max-width: 640px) {
      grid-template-columns: repeat(5, minmax(0, 1fr));
    }
    @media (max-width: 480px) {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
    @media (max-width: 390px) {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }
}

.categories-fixed-header {
  .categories__title {
    display: none;
  }
  .categories__item-icon {
    display: none;
  }
  .categories__item {
    white-space: nowrap;
    min-width: auto;
    color: #333;
    background-color: #f7f7f7;
    border-radius: 8px;
  }
}
</style>
