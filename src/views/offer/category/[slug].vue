<script setup>
import { ref, watch, onMounted, onUnmounted, computed } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useMerchantsStore } from "@/stores/merchants";
import { useBannersStore } from "@/stores/banners";
import { useSettingsStore } from "@/stores/settings";
import { localePath } from "@/plugins/i18n";

import MSearch from "../modules/MSearch.vue";
import MCategories from "../modules/MCategories.vue";
import MMerchantItem from "../modules/MMerchantItem.vue";
import RegionFilter from "@/components/regionFilter.vue";
import MHeaderUser from "../modules/MHeaderUser.vue";
import MainTitle from "@/components/MainTitle.vue";

const route = useRoute();
const { t } = useI18n();
const merchantsStore = useMerchantsStore();
const bannerStore = useBannersStore();
const settingsStore = useSettingsStore();

const currentPage = ref(1);
const isLoading = ref(false);
const isPageLoading = ref(true);
const hasMoreData = ref(true);
let scrollTimeout = null;

const activeCategory = computed(() => {
  return merchantsStore.merchantCategories.find(
    (c) => c.slug === route.params.slug
  );
});

const activeCategoryId = computed(() => activeCategory.value?.id ?? null);

const pageTitle = computed(() => activeCategory.value?.name || t("discounts"));

const handleInfiniteScroll = async () => {
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  scrollTimeout = setTimeout(async () => {
    if (isLoading.value || !hasMoreData.value) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 300) {
      await loadNextPage();
    }
  }, 100);
};

const loadNextPage = async () => {
  if (isLoading.value || !hasMoreData.value) return;

  isLoading.value = true;
  const nextPage = currentPage.value + 1;

  try {
    await merchantsStore.getMerchants(
      activeCategoryId.value,
      null,
      nextPage,
      null,
      true
    );

    currentPage.value = nextPage;
    const totalPages = merchantsStore.pagination.last_page;
    hasMoreData.value = nextPage < totalPages;
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
  } finally {
    isLoading.value = false;
  }
};

const loadData = async () => {
  isPageLoading.value = true;
  try {
    await merchantsStore.getMerchantCategories();
    await bannerStore.getBanners();

    if (typeof merchantsStore.setPerPage === "function") {
      merchantsStore.setPerPage(18);
    } else {
      merchantsStore.pagination.per_page = 18;
    }

    currentPage.value = 1;
    hasMoreData.value = true;
    isLoading.value = false;

    await merchantsStore.getMerchants(activeCategoryId.value, null, 1);
    await merchantsStore.getSummaryMerchants(activeCategoryId.value);

    const totalPages = merchantsStore.pagination.last_page;
    hasMoreData.value = currentPage.value < totalPages;
  } finally {
    isPageLoading.value = false;
  }
};

const getMerchantUrl = (merchant) => {
  const category = merchantsStore.merchantCategories.find(
    (cat) => cat.id === merchant.category.id
  );
  if (!category) {
    return localePath("/offer/unknown/" + merchant.slug);
  }
  return localePath(`/offer/${category.slug}/${merchant.slug}`);
};

onMounted(async () => {
  await loadData();
  window.addEventListener("scroll", handleInfiniteScroll);
});

watch(
  () => route.params.slug,
  async () => {
    settingsStore.isFilterCategories = false;
    await loadData();
  }
);

onUnmounted(() => {
  window.removeEventListener("scroll", handleInfiniteScroll);
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  settingsStore.isFilterCategories = false;
});
</script>

<template>
  <div v-if="isPageLoading" class="w-full p-4">
    <div class="w-48 h-7 rounded-lg skeleton-shimmer mb-5"></div>
    <div class="grid grid-cols-1 gap-4">
      <div
        v-for="idx in 6"
        :key="idx"
        class="rounded-2xl border border-[#ffffff1f] overflow-hidden"
      >
        <div class="w-full h-[160px] skeleton-shimmer"></div>
        <div class="p-4 bg-[#141416]">
          <div class="h-4 rounded skeleton-shimmer mb-3 w-2/3"></div>
          <div class="h-3 rounded skeleton-shimmer w-full mb-2"></div>
          <div class="h-3 rounded skeleton-shimmer w-4/5"></div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="w-full">
    <div class="w-full bg-[#141416] border-b border-[#ffffff1f] p-4 mb-4">
      <MainTitle :pageTitle="pageTitle" />
      <div class="flex items-center gap-2">
        <MSearch class="w-full" />
        <button
          @click="settingsStore.isFilterCategories = true"
          class="min-w-11 h-11 bg-[#f5f7fb] rounded-xl flex items-center justify-center"
        >
          <img src="/icons/search-burger.svg" alt="" class="w-5" />
        </button>
      </div>
    </div>

    <div class="flex items-start gap-6 768:flex-col 768:gap-4">
      <MMerchantItem
        :merchants="merchantsStore.merchants"
        :showTitle="false"
        :getMerchantUrl="getMerchantUrl"
      />
    </div>
  </div>

  <RegionFilter
    v-if="settingsStore.isFilterCategories"
    @close="settingsStore.isFilterCategories = false"
  />
</template>

<style scoped>
.skeleton-shimmer {
  background: linear-gradient(90deg, #1a1a1d 25%, #27272a 37%, #1a1a1d 63%);
  background-size: 400% 100%;
  animation: skeleton-loading 1.4s ease infinite;
}

@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
