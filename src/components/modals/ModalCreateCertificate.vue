<script setup>
import { ref, computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useCertificatesStore } from "@/stores/certificates";
import MCreateCertificateError from "@/views/offer/modules/MCreateCertificateError.vue";
import { useI18n } from "vue-i18n";

const settingsStore = useSettingsStore();
const certificatesStore = useCertificatesStore();
const { t } = useI18n();
const isFirstText = ref(true);
const isWtihoutBooking = ref(true);
const isWarnTheEstablishment = ref(false);
const isNewButtons = ref(false);
const props = defineProps({
  is_bookable: {
    type: Boolean,
    default: false,
  },
  is_notifiable: {
    type: Boolean,
    default: false,
  },
  certificateId: {
    type: String,
  },
  certificateData: {
    type: Object,
    default: () => {},
  },
});
const emit = defineEmits(["downloadCertificate"]);

function downloadCertificate(e) {
  emit("downloadCertificate", e);
}

function closeModal() {
  settingsStore.isCreateCertificate = false;
}

function extractStartParam(telegramLink) {
  if (!telegramLink) return "";
  const match = telegramLink.match(/start=([^&]+)/);
  return match ? match[1] : "";
}

function getTelegramBookingLink(startParam) {
  return startParam
    ? `https://t.me/primeuz_bot?start=${startParam}`
    : "https://t.me/primeuz_bot";
}
</script>

<template>
  <tm-modal
    width="560"
    :closeBtn="true"
    titleClass="text-center"
    @closeModal="closeModal"
    class="create-certificate-modal"
    classWrap="modal-wrap"
  >
    <template #modal_content>
      <div v-if="!certificatesStore.errorCreateCertificate">
        <div v-if="isFirstText" class="mt-[-10px]">
          <div class="font-medium mb-4 text-xl text-center">
            {{
              isWtihoutBooking
                ? t("warn_the_establishment")
                : t("certificate_ready")
            }}
          </div>
          <template v-if="isWtihoutBooking">
            <div
              class="text-center mb-1.5 text-gray-500"
              v-if="!isWarnTheEstablishment"
            >
              {{ $t("warn_the_establishment_desc") }}
            </div>
            <!-- <div class="text-center mb-6 italic">
              {{ $t("its_fast_telegram") }}
            </div> -->
            <button
              class="underline text-center mb-1 mx-auto w-full text-gray-500"
              @click="isWarnTheEstablishment = true"
            >
              {{ $t("why_warn") }}?
            </button>
            <div
              v-if="isWarnTheEstablishment"
              class="text-center text-gray-500"
              v-html="$t('why_warn_desc')"
            ></div>
            <div
              class="flex justify-center items-center gap-2 mb-4 mt-4 768:flex-col"
            >
              <!-- <a
                :href="`https://t.me/primeuz_bot/?start=booking_${certificateId}`"
                class="site-btn"
                @click="closeModal"
                target="_blank"
              >
                {{ $t("book_in_telegram") }}
              </a> -->
              <a
                :href="getTelegramBookingLink(`booking_${certificateId}`)"
                class="site-btn-grey w-full min-h-12"
                @click="closeModal"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ $t("warn_on_telegram") }}
              </a>
              <button
                class="site-btn-grey w-full min-h-12"
                v-if="isWtihoutBooking"
                @click="isWtihoutBooking = false"
              >
                {{ $t("dont_warn_the_establishment") }}
              </button>
            </div>
          </template>
          <div class="" v-if="!isWtihoutBooking">
            <div class="text-center text-gray-500 mb-4">
              {{ $t("warn_the_establishment_desc_2") }}
            </div>

            <div class="flex flex-wrap gap-2 justify-center">
              <button
                class="site-btn-grey w-full min-h-12"
                @click="downloadCertificate"
              >
                {{ $t("show_certificate") }}
              </button>
              <!-- <a
                class="site-btn text-center"
                :href="certificateData.telegram_link"
                target="_blank"
              >
                {{ $t("send_to_telegram") }}
              </a> -->
              <a
                class="site-btn-grey w-full min-h-12 text-center"
                :href="
                  getTelegramBookingLink(
                    extractStartParam(certificateData.telegram_link)
                  )
                "
                @click="closeModal"
                target="_blank"
                rel="noopener noreferrer"
              >
                {{ $t("warn_me_telegram") }}
              </a>
            </div>
          </div>
        </div>
        <div v-else class="768:mt-8 768:max-w-[90%] 768:mx-auto">
          <div class="text-center mb-4">
            {{ $t("booking_required") }}
            <span class="relative inline-block group">
              <span class="text-[#ffd531] cursor-help font-medium">{{
                $t("why")
              }}</span>
              <div
                class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-4 py-2 bg-[#333] text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 w-[280px] 768:text-xs"
              >
                {{ $t("booking_guarantee") }}
                <div
                  class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#333] rotate-45"
                ></div>
              </div>
            </span>
          </div>
          <div class="text-center mb-4">
            {{ $t("certificate_when_ready") }}
          </div>
          <div class="flex items-center justify-center">
            <button class="site-btn" @click="isFirstText = true">
              {{ $t("back_to_booking") }}
            </button>
          </div>
        </div>
      </div>
      <MCreateCertificateError v-else />
    </template>
  </tm-modal>
</template>

<style lang="scss">
.create-certificate-modal {
  z-index: 20;
  align-items: start;
  .modal-wrap {
    max-width: 100% !important;
    border-radius: 0;
    height: 100%;
  }
}
</style>
