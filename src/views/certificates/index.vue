<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useI18n } from "vue-i18n";
import { useCertificatesStore } from "@/stores/certificates";
import { useOffersStore } from "@/stores/offers";
import { localePath } from "@/plugins/i18n";
import axios from "@/plugins/api";
import CertificateDetailInfo from "@/components/certificatDownload/certificateDetailInfo.vue";

const { t } = useI18n();
const certificatesStore = useCertificatesStore();
const offersStore = useOffersStore();
const isActive = ref(true); // true → "active", false → "inactive"
const currentPage = ref(1); // текущая страница пагинации
const perPage = ref(20);
const showToast = ref(false);
const toastMessage = ref("");
const certificateCodes = ref(new Map()); // Используем Map для хранения кодов
const hasInactiveCertificates = ref(false); // Переменная для отслеживания наличия неактивных сертификатов
const isLoading = ref(true); // Переменная для отслеживания загрузки
const isCertificateDetailOpen = ref(false);
const isCertificateDetailLoading = ref(false);
const selectedCertificateDetail = ref(null);

onMounted(async () => {
  await checkInactiveCertificates();
});

async function checkInactiveCertificates() {
  try {
    isLoading.value = true;
    await certificatesStore.getAllCertificates("inactive");
    hasInactiveCertificates.value =
      certificatesStore.listCertificates.length > 0;
    // Возвращаемся к активным сертификатам
    await certificatesStore.getAllCertificates("active");
  } catch (error) {
    console.error("Error checking inactive certificates:", error);
    hasInactiveCertificates.value = false;
  } finally {
    isLoading.value = false;
  }
}

async function toggleState() {
  isLoading.value = true;
  isActive.value = !isActive.value;
  const status = isActive.value ? "active" : "inactive";
  await certificatesStore.getAllCertificates(status); // подгружаем нужные
  isLoading.value = false;
}

