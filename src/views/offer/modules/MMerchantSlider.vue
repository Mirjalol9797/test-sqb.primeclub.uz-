<script setup>
import { Swiper, SwiperSlide } from "swiper/vue";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";

const props = defineProps({
  images: {
    type: Object,
    default: {},
  },
});

const emit = defineEmits(["openDetailImages"]);

function openDetailImages(e) {
  emit("openDetailImages", e);
}
</script>

<template>
  <div class="p-4 bg-white rounded-2xl mb-4 border-2 border-ffdf8f">
    <Swiper
      :modules="[Navigation, Pagination]"
      :slides-per-view="1"
      :space-between="12"
      :loop="true"
      :autoplay="{ delay: 3000 }"
      :pagination="{ clickable: true }"
      :navigation="true"
      class="rounded-2xl swiper-offer-detail"
    >
      <SwiperSlide
        v-for="(images, index) in images?.images"
        :key="index"
        @click="openDetailImages"
      >
        <div class="h-[380px] w-full 768:h-[240px] 480:!h-[160px]">
          <img
            :src="`https://main.primeclub.uz/uploads/${images}`"
            alt=""
            class="w-full h-full object-cover rounded-2xl"
          />
        </div>
      </SwiperSlide>
    </Swiper>
  </div>
</template>

<style lang="scss">
.swiper-offer-detail {
  .swiper-button-prev,
  .swiper-button-next {
    width: 40px;
    height: 40px;
    background-color: #fff;
    border-radius: 100%;
    background-image: url("data:image/svg+xml,%0A%3Csvg width='9' height='16' viewBox='0 0 9 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M7.85376 15.5938C7.71515 15.5941 7.57783 15.567 7.44972 15.5141C7.3216 15.4612 7.20521 15.3835 7.10724 15.2854L0.833185 9.00973C0.635477 8.81192 0.524414 8.54369 0.524414 8.26402C0.524414 7.98434 0.635477 7.71611 0.833185 7.5183L7.08289 1.26859C7.1792 1.16412 7.29562 1.08019 7.42516 1.02182C7.55471 0.963454 7.69471 0.93186 7.83677 0.928935C7.97883 0.926009 8.12001 0.951813 8.25185 1.0048C8.38369 1.05778 8.50346 1.13685 8.60399 1.23727C8.70451 1.33769 8.78372 1.45738 8.83684 1.58916C8.88997 1.72094 8.91593 1.86209 8.91316 2.00415C8.91039 2.14621 8.87895 2.28625 8.82072 2.41586C8.7625 2.54547 8.67868 2.66198 8.57432 2.7584L3.07114 8.26321L8.60029 13.794C8.74806 13.9415 8.84873 14.1296 8.88953 14.3344C8.93034 14.5392 8.90945 14.7514 8.8295 14.9444C8.74956 15.1373 8.61417 15.3021 8.44046 15.418C8.26676 15.5339 8.06258 15.5956 7.85376 15.5954V15.5938Z' fill='%23333333'/%3E%3C/svg%3E%0A");
    background-repeat: no-repeat;
    background-position: center;
    &:after {
      content: "";
    }
  }
  .swiper-button-next {
    background-image: url("data:image/svg+xml,%0A%3Csvg width='9' height='16' viewBox='0 0 9 16' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1.14526 15.5938C1.28388 15.5941 1.42119 15.567 1.54931 15.5141C1.67742 15.4612 1.79381 15.3835 1.89179 15.2854L8.16584 9.00973C8.36355 8.81192 8.47461 8.54369 8.47461 8.26402C8.47461 7.98434 8.36355 7.71611 8.16584 7.5183L1.91613 1.26859C1.81982 1.16412 1.7034 1.08019 1.57386 1.02182C1.44431 0.963454 1.30431 0.93186 1.16225 0.928935C1.0202 0.926009 0.879014 0.951813 0.747175 1.0048C0.615336 1.05778 0.495561 1.13685 0.395035 1.23727C0.29451 1.33769 0.215307 1.45738 0.16218 1.58916C0.109052 1.72094 0.0830936 1.86209 0.0858641 2.00415C0.0886354 2.14621 0.120077 2.28625 0.178303 2.41586C0.236528 2.54547 0.320339 2.66198 0.424704 2.7584L5.92789 8.26321L0.398737 13.794C0.250961 13.9415 0.150296 14.1296 0.109491 14.3344C0.0686855 14.5392 0.0895777 14.7514 0.16952 14.9444C0.249463 15.1373 0.384858 15.3021 0.558558 15.418C0.732259 15.5339 0.936448 15.5956 1.14526 15.5954V15.5938Z' fill='%23333333'/%3E%3C/svg%3E%0A");
  }

  .swiper-pagination {
    bottom: 10px;
    .swiper-pagination-bullet {
      background: #d9d9d9;
    }
    .swiper-pagination-bullet-active {
      background: #ffd531;
    }
  }
}
</style>
