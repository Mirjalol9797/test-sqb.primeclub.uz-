import { defineStore } from "pinia";
import axios from "@/plugins/api";

export const useMerchantsStore = defineStore("MerchantsStore", {
  state: () => ({
    merchantCategories: [],
    merchants: null,
    pagination: {
      current_page: 1,
      last_page: 1,
      per_page: 500,
      total: 0,
    },
    filters: {
      category_id: null,
      district_ids: null,
    },
    oneMerchant: null,
    oneMerchantOffer: null,
    bookingFlowData: null,
    summaryMerchants: null,
    newMerchants: [],
    popularMerchants: [],
  }),
  getters: {},
  actions: {
    setPerPage(n = 18) {
      const v = Number(n);
      this.pagination.per_page = Number.isFinite(v) && v > 0 ? v : 18;
    },

    async getMerchantCategories(offers_type = null) {
      try {
        const params = {};
        if (offers_type === "product") {
          params["filter[offers_type]"] = "product";
        }
        const res = await axios.get(`v1/merchant-categories`, { params });
        if (res.status === 200) {
          this.merchantCategories = res.data.data;
        } else {
          console.error("Ошибка api `v1/merchant-categories`");
        }
      } catch (error) {
        console.error(error);
      }
    },

    async getMerchants(
      category_id = null,
      district_ids = null,
      page = 1,
      offers_type = null,
      append = false // Новый параметр для добавления данных
    ) {
      console.log("category_id", category_id);
      console.log("district_ids", district_ids);
      console.log("page", page);
      console.log("offers_type", offers_type);
      console.log("append", append);

      try {
        // const isCategoryChanged =
        //   category_id !== null && category_id !== this.filters.category_id;
        // const isDistrictChanged =
        //   district_ids !== null && district_ids !== this.filters.district_ids;

        if (category_id !== null) this.filters.category_id = category_id;
        if (district_ids !== null) this.filters.district_ids = district_ids;

        // if (isCategoryChanged || isDistrictChanged) {
        //   page = 1;
        // }

        const params = {
          page,
          per_page: this.pagination.per_page,
        };

        if (this.filters.category_id) {
          params["filter[category_id]"] = this.filters.category_id;
        }
        if (this.filters.district_ids) {
          params["filter[district_id]"] = this.filters.district_ids;
        }
        if (offers_type === "product") {
          params["filter[offers_type]"] = "product";
        }

        const res = await axios.get(`v1/merchants`, { params });

        if (res.status === 200) {
          // Если append = true, добавляем к существующим данным
          if (append && Array.isArray(this.merchants)) {
            this.merchants = [...this.merchants, ...res.data.data];
          } else {
            this.merchants = res.data.data;
          }

          const meta = res?.data?.meta ?? {};
          this.pagination.current_page = meta.current_page ?? page ?? 1;
          this.pagination.last_page = meta.last_page ?? 1;
          this.pagination.per_page =
            meta.per_page ?? this.pagination.per_page ?? 18;
          this.pagination.total =
            meta.total ??
            (Array.isArray(this.merchants) ? this.merchants.length : 0);
        } else {
          console.error("Ошибка api `v1/merchants`");
        }
      } catch (error) {
        console.error(error);
      }
    },

    getOneMerchant(slug) {
      try {
        axios.get(`v1/merchants/${slug}`).then((res) => {
          if (res.status === 200) {
            this.oneMerchant = res.data.data;
          } else {
            console.error("Ошибка api `v1/merchants/${offer}`");
          }
        });
      } catch (error) {
        console.error(error);
      }
    },

    async getOneMerchatOffer(slug, type = null) {
      try {
        const params = {};
        if (type === "product") {
          params["filter[type]"] = "product";
        }
        const res = await axios.get(`v1/merchants/${slug}/offers`, { params });
        if (res.status === 200) {
          this.oneMerchantOffer = res.data.data;
        } else {
          console.error("Ошибка api `v1/merchants/{slug}/offers`");
        }
      } catch (error) {
        console.error(error);
      }
    },

    async getBookingFlow(slug) {
      try {
        const res = await axios.get(`v1/booking-flow/${slug}`);
        if (res.status === 200) {
          this.bookingFlowData = res?.data?.data ?? null;
        } else {
          this.bookingFlowData = null;
          console.error("Ошибка api `v1/booking-flow/{slug}`");
        }
      } catch (error) {
        this.bookingFlowData = null;
        console.error(error);
      }
    },

    getSummaryMerchants(category_id) {
      try {
        let url = "v1/merchants/summary";
        if (category_id) {
          url += `?filter[category_id]=${category_id}`;
        }
        axios.get(url).then((res) => {
          if (res.status === 200) {
            this.summaryMerchants = res.data.data;
          } else {
            console.error("Ошибка api `v1/merchants/summary`");
          }
        });
      } catch (error) {
        console.error(error);
      }
    },

    async getNewMerchants() {
      try {
        const res = await axios.get("v1/merchants/new");
        if (res.status === 200) {
          this.newMerchants = Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        } else {
          this.newMerchants = [];
          console.error("Ошибка api `v1/merchants/new`");
        }
      } catch (error) {
        this.newMerchants = [];
        console.error(error);
      }
    },

    async getPopularMerchants() {
      try {
        const res = await axios.get("v1/merchants/popular");
        if (res.status === 200) {
          this.popularMerchants = Array.isArray(res?.data?.data)
            ? res.data.data
            : [];
        } else {
          this.popularMerchants = [];
          console.error("Ошибка api `v1/merchants/popular`");
        }
      } catch (error) {
        this.popularMerchants = [];
        console.error(error);
      }
    },
  },
});
