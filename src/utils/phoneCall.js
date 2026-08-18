/**
 * Звонок из WebView.
 *
 * Ограничение, которое фронт снять не может: откроется ли набор номера,
 * решает host-приложение. iOS WKWebView и Android WebView по умолчанию
 * не обрабатывают схему `tel:` — натив должен пропустить её через
 * `decidePolicyFor` → `UIApplication.open` (iOS) или `shouldOverrideUrlLoading`
 * → `ACTION_DIAL` (Android). Без этого ни один JS-приём не поможет.
 *
 * Что делает этот модуль: перебирает все способы открыть номер, какие вообще
 * доступны из JS, и честно сообщает, сработало ли. Если не сработало —
 * вызывающий код показывает номер с копированием, чтобы кнопка никогда
 * не оказалась «мёртвой».
 */

// Контракт для нативной команды. Если натив зарегистрирует такой обработчик,
// звонок пойдёт напрямую, без всяких эвристик.
const IOS_HANDLER_NAME = "sqbNative"; // window.webkit.messageHandlers.sqbNative
const ANDROID_BRIDGE_NAMES = ["SqbApp", "AndroidBridge", "NativeBridge"];

// Сколько ждём ухода приложения в фон, прежде чем считать попытку неудачной.
const DETECT_TIMEOUT_MS = 1500;
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

/**
 * Пытается позвонить. Возвращает Promise<boolean>:
 * true  — приложение ушло в фон, значит набор номера открылся;
 * false — ничего не произошло, показывайте запасной вариант.
 */
export function callPhone(raw) {
  const phone = normalizePhone(raw);
  if (!phone) return Promise.resolve(false);
  const href = `tel:${phone}`;

  // Мост в натив — единственный надёжный путь, эвристика не нужна.
  if (callViaNativeBridge(phone)) return Promise.resolve(true);

  return new Promise((resolve) => {
    let settled = false;
    const timers = [];

    function finish(result) {
      if (settled) return;
      settled = true;
      timers.forEach(clearTimeout);
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("pagehide", onLeave);
      resolve(result);
    }

    // Уход страницы в фон = набор номера открылся поверх WebView.
    function onHidden() {
      if (document.hidden) finish(true);
    }
    function onLeave() {
      finish(true);
    }

    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("pagehide", onLeave);

    // Каскад: каждый следующий способ пробуем, только если предыдущий
    // не увёл приложение в фон.
    try {
      window.location.href = href;
    } catch (e) {
      /* следующий шаг каскада */
    }

    timers.push(
      setTimeout(() => {
        if (settled) return;
        callViaIframe(href);
      }, STEP_DELAY_MS)
    );

    timers.push(
      setTimeout(() => {
        if (settled) return;
        try {
          window.open(href, "_self");
        } catch (e) {
          /* последний шаг — просто отдадим false */
        }
      }, STEP_DELAY_MS * 2)
    );

    timers.push(setTimeout(() => finish(false), DETECT_TIMEOUT_MS));
  });
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
