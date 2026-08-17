<script setup>
import { computed, ref } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";

const props = defineProps({
  merchant: {
    type: Object,
    default: () => ({}),
  },
  merchantOffer: {
    type: Object,
    default: () => ({}),
  },
});

const currentSlide = ref(1);
const totalSlides = computed(() => props.merchant?.images?.length || 0);

function handleSlideChange(swiper) {
  currentSlide.value = (swiper?.realIndex || 0) + 1;
}
</script>

<template>
  <div
    v-if="merchant?.images?.length > 0"
    class="mx-[-10px] relative block mb-4"
  >
    <Swiper
      :slides-per-view="1"
      :space-between="0"
      :loop="merchant?.images?.length > 1"
      class="h-[340px] mobile-image"
      @slideChange="handleSlideChange"
    >
      <SwiperSlide v-for="(image, index) in merchant?.images" :key="index">
        <img
          :src="`https://main.primeclub.uz/uploads/${image}`"
          alt=""
          class="h-full w-full object-cover"
        />
      </SwiperSlide>
    </Swiper>
    <button
      class="absolute top-3 left-3 z-20 p-2 text-white bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full transition-all flex items-center justify-center"
      @click="$router.back()"
      aria-label="Back"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="w-5 h-5 text-white"
      >
        <path d="M19 12H5"></path>
        <path d="M12 19l-7-7 7-7"></path>
      </svg>
    </button>
    <div
      class="absolute w-full bottom-5 left-0 flex items-center justify-between px-4 text-sm 480:text-xs z-10"
      ref="searchRef"
    >
      <div class="flex items-center gap-2">
        <div
          class="bg-black px-2 py-1 rounded-full"
          v-for="(item, index) in merchantOffer"
          :key="index"
        >
          {{ item?.name }}
        </div>
      </div>
      <div class="text-white font-medium">
        {{ currentSlide }}/{{ totalSlides }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mobile-image {
  &:after {
    content: "";
    position: absolute;
    inset: 0;
    background-color: rgba(0, 0, 0, 0.5);
  }
}
</style>
