<template>
  <button
    class="site-btn"
    :class="btnClass"
    @click="clickBtn"
    :style="{ backgroundColor: `${bgColor}` }"
  >
    {{ title }}
  </button>
</template>
<script setup>
const props = defineProps({
  title: String,
  btnClass: String,
  bgColor: {
    type: String,
    default: "#ffd531",
  },
});
</script>
<style lang="scss">
.site-btn {
  border-radius: 12px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  max-width: 220px;
  font-weight: 500;
  line-height: 20px; /* 125% */
  letter-spacing: 0.5px;
  color: #111d28;
  font-size: 14px;
  padding: 0 12px;
  background-color: #ffd531;
  text-align: center;
  cursor: pointer;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    max-width: 100%;
  }
}
</style>
