<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useSearchStore } from "@/stores/search";
import SearchInput from "./modules/MSearchInput.vue";
import SearchFilters from "./modules/MSearchFilters.vue";
import SearchResults from "./modules/MSearchResults.vue";

// Constants
const FILTER_OPTIONS = {
  ALL: "0",
  MERCHANTS: "1",
  CATEGORIES: "2",
};

const searchStore = useSearchStore();
const searchValue = ref("");
const selectedFilter = ref("0");

const filteredData = computed(() => {
  const data = searchStore.searchData;

  if (selectedFilter.value === FILTER_OPTIONS.MERCHANTS) {
    return { merchants: data?.merchants || [] };
  }
  if (selectedFilter.value === FILTER_OPTIONS.CATEGORIES) {
    return { categories: data?.categories || [] };
  }

  return {
    merchants: data?.merchants || [],
    categories: data?.categories || [],
  };
});

onMounted(() => {
  searchStore.searchData = [];
});

watch(searchValue, (value) => {
  if (value.length > 0) {
    searchStore.getSearchData(value);
  } else {
    searchStore.searchData = [];
  }
});
</script>

<template>
  <div class="max-w-[768px] mx-auto py-4 search-page px-4">
    <SearchInput v-model="searchValue" />

    <div class="mt-8">
      <SearchFilters v-if="searchValue.length > 0" v-model="selectedFilter" />

      <SearchResults
        :merchants="filteredData.merchants"
        :categories="filteredData.categories"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.search-page {
  .selector {
    input {
      position: absolute;
      clip: rect(0, 0, 0, 0);
      pointer-events: none;
    }
    label {
      flex-grow: 1;
      flex-shrink: 1;
      flex-basis: 0;
      background-color: transparent;
      border: 0;
      color: #95919f;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 600;
      line-height: 1rem;
      padding: 0.625rem 0;
      transition: 0.3s;
      text-align: center;

      &.active {
        background-color: #141416;
        color: white;
      }
    }
  }
}
</style>
