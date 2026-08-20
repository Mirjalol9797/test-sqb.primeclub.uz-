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

// Высота полосы, которую занимают круглые кнопки «назад» и «закрыть»
// хост-приложения. Они плавают поверх WebView, поэтому контент под ними
// не читается и не нажимается — полосу держим свободной. На Android таких
// кнопок нет, там значение остаётся нулевым.
const IOS_HOST_CONTROLS_HEIGHT = 48;

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
  root.style.setProperty(
    "--host-controls-top",
    isIos() ? `${IOS_HOST_CONTROLS_HEIGHT}px` : "0px"
  );
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

/**
 * Диагностика отступов. Включается флагом `?safeDebug=1` в адресе — в обычном
 * запуске ничего не рисует и ни на что не влияет.
 *
 * Нужна, чтобы отличить два случая, которые выглядят одинаково: (1) хост
 * отдаёт большой env(safe-area-inset-top) — статус-бар плюс полоса под свои
 * плавающие кнопки, и мы честно его отступаем; (2) env() нулевой, а WebView
 * уже сдвинут хостом вниз, и вся полоса — не наша. Отличает их `screenY`:
 * это смещение вьюпорта от верха экрана.
 */
function renderSafeAreaDebug() {
  const id = "safe-area-debug";
  let box = document.getElementById(id);
  if (!box) {
    box = document.createElement("div");
    box.id = id;
    box.style.cssText =
      "position:fixed;left:4px;right:4px;top:0;z-index:2147483647;" +
      "background:#0f0;color:#000;font:11px/1.35 monospace;padding:6px;" +
      "border-radius:6px;white-space:pre-wrap;word-break:break-all;";
    document.body.appendChild(box);
  }

  const vv = window.visualViewport;
  const rows = [
    ["env top / bottom", `${measureEnvInset()} / ${measureEnvBottomInset()}`],
    ["--safe-top", getComputedStyle(document.documentElement).getPropertyValue("--safe-top").trim()],
    ["source", document.documentElement.dataset.safeTopSource || "-"],
    ["screenY / screenX", `${window.screenY} / ${window.screenX}`],
    ["screen", `${window.screen?.width}x${window.screen?.height}`],
    ["inner", `${window.innerWidth}x${window.innerHeight}`],
    ["outer", `${window.outerWidth}x${window.outerHeight}`],
    ["visualViewport", vv ? `${Math.round(vv.width)}x${Math.round(vv.height)} @${Math.round(vv.offsetTop)}` : "-"],
    ["dpr", String(window.devicePixelRatio)],
    ["body top", String(Math.round(document.body.getBoundingClientRect().top))],
    ["body padTop", getComputedStyle(document.body).paddingTop],
    ["fullscreen?", String(isFullScreenWebView())],
    ["ios?", String(isIos())],
    ["ua", navigator.userAgent],
  ];

  box.textContent = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
}

function measureEnvBottomInset() {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;top:0;left:0;width:0;visibility:hidden;pointer-events:none;height:env(safe-area-inset-bottom,0px);";
  document.documentElement.appendChild(probe);
  const value = probe.getBoundingClientRect().height || 0;
  probe.remove();
  return value;
}

function isSafeAreaDebugEnabled() {
  try {
    return new URLSearchParams(window.location.search).has("safeDebug");
  } catch (e) {
    return false;
  }
}

export function initSafeArea() {
  applySafeArea();

  if (isSafeAreaDebugEnabled()) {
    const draw = () => renderSafeAreaDebug();
    if (document.body) draw();
    window.addEventListener("DOMContentLoaded", draw);
    window.addEventListener("load", draw);
    window.addEventListener("resize", draw);
    RECHECK_DELAYS_MS.forEach((delay) => setTimeout(draw, delay + 50));
  }

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
