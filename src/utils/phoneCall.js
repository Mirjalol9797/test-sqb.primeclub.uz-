/**
 * Звонок из WebView.
 *
 * Ограничение, которое фронт снять не может: откроется ли набор номера,
 * решает host-приложение. iOS WKWebView и Android WebView по умолчанию
 * не обрабатывают схему `tel:` — натив должен пропустить её через
 * `decidePolicyFor` → `UIApplication.open` (iOS) или `shouldOverrideUrlLoading`
 * → `ACTION_DIAL` (Android). Без этого ни один JS-приём не поможет.
 *
 * Что делает этот модуль: перебирает доступные из JS способы открыть номер
 * и честно сообщает, сработало ли. Если не сработало — вызывающий код
 * показывает номер с копированием, чтобы кнопка никогда не оказалась
 * «мёртвой».
 *
 * ВАЖНО, про разницу платформ:
 *   Android WebView на необработанной схеме `tel:` не просто ничего не делает,
 *   а уводит страницу на net::ERR_UNKNOWN_URL_SCHEME — SPA умирает вместе со
 *   всем состоянием. Поэтому на Android переход верхнего уровня запрещён,
 *   пробуем только скрытый iframe: если схема не поддержана, ошибка остаётся
 *   внутри фрейма и приложение живёт.
 *   iOS WKWebView необработанную схему просто отменяет, страница не страдает,
 *   поэтому там переход верхнего уровня допустим.
 */

// Контракт для нативной команды. Если натив зарегистрирует такой обработчик,
// звонок пойдёт напрямую, без всяких эвристик.
const IOS_HANDLER_NAME = "sqbNative"; // window.webkit.messageHandlers.sqbNative
const ANDROID_BRIDGE_NAMES = ["SqbApp", "AndroidBridge", "NativeBridge"];

// Сколько ждём ухода приложения в фон, прежде чем считать попытку неудачной.
const DETECT_TIMEOUT_MS = 1000;
// Пауза между попытками внутри каскада.
const STEP_DELAY_MS = 400;

export function normalizePhone(raw) {
  const value = String(raw || "").trim();
  if (!value) return "";
  const digits = value.replace(/[^\d]/g, "");
  if (!digits) return "";
  return `${value.startsWith("+") ? "+" : ""}${digits}`;
}

export function telHref(raw) {
  const phone = normalizePhone(raw);
  return phone ? `tel:${phone}` : "";
}

function isIos() {
  const ua = navigator.userAgent || "";
  const isIpadOs =
    /Macintosh/.test(ua) &&
    typeof document !== "undefined" &&
    "ontouchend" in document;
  return /iPad|iPhone|iPod/.test(ua) || isIpadOs;
}

function callViaNativeBridge(phone) {
  try {
    const iosHandler = window.webkit?.messageHandlers?.[IOS_HANDLER_NAME];
    if (iosHandler?.postMessage) {
      iosHandler.postMessage({ action: "call", phone });
      return true;
    }
  } catch (e) {
    /* мост недоступен — идём дальше по каскаду */
  }

  for (const name of ANDROID_BRIDGE_NAMES) {
    try {
      const bridge = window[name];
      const method = bridge?.call || bridge?.makeCall || bridge?.dial;
      if (typeof method === "function") {
        method.call(bridge, phone);
        return true;
      }
    } catch (e) {
      /* пробуем следующий мост */
    }
  }

  return false;
}

// Некоторые WebView игнорируют присваивание location, но выполняют переход
// внутри скрытого iframe.
function callViaIframe(href) {
  try {
    const frame = document.createElement("iframe");
    frame.style.cssText =
      "position:absolute;width:0;height:0;border:0;visibility:hidden;";
    frame.src = href;
    document.body.appendChild(frame);
    setTimeout(() => frame.remove(), 1000);
    return true;
  } catch (e) {
    return false;
  }
}

export const CALL_OPENED = "opened";
export const CALL_FAILED = "failed";
export const CALL_BUSY = "busy";

// Одна попытка звонка за раз. Без этого десять быстрых тапов запускали
// десять параллельных попыток и десять уведомлений.
let pendingCall = null;

/**
 * Пытается позвонить. Возвращает Promise с одним из состояний:
 *   CALL_OPENED — приложение ушло в фон, набор номера открылся;
 *   CALL_FAILED — ничего не произошло, показывайте запасной вариант;
 *   CALL_BUSY   — попытка уже идёт, ничего показывать не надо.
 */
export function callPhone(raw) {
  const phone = normalizePhone(raw);
  if (!phone) return Promise.resolve(CALL_FAILED);
  if (pendingCall) return Promise.resolve(CALL_BUSY);

  const href = `tel:${phone}`;

  // Мост в натив — единственный надёжный путь, эвристика не нужна.
  if (callViaNativeBridge(phone)) return Promise.resolve(CALL_OPENED);

  pendingCall = new Promise((resolve) => {
    let settled = false;
    const timers = [];

    function finish(result) {
      if (settled) return;
      settled = true;
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onLeave);
      pendingCall = null;
      resolve(result);
    }

    // Уход страницы в фон = набор номера открылся поверх WebView.
    function onHidden() {
      if (document.hidden) finish(CALL_OPENED);
    }
    function onLeave() {
      finish(CALL_OPENED);
    }

    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onLeave);

    // Безопасный для обеих платформ способ: ошибка схемы остаётся в iframe.
    callViaIframe(href);

    // Переход верхнего уровня — только на iOS, и только если iframe
    // не сработал. На Android это сломало бы приложение (см. шапку файла).
    if (isIos()) {
      timers.push(
        setTimeout(() => {
          if (settled) return;
          try {
            window.location.href = href;
          } catch (e) {
            /* отдадим false по таймауту */
          }
        }, STEP_DELAY_MS)
      );
    }

    timers.push(setTimeout(() => finish(CALL_FAILED), DETECT_TIMEOUT_MS));
  });

  return pendingCall;
}

export async function copyPhone(raw) {
  const phone = normalizePhone(raw);
  if (!phone) return false;
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(phone);
      return true;
    }
  } catch (e) {
    /* фолбэк ниже */
  }
  // execCommand — для старых WebView без Clipboard API.
  try {
    const input = document.createElement("textarea");
    input.value = phone;
    input.setAttribute("readonly", "");
    input.style.cssText = "position:absolute;left:-9999px;opacity:0;";
    document.body.appendChild(input);
    input.select();
    const ok = document.execCommand("copy");
    input.remove();
    return ok;
  } catch (e) {
    return false;
  }
}
