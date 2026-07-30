import { defineStore } from "pinia";
import axios from "@/plugins/api";

export const useFavoritesStore = defineStore("favoritesStore", {
  state: () => ({
    favorites: [],
  }),
  getters: {},
  actions: {
    getFavorites() {
      try {
        axios.get(`v1/merchants/favorites`).then((res) => {
          if (res.status === 200) {
            this.favorites = res.data.data;
          } else {
            console.error("Ошибка api `v1/banners`");
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
    addFavorite(merchant_id) {
      axios.post(`v1/merchants/${merchant_id}/favorites`).then((res) => {
        if (res.status === 200) {
          console.log("addFavorite", res);
        }
      });
    },
    deleteFavorite(merchant_id) {
      axios.delete(`v1/merchants/${merchant_id}/favorites`).then((res) => {
        if (res.status === 200) {
          console.log("deleteFavorite", res);
        }
      });
    },
  },
});
