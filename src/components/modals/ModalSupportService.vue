<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { setLocale } from "@/plugins/i18n";

const settingsStore = useSettingsStore();
const { locale } = useI18n();
const route = useRoute();

const currentLocale = computed(() => locale.value);

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
          <a
            href="https://t.me/primeuz_bot?start=support"
            target="_blank"
            class="site-btn-grey"
          >
            {{ $t("contact_in_telegram") }}
          </a>
        </div>
        <div class="flex justify-between flex-col items-center">
          <div class="mb-1 text-666">{{ $t("or_call_us") }}</div>
          <a
            href="tel:+998555170909"
            class="text-00b08c font-semibold text-lg hover:underline"
            >+998(55) 517-09-09</a
          >
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
