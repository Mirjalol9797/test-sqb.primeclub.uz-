import { defineStore } from "pinia";
import axios from "@/plugins/api";
import router from "@/router"; // Добавляем импорт роутера

export const useStaticPagesStore = defineStore("StaticPagesStore", {
  state: () => ({
    page: null,
  }),
  actions: {
    async getPage(slug) {
      try {
        axios
          .get(`v1/static-pages/${slug}`)
          .then((res) => {
            console.log(res);
            if (res.status === 200) {
              this.page = res.data.data;
            } else {
              console.error("Ошибка api `v1/static-pages/${slug}`");
            }
          })
          .catch((error) => {
            console.error("error code1", error);

            if (error.response && error.response.status === 404) {
              // Перенаправляем на страницу 404 по пути
              router.push("/404");
            }
            return null;
          });
      } catch (error) {
        console.error("error code", error);
        return null;
      }
    },
  },
});
