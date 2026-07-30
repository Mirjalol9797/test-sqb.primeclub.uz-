<script setup>
import { useSettingsStore } from "@/stores/settings";

const settingsStore = useSettingsStore();
const props = defineProps({
  branches: {
    type: Array,
    default: () => [],
  },
  autoOpenCreateCertificate: {
    type: Boolean,
    default: true,
  },
});
const emit = defineEmits(["closeModal", "confirmSelection"]);

function closeModal() {
  emit("closeModal");
}

function selectBranch(branch) {
  emit("confirmSelection", branch.id);
  closeModal();
  if (props.autoOpenCreateCertificate) {
    settingsStore.isCreateCertificate = true;
  }
}
</script>

<template>
  <tm-modal
    :title="$t('choose_branch')"
    width="768"
    :closeBtn="true"
    titleClass="text-center"
    @closeModal="closeModal"
    class="create-certificate-modal"
    classWrap="modal-wrap"
  >
    <template #modal_content>
      <div class="max-h-[320px] overflow-y-auto text-white">
        <div
          v-for="branch in props.branches"
          :key="branch.id"
          @click="selectBranch(branch)"
          class="py-3 hover:bg-gray-100 cursor-pointer border-b border-[#ffffff1f] last:border-b-0"
        >
          <div class="text-sm font-semibold">{{ branch.name }}</div>
          <div class="text-xs">{{ branch.address }}</div>
        </div>
        <div v-if="props.branches.length === 0" class="px-4 py-3 text-sm">
          Ничего не найдено
        </div>
      </div>
    </template>
  </tm-modal>
</template>
<style lang="scss">
@media (max-width: 768px) {
  .create-certificate-modal {
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
