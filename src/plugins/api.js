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
    // Партнёрская авторизация (v1/auth/partner) выполняется на сервере банка,
    // фронтенд получает готовый токен из URL WebView — assertion не подписываем.
    const requestUrl = String(config.url || "");
    const isPublicAuthRequest = requestUrl.startsWith("v1/auth/partner");
    const token = getActiveLoginToken() || getPersistedLoginToken();
    if (!isPublicAuthRequest && token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    // Получаем текущий язык из i18n при каждом запросе
    const currentLocale = i18n.global.locale.value;
    config.headers["Accept-Language"] = currentLocale;
    config.headers["Content-Type"] = "application/json";
    config.headers["X-Client-Type"] = "sqb";

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default $axios;
