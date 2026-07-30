<script setup>
import { ref, watch, onMounted, computed, onUnmounted, nextTick } from "vue";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { useMerchantsStore } from "@/stores/merchants";
import { useBannersStore } from "@/stores/banners";
import { useSettingsStore } from "@/stores/settings";
import { localePath } from "@/plugins/i18n";

import MSearch from "./modules/MSearch.vue";
import MBanners from "./modules/MBanners.vue";
import MCategories from "./modules/MCategories.vue";
import MMerchantItem from "./modules/MMerchantItem.vue";
import MNewMerchants from "./modules/MNewMerchants.vue";
import MPopularMerchants from "./modules/MPopularMerchants.vue";
import ModalFilterCategories from "@/components/modals/ModalFilterCategories.vue";
import MHeaderUser from "./modules/MHeaderUser.vue";

const route = useRoute();
const { t, locale } = useI18n();
const merchantsStore = useMerchantsStore();
const bannerStore = useBannersStore();
const settingsStore = useSettingsStore();

const showStickyHeader = ref(false);
const searchRef = ref(null);
const showStickyBanner = ref(false);
const bannerRef = ref(null);

const currentPage = ref(1);
const isInitialLoad = ref(true);
const isLoading = ref(false); // Флаг загрузки
const hasMoreData = ref(true); // Есть ли еще данные

const isAllCategory = computed(() => {
  return !route.params.slug || route.params.slug === "all";
});

const activeCategoryId = computed(() => {
  if (isAllCategory.value) {
    return null;
  }
  const category = merchantsStore.merchantCategories.find(
    (c) => c.slug === route.params.slug
  );
  return category?.id ?? null;
});

// синхронизируемся с meta от бэка (если он присылает current_page)
watch(
  () => merchantsStore.pagination.current_page,
  (v) => {
    if (typeof v === "number" && v > 0 && v !== currentPage.value) {
      currentPage.value = v;
    }
  },
  { immediate: true }
);

// sticky
function handleScroll() {
  if (searchRef.value) {
    const rect = searchRef.value.getBoundingClientRect();
    showStickyHeader.value = rect.top <= 0;
  }
  if (bannerRef.value) {
    const rect = bannerRef.value.getBoundingClientRect();
    showStickyBanner.value = rect.top <= 0;
  }
}

// Добавляем debounce для предотвращения множественных вызовов
let scrollTimeout = null;

// Новая функция для бесконечной прокрутки
const handleInfiniteScroll = async () => {
  // Очищаем предыдущий таймер
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }

  // Устанавливаем новый таймер
  scrollTimeout = setTimeout(async () => {
    // Проверяем, что не загружаемся и есть еще данные
    if (isLoading.value || !hasMoreData.value) return;

    // Проверяем, что пользователь прокрутил почти до конца (за 300px до конца)
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    if (scrollTop + windowHeight >= documentHeight - 300) {
      console.log("Запускаем загрузку следующей страницы...");
      await loadNextPage();
    }
  }, 100); // Задержка 100мс
};

// Функция загрузки следующей страницы
const loadNextPage = async () => {
  if (isLoading.value || !hasMoreData.value) {
    console.log("Пропускаем загрузку - уже загружается или нет данных");
    return;
  }

  console.log("Начинаем загрузку страницы:", currentPage.value + 1);
  isLoading.value = true;
  const nextPage = currentPage.value + 1;

  try {
    const categoryId = activeCategoryId.value;

    console.log("Загружаем страницу:", nextPage, "для категории:", categoryId);

    // Загружаем следующую страницу с append = true
    await merchantsStore.getMerchants(
      categoryId,
      null,
      nextPage,
      null,
      true // append = true для добавления данных
    );

    currentPage.value = nextPage;

    // Проверяем, есть ли еще данные
    const totalPages = merchantsStore.pagination.last_page;
    hasMoreData.value = nextPage < totalPages;

    console.log(
      "Загружена страница:",
      nextPage,
      "Всего страниц:",
      totalPages,
      "Есть еще данные:",
      hasMoreData.value
    );
  } catch (error) {
    console.error("Ошибка загрузки данных:", error);
    // При ошибке не увеличиваем номер страницы
  } finally {
    isLoading.value = false;
    console.log("Загрузка завершена");
  }
};

