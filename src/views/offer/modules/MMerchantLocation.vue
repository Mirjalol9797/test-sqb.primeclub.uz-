<script setup>
import { shallowRef, ref, watch } from "vue";
import {
  YandexMap,
  YandexMapDefaultSchemeLayer,
  YandexMapDefaultFeaturesLayer,
  YandexMapDefaultMarker,
  YandexMapMarker,
  YandexMapControls,
  YandexMapZoomControl,
} from "vue-yandex-maps";

const map = shallowRef(null);
const currentZoom = ref(0);

const props = defineProps({
  locations: {
    type: Object,
    default: {},
  },
  title: {
    type: String,
    default: "",
  },
});

const handleZoomChange = (newZoom) => {
  console.log("Zoom changed:", newZoom);
  currentZoom.value = newZoom;
};

watch(map, (newMap) => {
  if (newMap) {
    const intervalId = setInterval(() => {
      currentZoom.value = newMap.zoom;
    }, 1000);

    // Очистка интервала при удалении map
    watch(map, (val) => {
      if (!val) {
        clearInterval(intervalId);
      }
    });
  }
});
</script>

<template>
  <div
    v-if="
      (locations?.longitude && locations?.latitude) ||
      locations?.branches.length > 0
    "
  >
    <div class="text-sm mb-2.5 font-semibold">
      {{ title || $t("location") }}
    </div>
    <yandex-map
      v-model="map"
      :settings="{
        location: {
          center: [
            locations?.longitude || 69.279438,
            locations?.latitude || 41.311563,
          ],
          zoom: 12,
        },
      }"
      width="100%"
      height="400px"
    >
      <yandex-map-default-scheme-layer />
      <yandex-map-default-features-layer />
      <!-- Основной маркер -->
      <yandex-map-marker
        v-if="locations?.longitude && locations?.latitude"
        :settings="{
          coordinates: [locations.longitude, locations.latitude],
        }"
      >
        <div class="w-[60px] h-[60px] block relative top-[-57px] left-[-29px]">
          <img
            src="@/assets/images/location.svg"
            class="w-full h-full object-contain"
          />
          <img
            :src="`https://main.primeclub.uz/uploads/${locations.logo}`"
            class="w-11 h-11 top-0 left-1/2 transform -translate-x-1/2 absolute rounded-full bg-white object-contain"
          />
        </div>
      </yandex-map-marker>

      <!-- Маркеры филиалов -->
      <yandex-map-marker
        v-for="branch in locations?.branches"
        :key="branch.id"
        :settings="{
          coordinates: [branch.longitude, branch.latitude],
        }"
      >
        <div class="w-[60px] h-[60px] block relative">
          <div
            class="relative top-[-57px] left-[-29px]"
            v-if="currentZoom < 15.5"
          >
            <img
              src="@/assets/images/location.svg"
              class="w-full h-full object-contain"
            />
            <img
              :src="`https://main.primeclub.uz/uploads/${locations.logo}`"
              class="w-11 h-11 top-0 left-1/2 transform -translate-x-1/2 absolute rounded-full bg-white object-contain"
            />
          </div>
          <div
            v-if="currentZoom > 15.5"
            class="text-sm absolute -top-8 left-1/2 transform -translate-x-1/2 z-50 bg-black text-white px-2 py-1 rounded whitespace-nowrap"
          >
            {{ branch.address }}
          </div>
        </div>
      </yandex-map-marker>
      <!-- <yandex-map-default-marker
        v-for="branch in locations?.branches"
        :key="branch.id"
        :settings="{
          coordinates: [branch.longitude, branch.latitude],
        }"
      >
      </yandex-map-default-marker> -->

      <yandex-map-controls :settings="{ position: 'right' }">
        <yandex-map-zoom-control />
      </yandex-map-controls>
    </yandex-map>
  </div>
</template>
