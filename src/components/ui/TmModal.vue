<template>
  <div
    class="fixed inset-0 flex items-center justify-center z-20 max-w-[640px] mx-auto"
  >
    <div
      class="bg-black pt-8 p-6 rounded-2xl w-full relative z-20"
      :style="{ maxWidth: `${width}px` }"
      :class="classWrap"
    >
      <div>
        <div class="font-medium mb-4 text-xl" :class="titleClass">
          {{ title }}
        </div>
        <button
          @click="closeModal"
          class="absolute top-3 right-3"
          v-if="closeBtn"
        >
          <img src="/icons/modal-close.svg" alt="" class="w-8 h-8" />
        </button>
      </div>
      <div>
        <slot name="modal_content"></slot>
      </div>
    </div>
    <div
      class="fixed inset-0 bg-[rgba(0,0,0,0.5)] z-10"
      @click="closeModal"
    ></div>
  </div>
</template>
<script setup>
import { onMounted, onUnmounted, watch } from "vue";
const props = defineProps({
  classModal: {
    type: String,
    default: "768px",
  },
  classWrap: {
    type: String,
  },
  title: {
    type: String,
  },
  width: {
    type: String,
    default: "960",
  },
  closeBtn: {
    type: Boolean,
    default: true,
  },
  titleClass: {
    type: String,
  },
});

const emit = defineEmits(["closeModal"]);

// Функция для блокировки скролла
function lockScroll() {
  document.body.style.overflow = "hidden";
}

// Функция для разблокировки скролла
function unlockScroll() {
  document.body.style.overflow = "";
}

function closeModal(e) {
  unlockScroll();
  emit("closeModal", e);
}

// Блокируем скролл при монтировании компонента
onMounted(() => {
  lockScroll();
});

// Разблокируем скролл при уничтожении компонента
onUnmounted(() => {
  unlockScroll();
});
</script>
<style lang="scss"></style>
