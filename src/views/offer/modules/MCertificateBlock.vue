<script setup>
import {
  defineProps,
  defineExpose,
  ref,
  onMounted,
  onUnmounted,
  watch,
} from "vue";
import { useRoute } from "vue-router";
import { useLoginStore } from "@/stores/login";
import { useSettingsStore } from "@/stores/settings";
import TmButton from "@/components/ui/TmButton.vue";
import ModalAboniment from "@/components/modals/ModalAboniment.vue";
import ModalGlobalDownloadCertificate from "@/components/certificatDownload/ModalGlobalDownloadCertificate.vue";
import ModalMerchantBranches from "@/components/modals/ModalMerchantBranches.vue";

const loginStore = useLoginStore();
const settingsStore = useSettingsStore();
const route = useRoute();
const bottomButton = ref(null);
const showCodes = ref({});
const certificateContainer = ref(null);
const isWarnInstitutionModalOpen = ref(false);
const selectedOfferIdForWarnModal = ref(null);
const isMerchantBranchesForWarnOpen = ref(false);
const selectedMerchantBranchIdForWarnModal = ref(null);

const scrollToButton = () => {
  if (certificateContainer.value) {
    certificateContainer.value.scrollIntoView({
      behavior: "smooth",
      top: 90,
    });
  }
};

defineExpose({
  scrollToButton,
});

const props = defineProps({
  merchantOffer: {
    type: [Array, Object],
    required: true,
  },
  bookingFlowData: {
    type: Object,
    default: null,
  },
  merchant: {
    type: Object,
    required: true,
  },
  offerCode: {
    type: String,
    default: "",
  },
  showOfferCodeBtn: {
    type: Boolean,
    required: true,
  },
  codeError: {
    type: Object,
    default: () => {},
  },
});

const emit = defineEmits([
  "getOfferCode",
  "copyOfferCode",
  "createCertificate",
]);

function showCode(item) {
  emit("getOfferCode", item);
  showCodes.value[item.id] = true;
}

// Копировать код для конкретного предложения
function copyCode(item) {
  emit("copyOfferCode", item._code);
}

function openDownloadAppModal() {
  settingsStore.isDownloadAppModal = true;
}

function openWarnFlowWithBranches(offerId) {
  selectedOfferIdForWarnModal.value = offerId;
  selectedMerchantBranchIdForWarnModal.value = null;
  const branches = props.merchant?.branches || [];

  if (branches.length > 0) {
    isMerchantBranchesForWarnOpen.value = true;
    return;
  }

  isMerchantBranchesForWarnOpen.value = false;
  isWarnInstitutionModalOpen.value = true;
}

function handleWarnBranchSelected(branchId) {
  selectedMerchantBranchIdForWarnModal.value = branchId;
  isMerchantBranchesForWarnOpen.value = false;
  isWarnInstitutionModalOpen.value = true;
}

watch(
  () => route.path,
  () => {
    // Закрываем модалку при изменении маршрута
    settingsStore.isAboniment = false;
  }
);

onUnmounted(() => {
  settingsStore.isAboniment = false;
});
</script>

<template>
  <div class="text-sm font-medium mb-3 768:mb-2" ref="certificateContainer">
    {{ $t("all_discounts") }}
  </div>
  <div class="flex mb-0 overflow-x-auto items-start gap-2">
    <div
      class="p-3 rounded-2xl last:mb-0 mb-0 border border-[#ffffff1f]"
      :class="merchantOffer?.length > 1 ? 'min-w-[250px]' : 'min-w-full'"
      v-for="(item, index) in merchantOffer"
      :key="index"
    >
      <div class="text-sm mb-1 font-semibold">
        {{ item?.name }}
      </div>
      <div
        class="text-6B7280 text-sm min-h-10"
        v-if="item?.description"
        v-html="item?.description"
      ></div>
      <div class="mt-3">
        <template v-if="item?.skip_certificate == true">
          <button
            class="site-btn-grey gap-2"
            @click="showCode(item)"
            v-if="
              !showCodes[item.id] ||
              (codeError && Object.keys(codeError).length > 0)
            "
          >
            <img src="/icons/p-offer/show1.svg" alt="" class="w-5" />
            {{ $t("show_code") }}
          </button>
          <button class="site-btn-grey" v-else @click="showCode(item)">
            <img src="/icons/p-offer/copy.svg" alt="" class="w-4" />
            {{ item._code }}
          </button>
        </template>
        <template v-else>
          <!-- <button
            class="site-btn-grey get-certificat-single"
            @click="$emit('createCertificate', item?.id)"
            v-if="merchant?.type == 'single'"
          >
            {{ $t("get_certificate") }}
          </button> -->
          <button
            class="site-btn-grey get-certificat"
            @click="openWarnFlowWithBranches(item?.id)"
          >
            {{ $t("get_certificate") }}
          </button>
        </template>
      </div>
    </div>
  </div>

  <ModalAboniment v-if="settingsStore.isAboniment" />
  <ModalMerchantBranches
    v-if="isMerchantBranchesForWarnOpen"
    :branches="merchant?.branches || []"
    :auto-open-create-certificate="false"
    @closeModal="isMerchantBranchesForWarnOpen = false"
    @confirmSelection="handleWarnBranchSelected"
  />
  <ModalGlobalDownloadCertificate
    v-if="isWarnInstitutionModalOpen"
    :selected-offer-id="selectedOfferIdForWarnModal"
    :selected-merchant-branch-id="selectedMerchantBranchIdForWarnModal"
    :merchant-branches="merchant?.branches || []"
    :merchant-offer="merchantOffer"
    :booking-flow-data="bookingFlowData"
    @close="
      isWarnInstitutionModalOpen = false;
      selectedOfferIdForWarnModal = null;
      selectedMerchantBranchIdForWarnModal = null;
    "
  />
</template>

<style lang="scss" scoped>
.discount-card {
  background: linear-gradient(
    50deg,
    #ffffff 0%,
    #ffffff 50%,
    #ffffff 65%,
    rgba(46, 250, 199, 0.6) 120%
  );
  border: 1px solid rgba(243, 244, 246, 1);
  background-color: rgba(249, 250, 251, 1);

  @media (max-width: 768px) {
    min-width: 320px;
  }
}
</style>
