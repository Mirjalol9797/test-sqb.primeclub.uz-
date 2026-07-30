import { defineStore } from "pinia";
import axios from "@/plugins/api";

export const useOffersStore = defineStore("OffersStore", {
  state: () => ({
    offerCode: null,
  }),
  actions: {
    async getOfferCode(slug) {
      try {
        const response = await axios.get(`v1/offers/${slug}/code`);
        if (response.status === 200) {
          this.offerCode = response.data.code;
          return response.data.code;
        } else {
          return null;
        }
      } catch (error) {
        console.error("error code", error);
        return null;
      }
    },
  },
});
