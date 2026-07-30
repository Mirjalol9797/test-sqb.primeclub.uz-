<script setup>
import { ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useMerchantsStore } from "@/stores/merchants";
import { useCertificatesStore } from "@/stores/certificates";
import { useSettingsStore } from "@/stores/settings";
import { useOffersStore } from "@/stores/offers";
import ModalCreateCertificate from "@/components/modals/ModalCreateCertificate.vue";
import ModalCodeError from "@/components/modals/ModalCodeError.vue";
import MBreadcrumbs from "../modules/MBreadcrumbs.vue";
import MMerchantDescription from "../modules/MMerchantDescription.vue";
import MMerchantLocation from "../modules/MMerchantLocation.vue";
import MMerchantSlider from "../modules/MMerchantSlider.vue";
import ModalMerchantBranches from "@/components/modals/ModalMerchantBranches.vue";
import ModalDownloadApp from "@/components/modals/ModalDownloadApp.vue";
import MMobileImage from "../modules/MMobileImage.vue";
import MMerchantInfo from "../modules/MMerchantInfo.vue";
import MCertificateBlock from "../modules/MCertificateBlock.vue";
import MMerchantFilials from "../modules/MMerchantFilials.vue";
import MMerchantSocials from "../modules/MMerchantSocials.vue";
import MMerchantInfoCertificate from "../modules/MMerchantInfoCertificate.vue";
import MDownloadApp from "../modules/MDownloadApp.vue";
import axios from "@/plugins/api";
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const route = useRoute();
const router = useRouter();
const merchantsStore = useMerchantsStore();
const certificatesStore = useCertificatesStore();
const settingsStore = useSettingsStore();
const offersStore = useOffersStore();
const showStickyHeader = ref(false);
const searchRef = ref(null);
const offerCodeBtn = ref(true);
const certificateBlockRef = ref(null);
const bottomButton = ref(null);
const showToast = ref(false);
const toastMessage = ref("");
const codeError = ref(null);
const selectedOfferId = ref(null);
const activeTab = ref("terms");

const setActiveTab = (tab) => {
  activeTab.value = tab;
};

function handleScroll() {
  if (searchRef.value) {
    const rect = searchRef.value.getBoundingClientRect();
    showStickyHeader.value = rect.top <= 0;
  }
}

onMounted(async () => {
  await merchantsStore.getOneMerchant(route.params.slug);
  await merchantsStore.getOneMerchatOffer(route.params.slug);
  await merchantsStore.getBookingFlow(route.params.slug);

  window.addEventListener("scroll", handleScroll);
});

function createCertificate(offer_id, merchant_branch_id) {
  selectedOfferId.value = offer_id;
  certificatesStore.createCertificate(offer_id, merchant_branch_id);
  settingsStore.isCreateCertificate = true;
}

