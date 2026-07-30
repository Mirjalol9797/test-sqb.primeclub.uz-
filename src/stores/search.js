import { defineStore } from "pinia";
import axios from "@/plugins/api";

export const useSearchStore = defineStore("SearchStore", {
  state: () => ({
    searchData: [],
  }),
  getters: {},
  actions: {
    getSearchData(search) {
      try {
        axios.get(`v1/suggest?q=${search}`).then((res) => {
          if (res.status === 200) {
            this.searchData = res.data.data;
          } else {
            console.error("Ошибка api `v1/suggest`");
          }
        });
      } catch (error) {
        console.error(error);
      }
    },
  },
});
