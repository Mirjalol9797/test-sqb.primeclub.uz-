<template>
  <img
    src="@/assets/images/copy-text.svg"
    alt="Скопировать"
    title="Скопировать"
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
