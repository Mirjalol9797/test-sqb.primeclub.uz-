<script setup>
import { useI18n } from "vue-i18n";

const { t } = useI18n();

const FILTER_OPTIONS = {
  ALL: "0",
  MERCHANTS: "1",
  CATEGORIES: "2",
};

defineProps({
  modelValue: {
    type: String,
    required: true,
  },
});

const emit = defineEmits(["update:modelValue"]);
</script>

<template>
  <div
    role="group"
    class="selector mb-8 bg-[#000] border border-[#ffffff1f] rounded-2xl p-2 text-white"
  >
    <label :class="{ active: modelValue === FILTER_OPTIONS.ALL }">
      <input
        type="radio"
        name="selector"
        :value="FILTER_OPTIONS.ALL"
        :checked="modelValue === FILTER_OPTIONS.ALL"
        @change="emit('update:modelValue', FILTER_OPTIONS.ALL)"
      />
      <span>{{ $t("all") }}</span>
    </label>
    <label :class="{ active: modelValue === FILTER_OPTIONS.MERCHANTS }">
      <input
        type="radio"
        name="selector"
        :value="FILTER_OPTIONS.MERCHANTS"
        @change="emit('update:modelValue', FILTER_OPTIONS.MERCHANTS)"
      />
      <span>{{ $t("establishments") }}</span>
    </label>
    <label :class="{ active: modelValue === FILTER_OPTIONS.CATEGORIES }">
      <input
        type="radio"
        name="selector"
        :value="FILTER_OPTIONS.CATEGORIES"
        @change="emit('update:modelValue', FILTER_OPTIONS.CATEGORIES)"
      />
      <span>{{ $t("categories") }}</span>
    </label>
  </div>
</template>

<style lang="scss" scoped>
.selector {
  border-radius: 0.75rem;
  display: flex;
  flex-direction: row;
  padding: 0.25rem;
  overflow: hidden;

  input {
    position: absolute;
    clip: rect(0, 0, 0, 0);
    pointer-events: none;
  }
  label {
    flex-grow: 1;
    flex-shrink: 1;
    flex-basis: 0;
    background-color: transparent;
    border: 0;
    color: #95919f;
    border-radius: 0.5rem;
    font-size: 0.875rem;
    font-weight: 600;
    line-height: 1rem;
    padding: 0.625rem 0;
    transition: 0.3s;
    text-align: center;

    &.active {
      background-color: #141416;
      color: white;
    }
  }
}
</style>
