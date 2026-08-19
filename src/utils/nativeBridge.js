/**
 * Мост в нативное приложение SQB.
 *
 * Единственное место, где описан контракт с нативной командой. Мост
 * необязателен: если его нет, вызывающий код уходит на веб-фолбэки. Но с ним
 * и звонок, и сохранение PDF работают надёжно, без эвристик.
 *
 * iOS      — WKScriptMessageHandler с именем `sqbNative`, принимает объект
 *            вида { action, ...payload }.
 * Android  — @JavascriptInterface-объект с именем `SqbApp`, у него методы
 *            под каждое действие.
 */

const IOS_HANDLER_NAME = "sqbNative";
// Первое имя — основное, остальные оставлены на случай, если натив уже
// зарегистрировал мост под другим названием.
const ANDROID_BRIDGE_NAMES = ["SqbApp", "AndroidBridge", "NativeBridge"];

function getIosHandler() {
  try {
    const handler = window.webkit?.messageHandlers?.[IOS_HANDLER_NAME];
    return handler?.postMessage ? handler : null;
  } catch (e) {
    return null;
  }
}

function getAndroidBridge() {
  for (const name of ANDROID_BRIDGE_NAMES) {
    try {
      if (window[name]) return window[name];
    } catch (e) {
      /* пробуем следующее имя */
    }
  }
  return null;
}

export function hasNativeBridge() {
  return Boolean(getIosHandler() || getAndroidBridge());
}

/**
 * Звонок. Возвращает true, если мост принял вызов.
 */
export function callViaNative(phone) {
  const iosHandler = getIosHandler();
  if (iosHandler) {
    try {
      iosHandler.postMessage({ action: "call", phone });
      return true;
    } catch (e) {
      /* уходим на веб-фолбэк */
    }
  }

  const bridge = getAndroidBridge();
  const method = bridge?.call || bridge?.makeCall || bridge?.dial;
  if (typeof method === "function") {
    try {
      method.call(bridge, phone);
      return true;
    } catch (e) {
      /* уходим на веб-фолбэк */
    }
  }

  return false;
}

/**
 * Сохранение файла. Содержимое передаём в base64 — забирать файл по ссылке
 * натив не может: эндпоинт требует Authorization и сервисные заголовки,
 * которые есть только у нашего axios-клиента.
 *
 * Возвращает true, если мост принял файл.
 */
export function saveFileViaNative({ filename, mimeType, base64 }) {
  const iosHandler = getIosHandler();
  if (iosHandler) {
    try {
      iosHandler.postMessage({
        action: "saveFile",
        filename,
        mimeType,
        base64,
      });
      return true;
    } catch (e) {
      /* уходим на веб-фолбэк */
    }
  }

  const bridge = getAndroidBridge();
  if (typeof bridge?.saveFile === "function") {
    try {
      bridge.saveFile(filename, mimeType, base64);
      return true;
    } catch (e) {
      /* уходим на веб-фолбэк */
    }
  }

  return false;
}
