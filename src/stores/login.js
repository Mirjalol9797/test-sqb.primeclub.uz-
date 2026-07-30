import { defineStore } from "pinia";
import axios from "@/plugins/api";

export const useLoginStore = defineStore("login", {
  state: () => ({
    token: null,
    user: null,
    isAuthorizing: false,
    authError: null,
    balance: 10000000, // мок-баланс (используется в ModalAboniment)
  }),
  getters: {
    // Геттер для получения пользователя
    getUser() {
      return this.user;
    },
    // Геттер для проверки авторизации
    isAuthenticated() {
      return !!this.token;
    },
    // Геттер для форматированного баланса
    formattedBalance() {
      return this.balance.toLocaleString("ru-RU");
    },
  },
  actions: {
    // Функция для списания средств
    deductBalance(amount) {
      if (this.balance >= amount) {
        this.balance -= amount;
        return true;
      }
      return false;
    },

    // Функция для проверки достаточности средств
    hasEnoughBalance(amount) {
      return this.balance >= amount;
    },

    // Сохраняем токен, полученный из WebView (?token=...), и подтягиваем профиль
    async authorizeWithToken(token) {
      if (!token) {
        this.authError = "no_token";
        return false;
      }

      this.isAuthorizing = true;
      this.authError = null;
      this.token = token; // persist-плагин сам сохранит в localStorage

      try {
        await this.getUserProfile();
        return true;
      } catch (error) {
        console.error("Ошибка авторизации по токену:", error);
        this.token = null;
        this.user = null;
        this.authError = "auth_failed";
        return false;
      } finally {
        this.isAuthorizing = false;
      }
    },

    async getUserProfile() {
      const res = await axios.get(`v1/my/profile`);
      if (res.status === 200) {
        this.user = res.data.data;
        return this.user;
      }
      throw new Error("Не удалось получить профиль пользователя");
    },

    // DEV ONLY — эмулируем сервер банка: подписываем assertion тестовым ключом,
    // получаем токен через v1/auth/partner. В проде не вызывается.
    async partnerLoginDev() {
      this.isAuthorizing = true;
      this.authError = null;
      try {
        const { signPartnerAssertion } = await import(
          "@/utils/partnerAuthDev"
        );
        const assertion = await signPartnerAssertion();

        const res = await axios.post("v1/auth/partner", {
          assertion,
          phone: import.meta.env.VITE_PARTNER_TEST_PHONE || "998901234567",
          first_name: import.meta.env.VITE_PARTNER_TEST_FIRST_NAME || "John",
          last_name: import.meta.env.VITE_PARTNER_TEST_LAST_NAME || "Doe",
        });

        // token приходит на верхнем уровне ответа (см. документацию partner)
        const token = res?.data?.token || res?.data?.data?.token;
        if (!token) {
          throw new Error("Токен не получен от v1/auth/partner");
        }
        this.token = token;

        // Профиль подтягиваем штатным эндпоинтом; если не вышло — берём из ответа
        try {
          await this.getUserProfile();
        } catch (profileError) {
          console.warn("Профиль через v1/my/profile недоступен:", profileError);
          this.user = res?.data?.user || null;
        }
        return true;
      } catch (error) {
        console.error("Ошибка partnerLoginDev:", error);
        this.token = null;
        this.user = null;
        this.authError = "auth_failed";
        return false;
      } finally {
        this.isAuthorizing = false;
      }
    },

    checkAuthToken(router) {
      try {
        axios
          .get(`v1/auth/check`)
          .then((res) => {
            if (res.status !== 200) {
              this.handleLogout(router);
            }
          })
          .catch((error) => {
            console.error("Authentication error:", error);
            this.handleLogout(router);
          });
      } catch (error) {
        console.error("Unexpected error during authentication check:", error);
        this.handleLogout(router);
      }
    },

    handleLogout(router) {
      this.logout();
      const prefix = router?.currentRoute?.value?.path?.startsWith("/uz")
        ? "/uz"
        : "";
      router.push(`${prefix}/webview`);
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isAuthorizing = false;
      this.authError = null;
      // Полностью очищаем localStorage
      localStorage.clear();
    },
  },
  persist: {
    enabled: true,
  },
});
