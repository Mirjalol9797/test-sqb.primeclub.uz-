<template>
  <select name="" id="" @change="updateValue">
    <option value=""></option>
    <option v-for="(option, index) in options" :key="index" :value="index">
      {{ option }}
    </option>
  </select>
</template>
<script setup>
const props = defineProps({
  options: {
    type: Object,
    default: {},
  },
});

const emit = defineEmits(["update:modelValue"]);

function updateValue(e) {
  emit("update:modelValue", e.target.value);
}
</script>
<style lang="scss">
select {
  -webkit-appearance: none;
  position: relative;
  background-image: url(../../assets/images/chevron-down.svg);
  background-position: 97% center;
  background-repeat: no-repeat;
  width: 100%;
  height: 32px;
  box-shadow: 0 0 0 1px #d5d8df;
  padding: 0 24px 0 8px;
  border-radius: 4px;

  &:focus-visible {
    outline: none;
  }
  &:focus {
    box-shadow: 0 0 0 2px #fbc100;
  }
  option:first-child {
    // display: none;
  }
}
</style>
