/**
 * Utility to reliably download or view PDF files in WebViews and browsers
 */
export function downloadPdfFile(blobData, filename = "certificate.pdf") {
  return new Promise((resolve, reject) => {
    try {
      if (!blobData) {
        throw new Error("No PDF data provided");
      }

      const blob =
        blobData instanceof Blob
          ? blobData
          : new Blob([blobData], { type: "application/pdf" });

      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result;

        // 1. Try anchor tag download
        const link = document.createElement("a");
        link.href = dataUrl;
        link.download = filename;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();

        setTimeout(() => {
          if (document.body.contains(link)) {
            document.body.removeChild(link);
          }
        }, 500);

        // 2. WebViews (iOS WKWebView / Android WebView) fallback
        // If anchor download is intercepted/blocked, open dataUrl directly in window/location
        const isMobileWebView =
          /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) ||
          window.Telegram?.WebApp;

        if (isMobileWebView) {
          setTimeout(() => {
            try {
              const win = window.open(dataUrl, "_blank");
              if (!win) {
                window.location.href = dataUrl;
              }
            } catch (e) {
              window.location.href = dataUrl;
            }
          }, 300);
        }

        resolve(true);
      };

      reader.onerror = (err) => {
        console.error("FileReader error:", err);
        reject(err);
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error("Error in downloadPdfFile:", err);
      reject(err);
    }
  });
}
