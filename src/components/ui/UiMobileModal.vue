<template>
  <div v-show="visible" class="fixed inset-0 z-50">
    <!-- затемнение -->
    <div class="absolute inset-0 bg-black/50" @click="handleClose" />

    <!-- модалка -->
    <div
      class="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl p-4 pt-8 w-full mx-auto"
      :class="[isClosing ? 'animate-slideDown' : 'animate-slideUp', classWrap]"
      :style="{ height: '90%' }"
    >
      <button
        v-if="closeBtn"
        class="absolute top-4 right-4 text-2xl"
        @click="handleClose"
      >
        <img src="@/assets/images/modal-close.svg" alt="" />
      </button>

      <div class="text-xl font-bold mb-4" :class="titleClass">
        {{ title }}
      </div>

      <div class="overflow-y-auto">
        <slot name="modal_content" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted } from "vue";

const props = defineProps({
  modelValue: Boolean,
  title: String,
  width: {
    type: [String, Number],
    default: 960,
  },
  closeBtn: {
    type: Boolean,
    default: true,
  },
  classWrap: String,
  titleClass: String,
});

const emit = defineEmits(["update:modelValue"]);

const isClosing = ref(false);
const visible = ref(true);

// Функция для блокировки скролла
function lockScroll() {
  document.body.style.overflow = "hidden";
}

// Функция для разблокировки скролла
function unlockScroll() {
  document.body.style.overflow = "";
}

function handleClose() {
  isClosing.value = true;
  setTimeout(() => {
    emit("update:modelValue", false);
    isClosing.value = false;
    visible.value = false;
  }, 350);
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      visible.value = true;
      isClosing.value = false;
      // Блокируем скролл при открытии
      lockScroll();
    } else {
      // Разблокируем скролл при закрытии
      unlockScroll();
    }
  },
  { immediate: true }
);

// Убедимся, что скролл разблокирован при уничтожении компонента
onUnmounted(() => {
  unlockScroll();
});
</script>

<style scoped>
@keyframes slideUp {
  0% {
    transform: translateY(100%);
    opacity: 0;
  }
  100% {
    transform: translateY(0%);
    opacity: 1;
  }
}

@keyframes slideDown {
  0% {
    transform: translateY(0%);
    opacity: 1;
  }
  100% {
    transform: translateY(100%);
    opacity: 0;
  }
}

.animate-slideUp {
  animation: slideUp 0.35s ease-out forwards;
}

.animate-slideDown {
  animation: slideDown 0.35s ease-in forwards;
}
</style>
