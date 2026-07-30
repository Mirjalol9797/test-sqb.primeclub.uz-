// DEV ONLY — подпись partner-assertion (RS256) в браузере тестовым ключом.
// Используется исключительно для локальной проверки потока авторизации.
// В проде приватного ключа нет (VITE_PARTNER_TEST_KEY не задан), поток идёт
// штатно: токен приходит из URL WebView (?token=), фронт его только принимает.
//
// ВНИМАНИЕ: приватный ключ в браузере — это ТОЛЬКО для теста на dev-контуре.
// Никогда не помещайте сюда боевой ключ и не собирайте с ключом прод-бандл.

const CLIENT_ID =
  import.meta.env.VITE_PARTNER_CLIENT_ID ||
  "30fca8de-4d58-447a-b1ee-a31ea358c058";

function base64UrlFromString(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlFromBytes(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

// PEM/base64 (PKCS#8) -> ArrayBuffer
function pkcs8ToArrayBuffer(raw) {
  const body = raw
    .replace(/-----[^-]+-----/g, "")
    .replace(/\s+/g, "");
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Подписываем JWT-assertion тестовым приватным ключом
export async function signPartnerAssertion() {
  const rawKey = import.meta.env.VITE_PARTNER_TEST_KEY;
  if (!rawKey) {
    throw new Error(
      "VITE_PARTNER_TEST_KEY не задан (.env.development.local). Assertion не подписать."
    );
  }

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pkcs8ToArrayBuffer(rawKey),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const now = Math.floor(Date.now() / 1000);
  const header = base64UrlFromString(
    JSON.stringify({ alg: "RS256", typ: "JWT" })
  );
  const payload = base64UrlFromString(
    JSON.stringify({ iss: CLIENT_ID, iat: now, exp: now + 300 })
  );
  const signingInput = `${header}.${payload}`;

  const signature = await crypto.subtle.sign(
    { name: "RSASSA-PKCS1-v1_5" },
    cryptoKey,
    new TextEncoder().encode(signingInput)
  );

  return `${signingInput}.${base64UrlFromBytes(signature)}`;
}
