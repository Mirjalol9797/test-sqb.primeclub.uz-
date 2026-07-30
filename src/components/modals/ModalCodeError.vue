<script setup>
import { useI18n, I18nT } from "vue-i18n";
import { computed } from "vue";
import { useCertificatesStore } from "@/stores/certificates";
import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();

function closeModal() {
  settingsStore.isModalCodeError = false;
}

const props = defineProps({
  codeError: {
    type: Object,
    default: () => {},
  },
});
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
      <div class="mt-[-10px] 768:mt-0">
        <div class="font-medium mb-4 text-lg text-center">
          {{ $t("already_taken_advantage_offer_month") }}
        </div>
        <div class="text-gray-600 mb-3 text-center">
          {{ $t("next_opportunity_will_appear") }}:
          <span class="font-medium">{{ codeError?.retry_at }}</span>
        </div>
        <div class="text-center">
          {{ $t("previous_certificates_can_be_viewed") }}
          <router-link to="/certificates" class="text-007bff">{{
            $t("here_link")
          }}</router-link>
        </div>
      </div>
    </template>
  </tm-modal>
</template>
