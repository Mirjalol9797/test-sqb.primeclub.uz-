<script setup>
import { computed } from "vue";
import { useFavoritesStore } from "@/stores/favorites";

// Кнопка «в избранное». Одна на весь проект: карточка каталога, карточка
// мерчанта и страница избранного используют её же, поэтому состояние сердца
// везде одинаковое.
const props = defineProps({
  merchant: {
    type: Object,
    default: () => ({}),
  },
});

const favoritesStore = useFavoritesStore();

const isActive = computed(() => {
  // Список мерчантов и детальная страница приходят с готовым is_favorite.
  if (typeof props.merchant?.is_favorite === "boolean") {
    return props.merchant.is_favorite;
  }
  // Элементы страницы избранного этого поля не имеют: они избранные по факту.
  return favoritesStore.isFavorite(props.merchant?.id);
});

// Кнопка часто лежит внутри router-link карточки — переход по ссылке гасим.
function onClick(e) {
  e.preventDefault();
  e.stopPropagation();
  favoritesStore.toggleFavorite(props.merchant);
}
</script>

<template>
  <button
    v-if="merchant?.id"
    type="button"
    class="w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity disabled:opacity-50"
    :disabled="favoritesStore.isPending(merchant.id)"
    :aria-pressed="isActive"
    :aria-label="$t(isActive ? 'remove_from_favorites' : 'add_to_favorites')"
    @click="onClick"
  >
    <img
      :src="
        isActive
          ? '/icons/p-offer/favorite-like.svg'
          : '/icons/p-offer/favorite.svg'
      "
      alt=""
      class="w-5"
    />
  </button>
</template>
