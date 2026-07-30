<script setup>
import { onMounted } from "vue";
import { useFavoritesStore } from "@/stores/favorites";
import { localePath } from "@/plugins/i18n";

const favoritesStore = useFavoritesStore();

onMounted(async () => {
  await favoritesStore.getFavorites();
});
</script>

<template>
  <div class="favorites-page py-10 768:pb-[100px] 480:py-6">
    <div class="site-container">
      <div class="site-title">{{ $t("favorites") }}</div>
      <div v-if="favoritesStore.favorites.length > 0">
        <div
          class="grid grid-cols-4 gap-3 768:grid-cols-2 480:!grid-cols-1 480:gap-1"
        >
          <router-link
            v-for="(item, index) in favoritesStore.favorites"
            :key="index"
            :to="localePath(`/offer/${item.category.slug}/${item.slug}`)"
            class="transition-all duration-300 rounded-lg p-2 relative border border-[#ffffff1f] hover:border-[#f5f7fb]"
          >
            <div class="w-16 mb-4 rounded-lg">
              <img
                :src="`https://main.primeclub.uz/uploads/${item.logo}`"
                :alt="item.name"
                class="w-full h-full object-cover rounded-lg"
              />
            </div>
            <div class="font-semibold mb-1 flex items-center gap-1.5">
              {{ item.name }}
            </div>
            <div class="text-sm text-gray-500">
              {{ item.excerpt }}
            </div>
          </router-link>
        </div>
      </div>
      <div v-else>
        <div class="empty-state">
          <div class="empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              ></path>
            </svg>
          </div>
          <div class="empty-title">{{ $t("no_favorites_yet") }}</div>
          <div class="empty-text">
            {{ $t("dont_have_any_favorite_offers_yet") }}<br />{{
              $t("add_your_favorite_offers_favorites_quick_access")
            }}
          </div>
        </div>
        <div class="flex justify-center fixed bottom-28 left-0 w-full">
          <router-link :to="localePath('/offer')" class="site-btn-grey">
            <span>{{ $t("go_to_catalog") }}</span>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.favorites-page {
  .empty-state {
    text-align: center;
    padding-top: 15vh;

    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background-color: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 40px;
        height: 40px;
        stroke: #9ca3af;
        stroke-width: 2;
      }
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
    }
    .empty-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
  }
}
</style>
