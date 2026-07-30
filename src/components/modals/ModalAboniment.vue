<script setup>
import { ref, computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useCertificatesStore } from "@/stores/certificates";
import { useLoginStore } from "@/stores/login";
import { useRoute } from "vue-router";
import { useI18n } from "vue-i18n";

const route = useRoute();
const settingsStore = useSettingsStore();
const certificatesStore = useCertificatesStore();
const loginStore = useLoginStore();
const { t } = useI18n();
const isFirstText = ref(true);
const isWtihoutBooking = ref(true);
const isPurchaseSuccess = ref(false); // Состояние для переключения экранов
const selectedAmount = ref(null); // Выбранная сумма сертификата
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
  settingsStore.isAboniment = false;
  isPurchaseSuccess.value = false; // Сбрасываем состояние при закрытии
  selectedAmount.value = null; // Сбрасываем выбранную сумму
}

// Функция для выбора суммы сертификата
function selectAmount(amount) {
  selectedAmount.value = amount;
}

// Функция для подтверждения покупки
function confirmPurchase() {
  // Проверяем, что пользователь выбрал сумму
  if (!selectedAmount.value) {
    alert(t("please_select_amount"));
    return;
  }

  const purchaseAmount = selectedAmount.value;

  if (loginStore.hasEnoughBalance(purchaseAmount)) {
    // Списываем средства
    const success = loginStore.deductBalance(purchaseAmount);
    if (success) {
      // Переключаемся на экран успешной покупки
      isPurchaseSuccess.value = true;
    }
  } else {
    alert(t("insufficient_funds"));
  }
}

// Функция для скачивания сертификата
function downloadCertificateFile() {
  // Здесь будет логика для скачивания сертификата
  alert(t("downloading_certificate"));
  closeModal();
}
</script>

<template>
  <tm-modal
    width="560"
    :closeBtn="true"
    titleClass="text-center"
    @closeModal="closeModal"
    class="aboniment-modal"
    classWrap="modal-wrap"
  >
    <template #modal_content>
      <div>
        <!-- Экран подтверждения покупки -->
        <div v-if="!isPurchaseSuccess">
          <div class="text-2xl font-medium mb-4 text-center mt-[-20px]">
            {{ $t("select_certificate_value") }}
          </div>
          <div class="text-center mb-2">{{ $t("denomination_amount") }}:</div>
          <div
            class="flex items-center justify-evenly gap-2 mb-4 480:grid 480:grid-cols-2"
          >
            <button
              @click="selectAmount(500000)"
              :class="[
                'border px-4 py-2 rounded-xl transition-colors',
                selectedAmount === 500000
                  ? 'bg-ffd531 text-white border-f4af00'
                  : 'border-f4af00 text-00b08c hover:bg-ffd531 hover:text-white',
              ]"
            >
              500 000
            </button>
            <button
              @click="selectAmount(1000000)"
              :class="[
                'border px-4 py-2 rounded-xl transition-colors',
                selectedAmount === 1000000
                  ? 'bg-ffd531 text-white border-f4af00'
                  : 'border-f4af00 text-00b08c hover:bg-ffd531 hover:text-white',
              ]"
            >
              1 000 000
            </button>
            <button
              @click="selectAmount(1500000)"
              :class="[
                'border px-4 py-2 rounded-xl transition-colors',
                selectedAmount === 1500000
                  ? 'bg-ffd531 text-white border-f4af00'
                  : 'border-f4af00 text-00b08c hover:bg-ffd531 hover:text-white',
              ]"
            >
              1 500 000
            </button>
            <button
              @click="selectAmount(2000000)"
              :class="[
                'border px-4 py-2 rounded-xl transition-colors',
                selectedAmount === 2000000
                  ? 'bg-ffd531 text-white border-f4af00'
                  : 'border-f4af00 text-00b08c hover:bg-ffd531 hover:text-white',
              ]"
            >
              2 000 000
            </button>
          </div>
          <div class="text-sm text-gray-500 text-center mb-6">
            {{ $t("after_purchase_deducted") }}
          </div>
          <div class="flex items-center justify-center gap-2 768:flex-col">
            <button
              class="site-btn !bg-white !text-00b08c border border-f4af00"
              @click="closeModal"
            >
              {{ $t("cancel") }}
            </button>
            <button class="site-btn" @click="confirmPurchase">
              {{ $t("confirm") }}
            </button>
          </div>
        </div>

        <!-- Экран успешной покупки -->
        <div v-else>
          <div class="text-2xl font-medium mb-4 text-center">
            {{ $t("certificate_successfully_received") }}
          </div>
          <div class="text-center mb-4">
            {{ $t("you_successfully_received_the_certificate") }}
          </div>

          <div class="flex items-center justify-center gap-2 768:flex-col">
            <button
              class="site-btn !bg-white !text-gray-600 border border-gray-300"
              @click="closeModal"
            >
              {{ $t("close") }}
            </button>
            <a
              class="site-btn"
              href="/certificate.pdf"
              target="_blank"
              download
            >
              {{ $t("download_certificate") }}
            </a>
          </div>
        </div>
      </div>
    </template>
  </tm-modal>
</template>

<style lang="scss">
@media (max-width: 768px) {
  .aboniment-modal {
    z-index: 20;
    align-items: start;
    .modal-wrap {
      max-width: 100% !important;
      border-radius: 0;
      height: 100%;
    }
  }
}
</style>
