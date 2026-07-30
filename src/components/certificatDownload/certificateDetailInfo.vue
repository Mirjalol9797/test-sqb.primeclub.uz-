<script setup>
import { computed, ref } from "vue";
import { useCertificatesStore } from "@/stores/certificates";

const props = defineProps({
  certificateData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close"]);
const certificatesStore = useCertificatesStore();
const isCodeInfoModalOpen = ref(false);
const isDiscountInfoModalOpen = ref(false);
const isConditionsModalOpen = ref(false);

const certificate = computed(
  () => props.certificateData?.data || props.certificateData || {}
);

const offer = computed(() => certificate.value?.offer || {});
const merchant = computed(() => offer.value?.merchant || {});
const contactName = computed(() => certificate.value?.contact_name || "-");
const code = computed(() => certificate.value?.code || "-");
const qrCode = computed(() => certificate.value?.qr_code || "");
const phone = computed(() => certificate.value?.contact_phone || "");
const address = computed(() => merchant.value?.address || "-");

const logoUrl = computed(() => {
  if (!merchant.value?.logo) return "";
  return `https://main.primeclub.uz/uploads/${merchant.value.logo}`;
});

const mapPreviewUrl = computed(() => {
  const lat = merchant.value?.latitude;
  const lon = merchant.value?.longitude;
  if (!lat || !lon) return "";
  return `https://static-maps.yandex.ru/1.x/?lang=ru_RU&ll=${lon},${lat}&z=15&size=650,260&l=map&pt=${lon},${lat},pm2gnm`;
});

function callMerchant() {
  if (!phone.value) return;
  window.location.href = `tel:${phone.value.replace(/\s+/g, "")}`;
}

async function downloadPdf() {
  try {
    const certificateId = certificate.value?.id;
    if (!certificateId) return;

    const response = await certificatesStore.downloadCertificate(certificateId);
    const data = response?.data;
    if (!data) return;

    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate_${certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Ошибка скачивания PDF сертификата:", error);
  }
}

function closeModal() {
  emit("close");
}

function openCodeInfoModal() {
  isCodeInfoModalOpen.value = true;
}

function closeCodeInfoModal() {
  isCodeInfoModalOpen.value = false;
}

function openDiscountInfoModal() {
  isDiscountInfoModalOpen.value = true;
}

function closeDiscountInfoModal() {
  isDiscountInfoModalOpen.value = false;
}

function openConditionsModal() {
  isConditionsModalOpen.value = true;
}

function closeConditionsModal() {
  isConditionsModalOpen.value = false;
}
</script>

<template>
  <div class="w-full text-white bg-black">
    <button
      type="button"
      @click="closeModal"
      class="absolute top-2 right-4 ml-auto min-w-8 h-8 rounded-full border border-[#e5e5ea] flex items-center justify-center text-2xl leading-none text-white z-10"
    >
      ×
    </button>
    <div class="text-xl font-semibold mb-2 text-center">Сертификат</div>

    <div class="border border-[#ececf0] rounded-2xl p-4">
      <div class="flex items-start justify-between gap-3">
        <div class="min-w-0">
          <div class="text-base font-semibold leading-tight mb-1">
            {{ merchant.name || "-" }}
          </div>
          <div class="text-sm">{{ offer.name || "-" }}</div>
        </div>
      </div>

      <div class="flex items-center justify-between mt-4 text-sm">
        <div class="  ">Контактное лицо</div>
        <div class="font-semibold text-right">{{ contactName }}</div>
      </div>
    </div>

    <div class="border border-[#ececf0] rounded-2xl p-4 mt-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="text-xs uppercase">Код сертификата</div>
          <div class="text-xl font-bold mt-1 break-all">{{ code }}</div>
        </div>
        <div class="w-24 h-24 rounded-xl border border-[#ececf0] p-2 bg-[#eee]">
          <img v-if="qrCode" :src="qrCode" alt="" />
        </div>
      </div>

      <button
        type="button"
        class="mt-2 underline text-sm"
        @click="openCodeInfoModal"
      >
        Что делать с этим кодом?
      </button>
    </div>

    <div class="rounded-2xl bg-[#141416] p-4 mt-4 text-sm">
      Достаточно показать код или QR на экране, не обязательно скачивать PDF
    </div>

    <div class="mt-6">
      <div class="text-lg font-semibold mb-3">Действия</div>
      <button
        type="button"
        class="w-full site-btn-grey mb-3"
        @click="openDiscountInfoModal"
      >
        Как получить скидку?
      </button>
      <button
        type="button"
        class="w-full site-btn-grey mb-3"
        @click="openConditionsModal"
      >
        Условия
      </button>
      <button
        type="button"
        class="w-full site-btn-grey mb-3"
        @click="downloadPdf"
      >
        Скачать PDF
      </button>
      <button type="button" class="w-full site-btn-grey" @click="callMerchant">
        Позвонить в заведение
      </button>
    </div>

    <div class="mt-6 border-t border-[#ececf0] pt-4">
      <div class="text-lg font-semibold mb-2">Адрес заведения</div>
      <div class="text-sm mb-3">{{ address }}</div>
      <img
        v-if="mapPreviewUrl"
        :src="mapPreviewUrl"
        alt=""
        class="w-full h-44 object-cover rounded-2xl border border-[#ececf0]"
      />
    </div>

    <div class="mt-4 rounded-3xl border border-[#ffffff1f] bg-[#eee] p-4">
      <img
        v-if="qrCode"
        :src="qrCode"
        alt=""
        class="w-56 h-56 mx-auto rounded-xl p-3"
      />
      <div class="text-center text-[#5f646e] text-sm mt-3">
        Покажите персоналу
      </div>
    </div>

    <!-- Что делать с этим кодом? -->
    <div
      v-if="isCodeInfoModalOpen"
      class="fixed inset-0 z-[70] bg-black/40 flex items-end max-w-[640px] mx-auto"
      @click.self="closeCodeInfoModal"
    >
      <div class="w-full bg-white rounded-t-3xl px-5 pt-4 pb-6 text-[#1f1f27]">
        <div class="w-14 h-1.5 bg-[#d6d6dc] rounded-full mx-auto mb-5"></div>
        <div class="relative pr-12">
          <button
            type="button"
            class="absolute right-0 top-0 w-10 h-10 rounded-full bg-[#f1f1f4] flex items-center justify-center text-2xl text-[#2d2d34]"
            @click="closeCodeInfoModal"
          >
            ×
          </button>
          <div class="text-lg font-semibold mb-1">Что делать с этим кодом?</div>
          <div class="text-[#8b8f98] text-sm mb-3">Инструкция</div>
        </div>
        <div class="text-[#5e6068] text-sm leading-relaxed">
          {{
            certificate.what_to_do_with_code?.text || "Информация отсутствует"
          }}
        </div>
      </div>
    </div>

    <!-- Как получить скидку? -->
    <div
      v-if="isDiscountInfoModalOpen"
      class="fixed inset-0 z-[70] bg-black/40 flex items-end max-w-[640px] mx-auto"
      @click.self="closeDiscountInfoModal"
    >
      <div class="w-full bg-white rounded-t-3xl px-5 pt-4 pb-6 text-[#1f1f27]">
        <div class="w-14 h-1.5 bg-[#d6d6dc] rounded-full mx-auto mb-5"></div>
        <div class="relative pr-12">
          <button
            type="button"
            class="absolute right-0 top-0 w-10 h-10 rounded-full bg-[#f1f1f4] flex items-center justify-center text-2xl text-[#2d2d34]"
            @click="closeDiscountInfoModal"
          >
            ×
          </button>
          <div class="text-lg font-semibold mb-1">Как получить скидку?</div>
          <div class="text-[#8b8f98] text-sm mb-3">Инструкция</div>
        </div>
        <div
          class="text-[#5e6068] text-sm leading-relaxed"
          v-html="
            certificate.how_to_get_a_discount?.text || 'Информация отсутствует'
          "
        ></div>
      </div>
    </div>

    <!-- Условия -->
    <div
      v-if="isConditionsModalOpen"
      class="fixed inset-0 z-[70] bg-black/40 flex items-end max-w-[640px] mx-auto"
      @click.self="closeConditionsModal"
    >
      <div class="w-full bg-white rounded-t-3xl px-5 pt-4 pb-6 text-[#1f1f27]">
        <div class="w-14 h-1.5 bg-[#d6d6dc] rounded-full mx-auto mb-5"></div>
        <div class="relative pr-12">
          <button
            type="button"
            class="absolute right-0 top-0 w-10 h-10 rounded-full bg-[#f1f1f4] flex items-center justify-center text-2xl text-[#2d2d34]"
            @click="closeConditionsModal"
          >
            ×
          </button>
          <div class="text-lg font-semibold mb-1">Условия</div>
          <div class="text-[#8b8f98] text-sm mb-3">Инструкция</div>
        </div>
        <div
          class="text-[#5e6068] text-sm leading-relaxed"
          v-html="certificate.conditions?.text || 'Информация отсутствует'"
        ></div>
      </div>
    </div>
  </div>
</template>
