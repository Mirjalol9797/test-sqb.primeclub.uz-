import { defineStore } from "pinia";
import { toast } from "vue3-toastify";
import axios from "@/plugins/api";
import i18n from "@/plugins/i18n";

export const useFavoritesStore = defineStore("favoritesStore", {
  state: () => ({
    favorites: [],
    // id мерчантов, по которым запрос ещё в полёте: защита от двойного тапа
    pendingIds: [],
  }),
  getters: {
    isFavorite: (state) => (merchantId) =>
      state.favorites.some((item) => item.id === merchantId),
    isPending: (state) => (merchantId) => state.pendingIds.includes(merchantId),
  },
  actions: {
    async getFavorites() {
      try {
        const res = await axios.get(`v1/merchants/favorites`);
        this.favorites = res.data?.data || [];
      } catch (error) {
        console.error("Ошибка api `v1/merchants/favorites`", error);
      }
    },

    addFavorite(merchant_id) {
      return axios.post(`v1/merchants/${merchant_id}/favorites`);
    },

    deleteFavorite(merchant_id) {
      return axios.delete(`v1/merchants/${merchant_id}/favorites`);
    },

    /**
     * Единая точка переключения избранного.
     *
     * Принимает объект мерчанта, а не id: сердце должно перекраситься сразу,
     * до ответа сервера, а список избранного — обновиться без повторного
     * запроса. Если запрос упал, состояние возвращается как было.
     */
    async toggleFavorite(merchant) {
      const id = merchant?.id;
      if (!id || this.pendingIds.includes(id)) return;

      // На странице избранного у элементов нет is_favorite — там факт
      // нахождения в списке и есть признак избранного.
      const wasFavorite =
        typeof merchant.is_favorite === "boolean"
          ? merchant.is_favorite
          : this.isFavorite(id);
      const previousFavorites = this.favorites;

      merchant.is_favorite = !wasFavorite;
      this.favorites = wasFavorite
        ? this.favorites.filter((item) => item.id !== id)
        : [...this.favorites, merchant];
      this.pendingIds = [...this.pendingIds, id];

      try {
        if (wasFavorite) {
          await this.deleteFavorite(id);
        } else {
          await this.addFavorite(id);
        }
      } catch (error) {
        console.error("Ошибка изменения избранного", error);
        merchant.is_favorite = wasFavorite;
        this.favorites = previousFavorites;
        // autoClose переопределяем — глобально стоит 200мс, не успеть прочитать
        toast.error(i18n.global.t("favorite_failed"), { autoClose: 4000 });
      } finally {
        this.pendingIds = this.pendingIds.filter((item) => item !== id);
      }
    },
  },
});
