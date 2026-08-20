<template>
  <img
    src="@/assets/images/copy-text.svg"
    :alt="$t('copy_title')"
    :title="$t('copy_title')"
    @click="copyData"
    class="w-5 ml-3 cursor-pointer"
  />
</template>
<script setup>
const emit = defineEmits(["copyData"]);

function copyData(e) {
  emit("copyData", e);
}
</script>
<style lang="scss"></style>
