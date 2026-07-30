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
      class="absolute top-0 left-0 w-10 h-10 flex items-center justify-center z-10"
      @click="$router.back()"
    >
      <img src="/icons/p-offer/back.svg" alt="" class="w-5" />
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
