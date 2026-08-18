/**
 * Safe Area для WebView.
 *
 * Единственный источник верхнего отступа под статус-бар — CSS-переменная
 * `--safe-top` на :root (см. base.scss). В обычном браузере и в корректно
 * настроенном WebView её задаёт `env(safe-area-inset-top)`.
 *
 * Проблема iOS: если нативный WKWebView не прокидывает safe area insets,
 * `env(safe-area-inset-top)` приходит нулём — и контент уезжает под часы.
 * Поэтому здесь мы измеряем реальное значение и, только если оно нулевое
 * И WebView при этом растянут на весь экран (значит статус-бар точно поверх
 * нашего контента), подставляем запасное значение.
 *
 * Если натив уже сам сдвинул WebView вниз (высота окна заметно меньше высоты
 * экрана) — фолбэк НЕ применяется, иначе получили бы двойной отступ.
 */

// Высота статус-бара iOS: 44/47/59pt на устройствах с чёлкой и Dynamic Island,
// 20pt на старых моделях.
const IOS_NOTCH_INSET = 44;
const IOS_LEGACY_INSET = 20;

function isIos() {
  const ua = navigator.userAgent || "";
  const isIpadOs =
    /Macintosh/.test(ua) && typeof document !== "undefined" && "ontouchend" in document;
  return /iPad|iPhone|iPod/.test(ua) || isIpadOs;
}

// Измеряем, что реально отдаёт env(safe-area-inset-top): CSS-переменную
// нельзя прочитать напрямую, поэтому используем скрытый пробник.
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
  const viewportHeight = window.innerHeight || 0;
  // 10px — запас на округления и системные полоски.
  return viewportHeight >= screenHeight - 10;
}

function fallbackInset() {
  const longestSide = Math.max(window.screen?.width || 0, window.screen?.height || 0);
  // iPhone X и новее: >= 812pt по длинной стороне.
  return longestSide >= 812 ? IOS_NOTCH_INSET : IOS_LEGACY_INSET;
}

export function applySafeArea() {
  const root = document.documentElement;
  const envInset = measureEnvInset();

  if (envInset > 0) {
    // env() работает — ничего не подменяем, значение уже стоит в CSS.
    root.style.removeProperty("--safe-top");
    return;
  }

  if (isIos() && isFullScreenWebView()) {
    root.style.setProperty("--safe-top", `${fallbackInset()}px`);
    return;
  }

  // Android и WebView, который натив уже сдвинул ниже статус-бара.
  root.style.setProperty("--safe-top", "0px");
}

export function initSafeArea() {
  applySafeArea();
  window.addEventListener("orientationchange", () => {
    // После поворота размеры окна обновляются не мгновенно.
    setTimeout(applySafeArea, 250);
  });
  window.addEventListener("resize", applySafeArea);
}
