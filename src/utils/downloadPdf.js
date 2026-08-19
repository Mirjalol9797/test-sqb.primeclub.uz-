import { saveFileViaNative } from "./nativeBridge";

/**
 * Сохранение PDF из WebView.
 *
 * Ограничение, которое фронт снять не может: скачивание файла выполняет
 * host-приложение. `<a download>` в WKWebView не работает вовсе, а в Android
 * WebView срабатывает только если натив повесил DownloadListener. Поэтому
 * порядок такой:
 *
 *   1. Мост в натив — отдаём файл в base64, натив сохраняет и показывает
 *      системный «Поделиться». Единственный надёжный путь.
 *   2. Веб-фолбэки — работают в обычном браузере и в части WebView.
 *
 * Забирать файл по ссылке натив не может: эндпоинт
 * `GET v1/my/certificates/{id}/pdf` требует Authorization и сервисных
 * заголовков, которые есть только у нашего axios-клиента.
 */

const PDF_MIME_TYPE = "application/pdf";

function toBlob(blobData) {
  return blobData instanceof Blob
    ? blobData
    : new Blob([blobData], { type: PDF_MIME_TYPE });
}

// FileReader отдаёт "data:application/pdf;base64,JVBERi0..." —
// мосту нужна только часть после запятой.
function readAsDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

function isIos() {
  const ua = navigator.userAgent || "";
  const isIpadOs = /Macintosh/.test(ua) && "ontouchend" in document;
  return /iPad|iPhone|iPod/.test(ua) || isIpadOs;
}

export async function downloadPdfFile(blobData, filename = "certificate.pdf") {
  if (!blobData) throw new Error("No PDF data provided");

  const blob = toBlob(blobData);
  const dataUrl = await readAsDataUrl(blob);
  const base64 = String(dataUrl).split(",")[1] || "";

  // 1. Мост в натив.
  if (base64 && saveFileViaNative({ filename, mimeType: PDF_MIME_TYPE, base64 })) {
    return true;
  }

  // 2. Обычная ссылка на скачивание — работает в браузере и в Android WebView
  //    с настроенным DownloadListener.
  const link = document.createElement("a");
  link.href = dataUrl;
  link.download = filename;
  link.target = "_blank";
  document.body.appendChild(link);
  link.click();
  setTimeout(() => link.remove(), 500);

  // 3. Последняя попытка: открыть файл во встроенном просмотрщике.
  //    Переход верхнего уровня допускаем только на iOS — в Android WebView
  //    неподдержанный data:-переход уводит на страницу ошибки и убивает SPA
  //    (та же ловушка, что и со схемой tel:).
  setTimeout(() => {
    try {
      const opened = window.open(dataUrl, "_blank");
      if (!opened && isIos()) {
        window.location.href = dataUrl;
      }
    } catch (e) {
      if (isIos()) window.location.href = dataUrl;
    }
  }, 300);

  return true;
}