async function downloadCertificate() {
  try {
    const certificateId = certificatesStore.createdCertificates?.id;
    if (!certificateId) throw new Error("Certificate ID is missing");

    const response = await certificatesStore.downloadCertificate(certificateId);

    const data = response?.data;
    if (!data) throw new Error("Empty response");

    // Создаём новый blob при каждом нажатии
    const blob = new Blob([data], { type: "application/pdf" });
    const url = window.URL.createObjectURL(blob);

    // Открываем в новой вкладке
    window.open(url, "_blank");

    // Скачиваем файл
    const a = document.createElement("a");
    a.href = url;
    a.download = `certificate_${certificateId}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    // Освобождаем память с задержкой, чтобы вкладка успела загрузить файл
    setTimeout(() => {
      window.URL.revokeObjectURL(url);
    }, 2000);
  } catch (error) {
    console.error("Error downloading the certificate:", error);
  }
}

async function getOfferCode(item) {
  try {
    const response = await axios.get(`v1/offers/${item.slug}/code`);
    if (response.status !== 200) return;

    item._code = response.data.code;
  } catch (error) {
    console.error("Ошибка получения кода:", error);
    codeError.value = error.response.data;
    settingsStore.isModalCodeError = true;
  }
}

async function copyOfferCode(code) {
  try {
    await navigator.clipboard.writeText(code);
    toastMessage.value = t("code_copied");
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  } catch (err) {
    toastMessage.value = t("code_copy_failed");
    showToast.value = true;
    setTimeout(() => {
      showToast.value = false;
    }, 3000);
  }
}

function scrollToCertificateButton() {
  certificateBlockRef.value?.scrollToButton();
}

function openMerchantBranches(offer_id) {
  selectedOfferId.value = offer_id;
  settingsStore.isMerchantBranches = true;
}

// Добавляем watcher для изменения маршрута
watch(
  () => route.path,
  async () => {
    await merchantsStore.getBookingFlow(route.params.slug);
    // Закрываем модалку при изменении маршрута
    settingsStore.isCreateCertificate = false;
    settingsStore.isModalCodeError = false;
    settingsStore.isMerchantBranches = false;
    settingsStore.isDownloadAppModal = false;
  }
);

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
  settingsStore.isCreateCertificate = false;
  settingsStore.isModalCodeError = false;
  settingsStore.isMerchantBranches = false;
  settingsStore.isDownloadAppModal = false;
});
</script>

<template>
  <transition name="fade-slide">
    <div
      v-if="showStickyHeader"
      class="hidden fixed top-0 left-0 w-full z-20 border-b border-f7f7f7 bg-white px-4 py-3 768:flex"
    >
      <!-- Здесь можно повторить функционал поиска, фильтра или просто заголовок -->
      <button @click="$router.back()">
        <img src="/icons/p-offer/back-black.svg" alt="" class="w-5" />
      </button>
      <div class="site-container text-center font-medium">
        {{ merchantsStore.oneMerchant?.name }}
      </div>
    </div>
  </transition>
  <!-- Добавляем компонент уведомления -->
  <transition name="toast">
    <div v-if="showToast" class="toast-notification">
      <div class="toast-content">
        <img
          :src="
            toastMessage.includes('успешно')
              ? '/icons/p-offer/success.svg'
              : '/icons/p-offer/error.svg'
          "
          class="toast-icon"
        />
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </transition>

  <div class="page-offer-detail pb-[100px] pt-0 bg-fff">
    <div class="site-container">
      <!-- breadcrumbs -->
      <MBreadcrumbs
        :breadcrumbs="merchantsStore.oneMerchant"
        class="768:hidden"
      />

      <!-- mobile image -->
      <MMobileImage
        :merchant="merchantsStore.oneMerchant"
        :merchant-offer="merchantsStore.oneMerchantOffer"
      />

      <div
        class="flex justify-between gap-4 offer-detail-wrapper flex-col-reverse"
      >
        <div class="left-column">
          <div class="p-4 rounded-2xl border border-[#ffffff1f]">
            <div
              class="flex gap-0.5"
              :class="activeTab === 'description' ? 'mb-0' : 'mb-5'"
            >
              <button
                @click="setActiveTab('terms')"
                :class="[
                  'text-sm font-medium text-center py-1.5 px-3 rounded-lg transition-colors',
                  activeTab === 'terms' ? 'bg-white text-black' : '',
                ]"
              >
                {{ $t("terms") }}
              </button>
              <button
                @click="setActiveTab('description')"
                :class="[
                  'text-sm font-medium text-center py-1.5 px-3 rounded-lg transition-colors',
                  activeTab === 'description' ? 'bg-white text-black' : '',
                ]"
              >
                {{ $t("about_building") }}
              </button>
              <button
                @click="setActiveTab('filials')"
                :class="[
                  'text-sm font-medium text-center py-1.5 px-3 rounded-lg transition-colors',
                  activeTab === 'filials' ? 'bg-white text-black' : '',
                ]"
                v-if="merchantsStore.oneMerchant?.branches?.length > 0"
              >
                {{ $t("filials") }}
              </button>
            </div>
            <MMerchantDescription
              :description="merchantsStore.oneMerchant"
              v-if="activeTab === 'terms'"
            />

            <div v-if="activeTab === 'filials'">
              <MMerchantFilials :filials="merchantsStore.oneMerchant" />
              <MMerchantLocation
                :locations="merchantsStore.oneMerchant"
                :title="$t('filials')"
              />
            </div>

            <div
              v-if="
                activeTab === 'description' && merchantsStore.oneMerchant?.about
              "
              class="mt-4"
            >
              <MMerchantSocials
                :socials="merchantsStore.oneMerchant"
                blockClass="p-0"
              />
            </div>
          </div>
          <div v-if="activeTab === 'description'" class="mt-4">
            <div
              v-html="merchantsStore.oneMerchant?.about"
              class="p-4 rounded-2xl mb-4 border border-[#ffffff1f] text-sm"
            ></div>

            <MMerchantLocation
              :locations="merchantsStore.oneMerchant"
              class="p-4 rounded-2xl mb-4 480:mb-3 480:text-sm border border-[#ffffff1f]"
            />
          </div>
        </div>
        <div class="right-column">
          <!-- <template v-if="merchantsStore.oneMerchantOffer?.length > 1"> -->

          <MMerchantInfo
            :merchant="merchantsStore.oneMerchant"
            :on-scroll-to-certificate="scrollToCertificateButton"
            :merchant-offer="merchantsStore.oneMerchantOffer"
          />
          <div>
            <MCertificateBlock
              ref="certificateBlockRef"
              :merchant="merchantsStore.oneMerchant"
              :merchant-offer="merchantsStore.oneMerchantOffer"
              :booking-flow-data="merchantsStore.bookingFlowData"
              :offer-code="offersStore.offerCode"
              :code-error="codeError"
              :show-offer-code-btn="offerCodeBtn"
              @get-offer-code="getOfferCode"
              @copy-offer-code="copyOfferCode"
              @create-certificate="createCertificate"
              @open-merchant-branches="openMerchantBranches"
            />
          </div>
          <!-- </template> -->

          <!-- <template v-else>
            <MMerchantInfoCertificate
              :merchant="merchantsStore.oneMerchant"
              :merchant-offer="merchantsStore.oneMerchantOffer"
              :offer-code="offersStore.offerCode"
              :show-offer-code-btn="offerCodeBtn"
              :code-error="codeError"
              @get-offer-code="getOfferCode"
              @copy-offer-code="copyOfferCode"
              @create-certificate="createCertificate"
              @open-merchant-branches="openMerchantBranches"
            />
          </template> -->
        </div>
      </div>

    </div>
  </div>

  <ModalCreateCertificate
    v-if="settingsStore.isCreateCertificate"
    @downloadCertificate="downloadCertificate"
    :is_bookable="merchantsStore.oneMerchantOffer[0]?.is_bookable"
    :is_notifiable="merchantsStore.oneMerchantOffer[0]?.is_notifiable"
    :certificateId="certificatesStore.createdCertificates?.id"
    :certificateData="certificatesStore.createdCertificates"
  />

  <ModalMerchantBranches
    v-if="settingsStore.isMerchantBranches"
    @closeModal="settingsStore.isMerchantBranches = false"
    :branches="merchantsStore.oneMerchant?.branches"
    @confirmSelection="
      (branchId) => createCertificate(selectedOfferId, branchId)
    "
  />

  <ModalDownloadApp v-if="settingsStore.isDownloadAppModal" />

  <ModalCodeError
    v-if="settingsStore.isModalCodeError"
    :code-error="codeError"
  />
</template>

<style lang="scss" scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s ease;
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-100%);
}

.mobile-image {
  &:after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
}

.toast-notification {
  position: fixed;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  padding: 16px 24px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 300px;
  color: #000;
}

.toast-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.toast-icon {
  width: 20px;
  height: 20px;
}

.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}

.toast-enter-from {
  opacity: 0;
  transform: translate(-50%, 20px);
}

.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
