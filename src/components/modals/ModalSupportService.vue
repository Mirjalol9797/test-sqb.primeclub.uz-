<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { setLocale } from "@/plugins/i18n";
import { callPhone, telHref } from "@/utils/phoneCall";

const settingsStore = useSettingsStore();
const { locale } = useI18n();
const route = useRoute();

const currentLocale = computed(() => locale.value);

const SUPPORT_PHONE = "+998555170909";
const supportPhoneLink = telHref(SUPPORT_PHONE);

// Прямой переход на tel: в Android WebView уводит на ERR_UNKNOWN_URL_SCHEME
// и убивает приложение, поэтому переход всегда перехватываем.
async function callSupport(e) {
  e.preventDefault();
  await callPhone(SUPPORT_PHONE);
}

function closeModal() {
  settingsStore.isModalSupportService = false;
}
</script>

<template>
  <tm-modal
    width="580"
    :closeBtn="false"
    titleClass="text-center"
    @closeModal="closeModal"
    class="support-service-modal"
    classWrap="modal-wrap"
    :title="$t('support_service')"
  >
    <template #modal_content>
      <div class="mt-4 space-y-3">
        <div class="flex justify-center mt-6 mb-6 768:mb-3 768:mt-3">
          <a href="https://t.me/help_primeclub" class="site-btn-grey">
            {{ $t("contact_in_telegram") }}
          </a>
        </div>

        <div class="flex justify-center mt-4">
          <button @click="closeModal" class="text-[#666] text-center underline">
            {{ $t("back") }}
          </button>
        </div>
      </div>
    </template>
  </tm-modal>
</template>

<style lang="scss">
.support-service-modal {
  .modal-wrap {
    @media (max-width: 768px) {
      max-width: 320px !important;
    }
  }
}
</style>
