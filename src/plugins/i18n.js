import { createI18n } from "vue-i18n";
import ru from "@/locales/ru.json";
import uz from "@/locales/uz.json";

export const SUPPORTED_LOCALES = ["ru", "uz"];
export const DEFAULT_LOCALE = "ru";
export const LOCALE_STORAGE_KEY = "primeclub_locale";

// Функция для получения языка из localStorage или URL
function getInitialLocale() {
  // Сначала проверяем URL
  const currentPath = window.location.pathname;
  const isUz = currentPath.startsWith("/uz");

  if (isUz) {
    return "uz";
  }

  // Если в URL нет языка, проверяем localStorage
  const savedLocale = localStorage.getItem(LOCALE_STORAGE_KEY);
  if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return savedLocale;
  }

  // По умолчанию возвращаем русский
  return DEFAULT_LOCALE;
}

// Функция для сохранения языка в localStorage
export function saveLocaleToStorage(locale) {
  if (SUPPORTED_LOCALES.includes(locale)) {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    console.log(`💾 Language saved to localStorage: ${locale}`);
  }
}

// Функция для получения текущего языка
export function getCurrentLocale() {
  return i18n.global.locale.value;
}

// Функция для установки языка с сохранением в localStorage
export function setLocale(locale) {
  if (SUPPORTED_LOCALES.includes(locale)) {
    console.log(`🔄 Setting language: ${locale}`);
    i18n.global.locale.value = locale;
    saveLocaleToStorage(locale);
    console.log(`✅ Language set successfully: ${locale}`);
  }
}

const initialLocale = getInitialLocale();

const i18n = createI18n({
  legacy: false,
  locale: initialLocale,
  fallbackLocale: "ru",
  messages: { ru, uz },
  globalInjection: true,
});

// Сохраняем начальный язык в localStorage
saveLocaleToStorage(initialLocale);

// Добавляем поддержку localePath
export function localePath(path, locale = null) {
  const currentLocale = locale || i18n.global.locale.value;
  if (currentLocale === "uz") {
    return `/uz${path}`;
  }
  return path;
}

export default i18n;
