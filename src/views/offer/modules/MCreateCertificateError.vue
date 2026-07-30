// ModalCreateCertificateError.vue
<script setup>
import { computed } from "vue";
import { useCertificatesStore } from "@/stores/certificates";
import { useI18n } from "vue-i18n";

const certificatesStore = useCertificatesStore();
const { t } = useI18n();

const formattedTime = computed(() => {
  if (!certificatesStore.errorCreateCertificate?.retry_after) return "";

  const totalSeconds = certificatesStore.errorCreateCertificate.retry_after;
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const timeParts = [];
  if (hours > 0) timeParts.push(`${hours} ${t("hours")}`);
  if (minutes > 0) timeParts.push(`${minutes} ${t("minutes")}`);
  if (seconds > 0) timeParts.push(`${seconds} ${t("seconds")}`);

  return timeParts.join(" ");
});
</script>

<template>
  <div class="mt-[-10px] 768:mt-0">
    <div class="font-medium mb-4 text-xl text-center">
      {{ $t("try_again_later") }}
    </div>
    <div class="text-gray-600 mb-3 text-center">
      {{ $t("max_certificates_per_day") }}
    </div>
    <div class="text-2xl font-bold text-center mb-3">
      {{ formattedTime }}
    </div>
    <div class="text-sm text-center">
      {{ $t("want_use_last_certificate") }} <br />
      {{ $t("book_here") }}
      <a
        :href="certificatesStore.errorCreateCertificate?.booking_link"
        target="_blank"
        class="text-007bff"
        >{{ $t("here") }}</a
      >
    </div>
  </div>
</template>
