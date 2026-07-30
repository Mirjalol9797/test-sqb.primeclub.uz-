<script setup>
import { useSettingsStore } from "@/stores/settings";
import MCategories from "@/views/offer/modules/MCategories.vue";

const settingsStore = useSettingsStore();
</script>

<template>
  <ui-mobile-modal
    v-model="settingsStore.isFilterCategories"
    title="Фильтры"
    width="560"
    :closeBtn="true"
    titleClass=""
    classWrap="modal-wrap"
  >
    <template #modal_content>
      <MCategories
        categoriesType="filter-modal"
        @closeModal="settingsStore.isFilterCategories = false"
      />
    </template>
  </ui-mobile-modal>
</template>