async function getOfferCode(item) {
  try {
    const response = await offersStore.getOfferCode(item.offer.slug);
    if (response) {
      certificateCodes.value.set(item.id, response);
      // Заставляем Vue обновить реактивное состояние
      certificateCodes.value = new Map(certificateCodes.value);
    }
  } catch (error) {
    console.error("Error getting offer code:", error);
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

function getCode(itemId) {
  return certificateCodes.value.get(itemId);
}

function hasCode(itemId) {
  return certificateCodes.value.has(itemId);
}

function lockPageScroll() {
  document.body.style.overflow = "hidden";
  document.documentElement.style.overflow = "hidden";
}

function unlockPageScroll() {
  document.body.style.overflow = "";
  document.documentElement.style.overflow = "";
}

function closeCertificateDetail() {
  isCertificateDetailOpen.value = false;
  selectedCertificateDetail.value = null;
  unlockPageScroll();
}

async function openCertificateDetail(certificateId) {
  try {
    if (!certificateId) throw new Error("Certificate ID is missing");
    isCertificateDetailLoading.value = true;
    const response = await axios.get(`v1/my/certificates/${certificateId}`);
    if (response?.status !== 200 || !response?.data) {
      throw new Error("Empty certificate detail response");
    }
    selectedCertificateDetail.value = response.data;
    isCertificateDetailOpen.value = true;
    lockPageScroll();
  } catch (error) {
    console.error("Error getting certificate detail:", error);
  } finally {
    isCertificateDetailLoading.value = false;
  }
}

// pagination
function changePagePagination(page) {
  currentPage.value = page;
  certificatesStore.getAllCertificates(
    isActive.value ? "active" : "inactive",
    perPage.value,
    page
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

onUnmounted(() => {
  unlockPageScroll();
});
</script>

<template>
  <div class="page-certificates py-10 h-[90vh] 768:pb-[100px] 480:py-6">
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

    <div class="site-container !pb-28">
      <div
        class="flex items-center justify-between mb-6 480:flex-col 480:items-start 480:gap-7"
      >
        <div class="site-title !mb-0">{{ $t("certificates") }}</div>
        <div
          class="relative flex items-center gap-2 480:w-full 480:justify-center"
        >
          <!-- Buttons -->
          <button
            @click="toggleState(true)"
            :class="[
              'py-2.5 px-6 font-medium rounded-[20px] text-sm transition-colors',
              isActive
                ? 'text-black bg-white border border-black'
                : 'bg-black text-white border border-white',
            ]"
          >
            {{ $t("active") }}
          </button>
          <button
            @click="toggleState(false)"
            :class="[
              'py-2.5 px-6 font-medium rounded-[20px] text-sm transition-colors',
              !isActive
                ? 'text-black bg-white border border-black'
                : 'bg-black text-white border border-white',
            ]"
          >
            {{ $t("inactive") }}
          </button>
        </div>
      </div>
      <div>
        <div v-if="isLoading">
          <div
            v-for="n in 3"
            :key="n"
            class="shadow-[0_0_2px_0_rgba(0,0,0,.04),0_2px_20px_0_rgba(0,0,0,.08)] p-4 mb-6 rounded-lg animate-pulse"
          >
            <div
              class="flex items-center justify-between 768:flex-col 768:items-start 768:gap-4"
            >
              <div class="w-full 768:mb-2">
                <!-- Скелетон названия -->
                <div class="h-6 bg-gray-200 rounded mb-2 w-3/4"></div>
                <div class="flex items-center gap-4">
                  <!-- Скелетон логотипа -->
                  <div class="w-10 h-10 bg-gray-200 rounded"></div>
                  <!-- Скелетон названия мерчанта -->
                  <div class="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div
                class="w-full flex justify-center gap-4 400:gap-2 400:flex-col"
              >
                <!-- Скелетон кнопок -->
                <div
                  class="h-12 bg-gray-200 rounded-xl w-full max-w-[220px] 768:max-w-full"
                ></div>
                <div
                  class="h-12 bg-gray-200 rounded-xl w-full max-w-[220px] 768:max-w-full"
                ></div>
              </div>
            </div>
          </div>
        </div>
        <div
          v-else
          class="border border-[#ffffff1f] p-4 mb-6 flex justify-between rounded-2xl hover:scale-[1.01] transition-all duration-300 flex-col items-start gap-2"
          v-for="(item, index) in certificatesStore.listCertificates"
          :key="index"
          :class="!isActive ? 'opacity-50' : ''"
        >
          <div class="w-full mb-2">
            <div class="font-semibold text-base mb-2">
              {{ item?.offer?.name }}
            </div>
            <div class="flex items-center gap-4">
              <div class="w-10">
                <img
                  :src="`https://main.primeclub.uz/uploads/${item?.offer?.merchant?.logo}`"
                  :alt="item?.offer?.merchant?.name"
                />
              </div>
              <div class="text-sm">
                {{ item?.offer?.merchant?.name }}
              </div>
            </div>
          </div>
          <div class="w-full gap-2 flex flex-col" v-if="isActive">
            <template v-if="item?.is_digital">
              <button
                class="site-btn-grey gap-2 min-h-11 show-code-btn"
                @click="item.showCode = true"
                v-if="!item.showCode"
              >
                <img src="/icons/p-offer/show1.svg" alt="" class="w-6" />
                {{ $t("show_code") }}
              </button>
              <button
                class="site-btn-grey gap-2 min-h-11 show-code"
                v-else
                @click="copyOfferCode(item.code)"
              >
                <img src="/icons/p-offer/copy.svg" alt="" class="w-4" />
                {{ item.code }}
              </button>
            </template>
            <template v-else>
              <button
                @click="openCertificateDetail(item?.id)"
                class="site-btn-grey !gap-1 min-h-11"
                :disabled="isCertificateDetailLoading"
              >
                <img src="/icons/show_certificate.svg" alt="" class="w-4" />
                {{ $t("Показать сертификат") }}
              </button>

              <!-- <a
                :href="`https://t.me/primeuz_bot/?start=booking_${item?.id}`"
                target="_blank"
                class="site-btn gap-2"
                v-if="item?.offer?.is_bookable || item?.offer?.is_notifiable"
              >
                <img src="/icons/booking.svg" alt="" class="w-5" />

                {{ $t("book") }}
              </a> -->
              <a
                :href="`https://t.me/primeuz_bot?start=booking_${item?.id}`"
                class="site-btn-grey gap-2 min-h-11"
                target="_blank"
                rel="noopener noreferrer"
                v-if="item?.offer?.is_bookable || item?.offer?.is_notifiable"
              >
                <img src="/icons/booking.svg" alt="" class="w-5" />
                {{ $t("book") }}
              </a>
            </template>
          </div>
        </div>
        <div
          class="flex justify-end 768:justify-center"
          v-if="certificatesStore.pagination.total > 20"
        >
          <vue-awesome-paginate
            :total-items="certificatesStore.pagination.total"
            :items-per-page="certificatesStore.pagination.perPage"
            :max-pages-shown="5"
            :page="certificatesStore.pagination.currentPage"
            v-model="currentPage"
            @click="changePagePagination"
          />
        </div>
      </div>

      <template v-if="certificatesStore.listCertificates.length === 0">
        <div class="empty-state">
          <div class="empty-icon">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              ></path>
            </svg>
          </div>
          <div class="empty-title">{{ $t("no_active_certificates") }}</div>
          <div class="empty-text">
            {{ $t("donthave_any_active_certificates_yet") }}<br />{{
              $t("you_can_get_new_privileges_on_the_main_page")
            }}
          </div>
        </div>
        <div class="flex justify-center fixed bottom-28 left-0 w-full">
          <router-link
            :to="localePath('/offer')"
            class="button-exit text-center text-base text-black font-medium bg-white border border-black rounded-3xl py-3 px-6"
          >
            <span>{{ $t("go_to_catalog") }}</span>
          </router-link>
        </div>
      </template>
    </div>

    <div
      v-if="isCertificateDetailOpen && selectedCertificateDetail"
      class="fixed inset-0 z-[80] bg-black overflow-y-auto px-4 pt-4 pb-8 max-w-[640px] mx-auto"
    >
      <CertificateDetailInfo
        :certificate-data="selectedCertificateDetail"
        @close="closeCertificateDetail"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
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

.page-certificates {
  .empty-state {
    text-align: center;
    padding-top: 15vh;
    .empty-icon {
      width: 80px;
      height: 80px;
      margin: 0 auto 20px;
      background-color: #f3f4f6;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;

      svg {
        width: 40px;
        height: 40px;
        stroke: #9ca3af;
        stroke-width: 2;
      }
    }
    .empty-title {
      font-size: 18px;
      font-weight: 600;
      color: #374151;
      margin-bottom: 10px;
    }
    .empty-text {
      font-size: 14px;
      color: #6b7280;
      line-height: 1.5;
    }
  }
}
</style>
