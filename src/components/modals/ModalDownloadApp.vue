<script setup>
import { useSettingsStore } from "@/stores/settings";
import MDownloadApp from "@/views/offer/modules/MDownloadApp.vue";

const settingsStore = useSettingsStore();

function closeModal() {
  settingsStore.isDownloadAppModal = false;
}
</script>

<template>
  <tm-modal
    width="560"
    :closeBtn="true"
    titleClass="text-center"
    @closeModal="closeModal"
    class="download-app-modal modal-fullscreen"
    classWrap="modal-wrap"
  >
    <template #modal_content>
      <MDownloadApp class="!mb-0" />
    </template>
  </tm-modal>
</template>
