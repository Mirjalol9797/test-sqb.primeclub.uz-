import { defineStore } from "pinia";
import axios from "@/plugins/api";
import { useSettingsStore } from "@/stores/settings";
export const useCertificatesStore = defineStore("CertificatesStore", {
  state: () => ({
    createdCertificates: [],
    listCertificates: [],
    pagination: {
      currentPage: 1,
      lastPage: 1,
      total: 0,
      perPage: 20,
      links: [],
    },
    blockReadyToDownload: false,
    errorCreateCertificate: null,
  }),
  getters: {},
  actions: {
    createCertificate(offer_id, merchant_branch_id) {
      const settingsStore = useSettingsStore();

      this.blockReadyToDownload = false;
      this.errorCreateCertificate = null;
      try {
        axios
          .post(`v1/my/certificates`, { offer_id, merchant_branch_id })
          .then((res) => {
            console.log("res", res);

            if (res.status === 201) {
              this.createdCertificates = res.data.data;
              this.blockReadyToDownload = true;
            } else {
              console.error("Ошибка api `v1/my/certificates`");
            }
          })
          .catch((error) => {
            console.error(error);
            this.errorCreateCertificate = error.response?.data;
            if (this.errorCreateCertificate) {
              settingsStore.isModalCreateCertificateError = true;
            }
          });
      } catch (error) {
        console.error("error", error);
      }
    },
    async downloadCertificate(offer_id) {
      try {
        const res = await axios.get(`v1/my/certificates/${offer_id}/pdf`, {
          responseType: "blob", // 👈 обязательно!
        });

        if (res.status === 200) {
          return res;
        } else {
          console.error(`Ошибка api v1/my/certificates/${offer_id}/pdf`);
        }
      } catch (error) {
        console.error(error);
      }
    },
    async getAllCertificates(status = null, perPage = 20, page = 1) {
      try {
        const query = status ? `status=${status}` : "";
        const res = await axios.get(
          `v1/my/certificates?${query}&per_page=${perPage}&page=${page}`
        );
        if (res.status === 200) {
          this.listCertificates = res.data.data;
          this.pagination = {
            currentPage: res.data.meta.current_page,
            lastPage: res.data.meta.last_page,
            total: res.data.meta.total,
            perPage: res.data.meta.per_page,
            links: res.data.meta.links,
          };
        } else {
          console.error("Ошибка api `v1/my/certificates`");
        }
      } catch (error) {
        console.error(error);
      }
    },
  },
  persist: {
    enabled: true,
    paths: [
      "createdCertificates",
      "listCertificates",
      "pagination",
      "blockReadyToDownload",
    ],
  },
});

// v1/my/certificates/322/pdfmy
