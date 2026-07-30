<script setup>
import { computed, onUnmounted, ref } from "vue";
import { useRouter } from "vue-router";
import RequiredBlock from "./RequiredBlock.vue";
import OptionalBlock from "./OptionalBlock.vue";
import AlreadyReceived from "./AlreadyReceived.vue";
import CertificateDetailInfo from "./certificateDetailInfo.vue";

const emit = defineEmits(["close"]);
const router = useRouter();
const props = defineProps({
  selectedOfferId: {
    type: [Number, String],
    default: null,
  },
  selectedMerchantBranchId: {
    type: [Number, String],
    default: null,
  },
  merchantBranches: {
    type: Array,
    default: () => [],
  },
  merchantOffer: {
    type: Array,
    default: () => [],
  },
  bookingFlowData: {
    type: Array,
    default: () => [],
  },
});

const requiredItem = computed(() =>
  props.merchantOffer.some((item) => item?.booking_requirement === "required")
);

const requiredFlowItem = computed(
  () =>
    props.bookingFlowData.find(
      (item) => item?.booking_requirement === "required"
    ) || null
);

const optionalFlowItem = computed(
  () =>
    props.bookingFlowData.find(
      (item) => item?.booking_requirement === "optional"
    ) || null
);

const showAlreadyReceivedModal = ref(false);
const showCertificateDetail = ref(false);
const certificateDetailData = ref(null);
const alreadyReceivedContent = ref({
  title: "Сертификат уже получен",
  description:
    "Вы уже получали сертификат в этом заведении сегодня. Найти его можно в разделе Сертификаты",
});

function lockPageScroll() {
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

function unlockPageScroll() {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

lockPageScroll();

function closeModal() {
  unlockPageScroll();
  emit("close");
}

function handleAlreadyReceived(flowResult) {
  const apiMessage = flowResult?.response?.message;
  const retryAfter = flowResult?.response?.retry_after;
  const apiDescription =
    flowResult?.response?.data?.message ||
    flowResult?.response?.error ||
    (retryAfter
      ? `Попробуйте снова через ${retryAfter} секунд или откройте раздел Сертификаты.`
      : "");

  alreadyReceivedContent.value = {
    title: apiMessage || "Сертификат уже получен",
    description:
      apiDescription ||
      "Вы уже получали сертификат в этом заведении сегодня. Найти его можно в разделе Сертификаты",
  };
  showAlreadyReceivedModal.value = true;
}

function closeAlreadyReceivedModal() {
  showAlreadyReceivedModal.value = false;
}

function handleFlowSuccess(flowResult) {
  if (flowResult?.status === "success" && flowResult?.certificateData) {
    certificateDetailData.value = flowResult.certificateData;
    showCertificateDetail.value = true;
    showAlreadyReceivedModal.value = false;
    return;
  }
  closeModal();
}

async function goToCertificates() {
  showAlreadyReceivedModal.value = false;
  closeModal();
  await router.push("/certificates");
}

onUnmounted(() => {
  unlockPageScroll();
});
</script>

<template>
  <div class="fixed inset-0 z-50 text-black text-sm max-w-[640px] mx-auto">
    <div
      v-if="!showCertificateDetail"
      class="absolute inset-0 bg-black/45"
      @click="closeModal"
    ></div>

    <div
      v-if="!showCertificateDetail"
      class="absolute left-0 right-0 bottom-0 w-full bg-[#141416] text-white border-t border-white rounded-t-3xl px-5 pt-3 pb-6"
    >
      <div
        class="w-[56px] h-[6px] rounded-full bg-[#e4e4e4] mx-auto mb-4"
      ></div>
      <!-- кнопка закрытия модалки -->
      <button
        type="button"
        @click="closeModal"
        class="absolute right-4 top-7 min-w-8 h-8 rounded-full border border-[#e5e5ea] flex items-center justify-center text-2xl leading-none text-white"
      >
        ×
      </button>
      <!-- контент модалки -->

      <RequiredBlock
        v-if="requiredItem"
        :flow-item="requiredFlowItem"
        :selected-offer-id="selectedOfferId"
        :selected-merchant-branch-id="selectedMerchantBranchId"
        :merchant-branches="merchantBranches"
        @close="closeModal"
        @already-received="handleAlreadyReceived"
        @success="handleFlowSuccess"
      />
      <OptionalBlock
        v-else
        :flow-item="optionalFlowItem"
        :selected-offer-id="selectedOfferId"
        :selected-merchant-branch-id="selectedMerchantBranchId"
        :merchant-branches="merchantBranches"
        @close="closeModal"
        @already-received="handleAlreadyReceived"
        @success="handleFlowSuccess"
      />
    </div>

    <div
      v-else
      class="absolute inset-0 bg-black overflow-y-auto px-4 pt-4 pb-8"
    >
      <CertificateDetailInfo
        :certificate-data="certificateDetailData"
        @close="closeModal"
      />
    </div>

    <AlreadyReceived
      v-if="showAlreadyReceivedModal"
      :title="alreadyReceivedContent.title"
      :description="alreadyReceivedContent.description"
      @close="closeAlreadyReceivedModal"
      @go-certificates="goToCertificates"
    />
  </div>
</template>
