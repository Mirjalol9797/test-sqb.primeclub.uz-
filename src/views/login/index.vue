<script setup>
import { onMounted } from "vue";

// Форвардер входа (Вариант 1):
//   /login?redirect=/app/partner/{id}?sso_token=...&phone=...&name=...&lang=...
// Внутренние разделители query приходят как %26; их восстанавливаем в &.
// Остальное кодирование (%2B, %20) НЕ трогаем, чтобы phone/name дошли до
// /app/partner без искажений и совпали с данными внутри JWT payload.
onMounted(() => {
  const rawSearch = window.location.search.replace(/^\?/, "");
  const match = rawSearch.match(/(?:^|&)redirect=(.*)$/s);
  let target = match ? match[1] : "";

  // Полностью закодированный redirect (%2F.., %3F.., %3D..) — раскодируем один раз
  if (target && !target.startsWith("/")) {
    try {
      target = decodeURIComponent(target);
    } catch (e) {
      /* оставляем как есть */
    }
  }

  if (!target.startsWith("/")) {
    // Нет redirect — гостевая витрина
    window.location.replace("/offer");
    return;
  }

  const qIndex = target.indexOf("?");
  if (qIndex === -1) {
    window.location.replace(target);
    return;
  }

  // Разбираем внутренние параметры (разделители приходят как %26) и
  // пересобираем URL с корректным кодированием — чтобы sso_token/phone/name/lang
  // дошли до /app/partner без искажений и совпали с данными внутри JWT.
  const path = target.slice(0, qIndex);
  const query = target.slice(qIndex + 1).replace(/%26/gi, "&");
  const source = new URLSearchParams(query);
  const clean = new URLSearchParams();
  for (const [key, value] of source.entries()) {
    clean.set(key, value);
  }
  window.location.replace(`${path}?${clean.toString()}`);
});
</script>

<template>
  <div
    class="fixed inset-0 z-[100] bg-[radial-gradient(circle_at_top,_#111827_0%,_#04060b_45%,_#000000_100%)] max-w-[640px] mx-auto"
  />
</template>
