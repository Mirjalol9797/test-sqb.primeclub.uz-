<script setup>
import { computed, ref } from "vue";
import { useCertificatesStore } from "@/stores/certificates";
import { downloadPdfFile } from "@/utils/downloadPdf";
import { callPhone, normalizePhone } from "@/utils/phoneCall";
import MainTitle from "@/components/MainTitle.vue";

const props = defineProps({
  certificateData: {
    type: Object,
    default: () => ({}),
  },
});

const emit = defineEmits(["close"]);
const certificatesStore = useCertificatesStore();
const isCodeInfoModalOpen = ref(false);
const isCallModalOpen = ref(false);
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
const phone = computed(
  () => certificate.value?.contact_phone || merchant.value?.phone || ""
);
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

const phoneNumber = computed(() => normalizePhone(phone.value));

// Номер для показа в модалке: узбекские номера разбиваем как
// +998 XX-XXX-XX-XX, остальные показываем в том виде, в каком их отдал бэк.
const phoneDisplay = computed(() => {
  const digits = phoneNumber.value.replace(/\D/g, "");
  const uz = digits.match(/^998(\d{2})(\d{3})(\d{2})(\d{2})$/);
  if (uz) return `+998 ${uz[1]}-${uz[2]}-${uz[3]}-${uz[4]}`;
  return phone.value || "";
});

const isCalling = ref(false);

function openCallModal() {
  if (!phoneNumber.value) return;
  isCallModalOpen.value = true;
}

function closeCallModal() {
  isCallModalOpen.value = false;
}

// Звоним только после подтверждения в модалке. Переход на tel: идёт через
// callPhone: в Android WebView необработанная схема уводит страницу на
// ERR_UNKNOWN_URL_SCHEME и убивает SPA.
async function confirmCall() {
  if (!phoneNumber.value || isCalling.value) return;

  isCalling.value = true;
  try {
    await callPhone(phoneNumber.value);
  } finally {
    isCalling.value = false;
    isCallModalOpen.value = false;
  }
}

async function downloadPdf() {
  try {
    const certificateId = certificate.value?.id;
    if (!certificateId) return;

    const response = await certificatesStore.downloadCertificate(certificateId);
    const data = response?.data;
    if (!data) return;

    await downloadPdfFile(data, `certificate_${certificateId}.pdf`);
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
  <div class="w-full text-white bg-black pt-safe-overlay relative">
    <MainTitle :pageTitle="$t('certificate')" class="mb-4" @back="closeModal" />

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
        <div class="  ">{{ $t("contact_person") }}</div>
        <div class="font-semibold text-right">{{ contactName }}</div>
      </div>
    </div>

    <div class="border border-[#ececf0] rounded-2xl p-4 mt-4">
      <div class="flex items-center justify-between gap-4">
        <div>
          <div class="text-xs uppercase">{{ $t("certificate_code") }}</div>
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
        {{ $t("what_to_do_with_code") }}
      </button>
    </div>

    <div class="rounded-2xl bg-[#141416] p-4 mt-4 text-sm">
      {{ $t("code_or_qr_enough") }}
    </div>

    <div class="mt-6">
      <div class="text-lg font-semibold mb-3">{{ $t("actions") }}</div>
      <button
        type="button"
        class="w-full site-btn-grey mb-3"
        @click="openDiscountInfoModal"
      >
        {{ $t("how_to_get_discount") }}
      </button>
      <button
        type="button"
        class="w-full site-btn-grey mb-3"
        @click="openConditionsModal"
      >
        {{ $t("terms") }}
      </button>
      <button
        type="button"
        class="w-full site-btn-grey mb-3"
        @click="downloadPdf"
      >
        {{ $t("download_pdf") }}
      </button>
      <button
        type="button"
        class="w-full site-btn-grey"
        :class="{ 'opacity-50 pointer-events-none': !phoneNumber }"
        :disabled="!phoneNumber"
        @click="openCallModal"
      >
        {{ $t("call_establishment") }}
      </button>
    </div>

    <div class="mt-6 border-t border-[#ececf0] pt-4">
      <div class="text-lg font-semibold mb-2">
        {{ $t("establishment_address") }}
      </div>
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
        {{ $t("show_to_staff") }}
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
          <div class="text-lg font-semibold mb-1">
            {{ $t("what_to_do_with_code") }}
          </div>
          <div class="text-[#8b8f98] text-sm mb-3">{{ $t("instruction") }}</div>
        </div>
        <div class="text-[#5e6068] text-sm leading-relaxed">
          {{ certificate.what_to_do_with_code?.text || $t("no_information") }}
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
          <div class="text-lg font-semibold mb-1">
            {{ $t("how_to_get_discount") }}
          </div>
          <div class="text-[#8b8f98] text-sm mb-3">{{ $t("instruction") }}</div>
        </div>
        <div
          class="text-[#5e6068] text-sm leading-relaxed"
          v-html="
            certificate.how_to_get_a_discount?.text || $t('no_information')
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
          <div class="text-lg font-semibold mb-1">{{ $t("terms") }}</div>
          <div class="text-[#8b8f98] text-sm mb-3">{{ $t("instruction") }}</div>
        </div>
        <div
          class="text-[#5e6068] text-sm leading-relaxed"
          v-html="certificate.conditions?.text || $t('no_information')"
        ></div>
      </div>
    </div>

    <!-- Позвонить в заведение -->
    <tm-modal
      v-if="isCallModalOpen"
      width="580"
      :closeBtn="false"
      titleClass="text-center"
      classWrap="modal-wrap"
      class="call-merchant-modal"
      :title="$t('call_establishment')"
      @closeModal="closeCallModal"
    >
      <template #modal_content>
        <div class="mt-4 space-y-3">
          <div class="flex justify-center mt-6 mb-6 768:mb-3 768:mt-3">
            <button
              type="button"
              class="site-btn-grey"
              :disabled="isCalling"
              @click="confirmCall"
            >
              {{ phoneDisplay }}
            </button>
          </div>

          <div class="flex justify-center mt-4">
            <button
              type="button"
              class="text-[#666] text-center underline"
              @click="closeCallModal"
            >
              {{ $t("cancel2") }}
            </button>
          </div>
        </div>
      </template>
    </tm-modal>
  </div>
</template>

<style lang="scss">
.call-merchant-modal {
  .modal-wrap {
    @media (max-width: 768px) {
      max-width: 320px !important;
    }
  }
}
</style>
