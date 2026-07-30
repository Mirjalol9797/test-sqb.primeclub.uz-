<script setup>
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
import { useMerchantsStore } from "@/stores/merchants";
import { localePath } from "@/plugins/i18n";
import { buildCategoryIconDataUrl } from "@/utils/categoryIcons";
import MainTitle from "@/components/MainTitle.vue";
import axios from "@/plugins/api";

const emit = defineEmits(["close"]);
const route = useRoute();
const merchantsStore = useMerchantsStore();
const districts = ref([]);

const closeModal = () => {
  emit("close");
};

const loadDistricts = async () => {
  try {
    const res = await axios.get("v1/districts");
    districts.value = Array.isArray(res?.data?.data) ? res.data.data : [];
  } catch (error) {
    districts.value = [];
    console.error("Ошибка api `v1/districts`", error);
  }
};

onMounted(async () => {
  if (!merchantsStore.merchantCategories?.length) {
    await merchantsStore.getMerchantCategories();
  }
  await loadDistricts();
});
</script>

<template>
  <div
    class="fixed inset-0 z-50 bg-[#141416] overflow-y-auto p-4 max-w-[640px] mx-auto"
  >
    <MainTitle :pageTitle="$t('filter')" />

    <div class="grid grid-cols-4 gap-2 mb-6">
      <router-link
        v-for="(category, index) in merchantsStore.merchantCategories"
        :key="index"
        :to="localePath('/offer/' + category?.slug)"
        class="categories__item flex items-center gap-2 text-xs flex-col text-center min-w-[80px] text-[#8d94a6]"
        @click="closeModal"
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

    <div>
      <div class="bg-[#141416] border border-[#ffffff1f] rounded-2xl">
        <div
          v-for="district in districts"
          :key="district.id"
          class="px-5 py-4 text-sm w-full border-b border-[#ffffff1f]"
        >
          {{ district.name }}
        </div>
      </div>
    </div>
  </div>
</template>
