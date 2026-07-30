import axios from "axios";
import i18n from "@/plugins/i18n";
import { useLoginStore } from "@/stores/login";

function getActiveLoginToken() {
  try {
    const loginStore = useLoginStore();
    return loginStore?.token || null;
  } catch (error) {
    return null;
  }
}

function getPersistedLoginToken() {
  try {
    const raw = localStorage.getItem("login");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.token || null;
  } catch (error) {
    return null;
  }
}

const $axios = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL,
});

$axios.interceptors.request.use(
  (config) => {
    config.headers = config.headers || {};
    // Токен добавляем, если он есть. Эндпоинты SSO (verify/consent) вызываются
    // до появления токена, поэтому Authorization туда просто не попадёт.
    const token = getActiveLoginToken() || getPersistedLoginToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Получаем текущий язык из i18n при каждом запросе
    const currentLocale = i18n.global.locale.value;
    config.headers["Accept-Language"] = currentLocale;
    config.headers["Content-Type"] = "application/json";
    config.headers["X-Client-Type"] = "sqb";
    // Обязательный заголовок доступа: витрина работает только внутри
    // приложения партнёра. Без него бэкенд отвечает 403.
    config.headers["X-Source"] = "app";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default $axios;
