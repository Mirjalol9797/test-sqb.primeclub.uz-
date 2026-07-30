import { defineStore } from "pinia";
import axios from "@/plugins/api";

export const useLoginStore = defineStore("login", {
  state: () => ({
    token: null,
    user: null,
    isDemo: false, // гостевой (демо) вход: профиль скрыт, сертификат заблокирован
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

    // Шаг 1 SSO: проверка payload перед показом экрана оферты (stateless).
    // POST v1/auth/partner/webview/verify { sso_token, phone, name, lang }
    async verifySso({ sso_token, phone, name, lang }) {
      try {
        const res = await axios.post("v1/auth/partner/webview/verify", {
          sso_token,
          phone,
          name,
          lang,
        });
        return {
          ok: res?.data?.status === true,
          data: res?.data?.data || null,
        };
      } catch (error) {
        const body = error?.response?.data;
        return {
          ok: false,
          error: body?.error || "VERIFY_FAILED",
          message: body?.message || null,
        };
      }
    },

    // Шаг 2 SSO: принятие оферты и завершение авторизации.
    // POST v1/auth/partner/webview/consent → { token (Bearer), user }
    async consentSso({ sso_token, phone, name, lang }) {
      this.isAuthorizing = true;
      this.authError = null;
      try {
        const res = await axios.post("v1/auth/partner/webview/consent", {
          sso_token,
          phone,
          name,
          lang,
        });

        const token = res?.data?.token;
        if (res?.data?.status === true && token) {
          this.token = token; // persist-плагин сохранит в localStorage
          this.isDemo = false; // полноценная авторизация по SSO
          // Профиль тянем штатным эндпоинтом; фолбэк — из ответа consent
          try {
            await this.getUserProfile();
          } catch (profileError) {
            console.warn("Профиль через v1/my/profile недоступен:", profileError);
            this.user = res?.data?.user || null;
          }
          return { ok: true };
        }

        this.authError = res?.data?.error || "CONSENT_FAILED";
        return { ok: false, error: this.authError };
      } catch (error) {
        const body = error?.response?.data;
        this.authError = body?.error || "CONSENT_FAILED";
        return {
          ok: false,
          error: this.authError,
          message: body?.message || null,
        };
      } finally {
        this.isAuthorizing = false;
      }
    },

    // Гостевой вход (нет sso_token): демо-авторизация со статическими кредами.
    // POST v1/auth/demo-login → { data: { token, user, ... } }
    async demoLogin() {
      this.isAuthorizing = true;
      this.authError = null;
      try {
        const res = await axios.post("v1/auth/demo-login", {
          email: "demo@atlasmedia.uz",
          password: "demo-account123",
        });

        const token = res?.data?.data?.token || res?.data?.token;
        if (token) {
          this.token = token;
          this.isDemo = true; // ограниченный гостевой доступ
          const demoUser = res?.data?.data?.user || res?.data?.user || null;
          if (demoUser) this.user = demoUser;
          // Уточняем профиль штатным эндпоинтом (необязательно)
          try {
            await this.getUserProfile();
          } catch (profileError) {
            console.warn("Профиль демо недоступен:", profileError);
          }
          return { ok: true };
        }
        return { ok: false };
      } catch (error) {
        console.error("Ошибка demoLogin:", error);
        return { ok: false };
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

    // Сессия истекла/невалидна: чистим и уходим в гостевую витрину.
    // Повторный автологин инициирует приложение банка новым sso_token.
    handleLogout(router) {
      this.logout();
      const prefix = router?.currentRoute?.value?.path?.startsWith("/uz")
        ? "/uz"
        : "";
      router.push(`${prefix}/offer`);
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isDemo = false;
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
