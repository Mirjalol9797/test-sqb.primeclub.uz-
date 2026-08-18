/**
 * Safe Area для WebView.
 *
 * Единственный источник верхнего отступа под статус-бар — CSS-переменная
 * `--safe-top` на :root (см. base.scss). В браузере и в корректно настроенном
 * WebView её задаёт `env(safe-area-inset-top)`.
 *
 * Проблема iOS: если нативный WKWebView прибит к границам `view`, а не к
 * `view.safeAreaLayoutGuide`, то `env(safe-area-inset-top)` приходит нулём —
 * и контент уезжает под часы. На Android такой проблемы нет, поэтому логика
 * ниже срабатывает только на iOS.
 *
 * Порядок такой:
 *   1. Измеряем, что реально отдаёт env().
 *   2. Если больше нуля — ничего не трогаем, значение уже верное.
 *   3. Если ноль, но WebView растянут на весь экран (значит статус-бар точно
 *      поверх нашего контента) — подставляем отступ по метрикам устройства.
 *   4. Если ноль и WebView уже сдвинут нативом вниз — оставляем ноль,
 *      иначе получили бы двойной отступ.
 *
 * Значение перепроверяется несколько раз после загрузки: WKWebView иногда
 * сообщает инсеты не сразу, и первый замер может быть нулевым.
 */

// Верхний инсет по размерам экрана в CSS-пикселях (портрет).
// Ключ — «ширина x высота».
const IOS_TOP_INSETS = {
  // Dynamic Island
  "402x874": 62, // 16 Pro
  "440x956": 62, // 16 Pro Max
  "393x852": 59, // 14 Pro, 15, 15 Pro, 16
  "430x932": 59, // 14 Pro Max, 15 Plus, 15 Pro Max, 16 Plus
  // Чёлка
  "390x844": 47, // 12, 13, 14
  "428x926": 47, // 12 Pro Max, 13 Pro Max, 14 Plus
  "360x780": 50, // 12 mini, 13 mini
  "375x812": 44, // X, XS, 11 Pro
  "414x896": 44, // XR, 11, XS Max, 11 Pro Max
  // Кнопка Home
  "414x736": 20, // Plus-модели
  "375x667": 20, // 6/7/8, SE 2/3
  "320x568": 20, // SE 1
};

// Для неизвестных моделей: у современных безрамочных инсет крупный,
// лучше отступить чуть больше, чем оставить контент под часами.
const MODERN_DEFAULT_INSET = 59;
const LEGACY_DEFAULT_INSET = 20;
const NOTCH_MIN_SIDE = 812;

// WKWebView иногда отдаёт инсеты не с первого кадра.
const RECHECK_DELAYS_MS = [100, 500, 1200];

function isIos() {
  const ua = navigator.userAgent || "";
  const isIpadOs =
    /Macintosh/.test(ua) &&
    typeof document !== "undefined" &&
    "ontouchend" in document;
  return /iPad|iPhone|iPod/.test(ua) || isIpadOs;
}

// CSS-переменную не прочитать напрямую, поэтому измеряем скрытым пробником.
function measureEnvInset() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none;height:env(safe-area-inset-top,0px);";
  document.documentElement.appendChild(probe);
  const value = probe.getBoundingClientRect().height || 0;
  probe.remove();
  return value;
}

// WebView занимает весь экран → статус-бар рисуется поверх нашего контента.
function isFullScreenWebView() {
  const screenHeight = window.screen?.height || 0;
  if (!screenHeight) return false;
  // 10px — запас на округления и системные полоски.
  return (window.innerHeight || 0) >= screenHeight - 10;
}

function fallbackInset() {
  // В альбомной ориентации верхнего инсета на iPhone нет.
  if ((window.innerWidth || 0) > (window.innerHeight || 0)) return 0;

  const width = Math.min(window.screen?.width || 0, window.screen?.height || 0);
  const height = Math.max(window.screen?.width || 0, window.screen?.height || 0);

  const known = IOS_TOP_INSETS[`${width}x${height}`];
  if (known !== undefined) return known;

  return height >= NOTCH_MIN_SIDE ? MODERN_DEFAULT_INSET : LEGACY_DEFAULT_INSET;
}

export function applySafeArea() {
  const root = document.documentElement;
  const envInset = measureEnvInset();

  if (envInset > 0) {
    // env() работает — снимаем нашу подмену, если она была поставлена раньше.
    root.style.removeProperty("--safe-top");
    root.dataset.safeTopSource = "env";
    return;
  }

  if (isIos() && isFullScreenWebView()) {
    root.style.setProperty("--safe-top", `${fallbackInset()}px`);
    root.dataset.safeTopSource = "fallback";
    return;
  }

  // Android и WebView, который натив уже сдвинул ниже статус-бара.
  root.style.setProperty("--safe-top", "0px");
  root.dataset.safeTopSource = "none";
}

export function initSafeArea() {
  applySafeArea();

  // Инсеты могут появиться позже первого кадра.
  RECHECK_DELAYS_MS.forEach((delay) => setTimeout(applySafeArea, delay));
  window.addEventListener("load", applySafeArea);

  window.addEventListener("resize", applySafeArea);
  window.visualViewport?.addEventListener("resize", applySafeArea);
  window.addEventListener("orientationchange", () => {
    // После поворота размеры окна обновляются не мгновенно.
    setTimeout(applySafeArea, 250);
  });
}
