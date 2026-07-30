import { defineStore } from "pinia";
import axios from "@/plugins/api";

export const useBannersStore = defineStore("BannersStore", {
  state: () => ({
    banners: [],
  }),
  getters: {},
  actions: {
    getBanners() {
      try {
        axios.get(`v1/banners`).then((res) => {
          if (res.status === 200) {
            this.banners = res.data.data;
          } else {
            console.error("Ошибка api `v1/banners`");
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
  },
});
