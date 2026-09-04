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
    // Блокирующая модалка «Недостаточно данных»: данные от сервера не получены
    // (нет sso_token или SSO-авторизация не прошла). Стор не персистится,
    // поэтому флаг живёт только в рамках текущей загрузки страницы.
    isNoData: false,
  }),
  getters: {},
  actions: {},
});
