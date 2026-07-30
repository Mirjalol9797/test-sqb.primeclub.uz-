import { defineStore } from "pinia";
import { copied } from "@/utils/tools.js";

export const useSettingsStore = defineStore("settings", {
  state: () => ({
    isCreateCertificate: false,
    isFilterCategories: false,
    isDetailImages: false,
    isMerchantBranches: false,
    isDownloadAppModal: false,
    isModalCreateCertificateError: false,
    isModalCodeError: false,
    isAboniment: false,
    isModalChangeLanguage: false,
    isModalSupportService: false,
  }),
  getters: {},
  actions: {},
});