// заголовок
const pageTitle = computed(() => {
  const slug = route.params.slug;
  if (!slug || slug === "all") return t("discounts");
  const category = merchantsStore.merchantCategories.find(
    (c) => c.slug === slug
  );
  return category ? category.name : t("discounts");
});

const loadData = async () => {
  await merchantsStore.getMerchantCategories();
  await bannerStore.getBanners();
  await merchantsStore.getNewMerchants();
  await merchantsStore.getPopularMerchants();

  // размер страницы
  if (typeof merchantsStore.setPerPage === "function") {
    merchantsStore.setPerPage(18);
  } else {
    merchantsStore.pagination.per_page = 18;
  }

  currentPage.value = 1;
  hasMoreData.value = true; // Сбрасываем флаг
  isLoading.value = false; // Сбрасываем флаг загрузки

  console.log("Начинаем загрузку данных для:", route.params.slug || "all");

  if (isAllCategory.value) {
    // ⬇️ первый вызов: передаём фильтры (category_id=null), district_ids (если есть), page=1
    await merchantsStore.getMerchants(null, null, 1);
    await merchantsStore.getSummaryMerchants();
  } else {
    // ⬇️ первый вызов для категории: УСТАНАВЛИВАЕМ фильтр category_id
    await merchantsStore.getMerchants(activeCategoryId.value, null, 1);
    await merchantsStore.getSummaryMerchants(activeCategoryId.value);
  }

  // Проверяем, есть ли еще данные после первой загрузки
  const totalPages = merchantsStore.pagination.last_page;
  hasMoreData.value = currentPage.value < totalPages;

  console.log(
    "Первая загрузка завершена. Страница:",
    currentPage.value,
    "Всего страниц:",
    totalPages,
    "Есть еще данные:",
    hasMoreData.value
  );

  isInitialLoad.value = false;
  window.addEventListener("scroll", handleScroll);
  window.addEventListener("scroll", handleInfiniteScroll);
};

const scrollToListTop = async () => {
  await nextTick();
  const listTop = searchRef.value?.offsetTop ?? 0;
  window.scrollTo({ top: listTop - 80, behavior: "smooth" });
};

// url для карточки
const getMerchantUrl = (merchant) => {
  const category = merchantsStore.merchantCategories.find(
    (cat) => cat.id === merchant.category.id
  );
  if (!category) {
    console.warn("Не найдена категория по ID:", merchant.category_id, merchant);
    return localePath("/offer/unknown/" + merchant.slug);
  }
  return localePath(`/offer/${category.slug}/${merchant.slug}`);
};

onMounted(loadData);

// при смене категории полностью перезагружаем
watch(
  () => route.params.slug,
  async () => {
    isInitialLoad.value = true;
    currentPage.value = 1;
    hasMoreData.value = true;
    settingsStore.isFilterCategories = false;
    await loadData();
  }
);

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  window.removeEventListener("scroll", handleInfiniteScroll);
  // Очищаем таймер при размонтировании
  if (scrollTimeout) {
    clearTimeout(scrollTimeout);
  }
  settingsStore.isFilterCategories = false;
});
</script>

<template>
  <!-- Sticky Banner -->
  <transition name="fade-slide">
    <div
      v-if="showStickyBanner"
      class="hidden fixed top-[48px] left-0 w-full z-40 bg-white text-center py-2 shadow-md 768:block"
    >
      <div class="site-container text-amber-900 font-medium">
        <MCategories categoriesType="fixed-header" />
      </div>
    </div>
  </transition>

  <div class="w-full">
    <MHeaderUser />
    <!-- search -->
    <div
      ref="searchRef"
      class="w-full bg-[#141416] border-b border-[#ffffff1f] p-4"
    >
      <MSearch />
    </div>
    <div class="flex items-start flex-col gap-4">
      <MCategories />

      <MNewMerchants
        v-if="isAllCategory"
        :merchants="merchantsStore.newMerchants"
        :getMerchantUrl="getMerchantUrl"
      />
      <MPopularMerchants
        v-if="isAllCategory"
        :merchants="merchantsStore.popularMerchants"
        :getMerchantUrl="getMerchantUrl"
      />
      <MMerchantItem
        :merchants="merchantsStore.merchants"
        :getMerchantUrl="getMerchantUrl"
      />
    </div>
  </div>

  <ModalFilterCategories v-if="settingsStore.isFilterCategories" />
</template>

<style lang="scss">
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}
</style>
