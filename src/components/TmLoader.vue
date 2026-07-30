<template>
  <div class="loading-site-full">
    <div class="half-circle-spinner">
      <div class="circle circle-1"></div>
      <div class="circle circle-2"></div>
    </div>
  </div>
</template>

<script setup></script>

<style lang="scss">
// стили для лоадер
.loading-site-full {
  position: fixed;
  top: 0;
  left: 0;
  background: rgba(255, 255, 255, 0.5);
  width: 100%;
  height: 100vh;
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.half-circle-spinner,
.half-circle-spinner * {
  box-sizing: border-box;
}

.half-circle-spinner {
  width: 50px;
  height: 50px;
  border-radius: 100%;
  position: relative;
}

.half-circle-spinner .circle {
  content: "";
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 100%;
  border: 8px solid transparent;
}

.half-circle-spinner .circle.circle-1 {
  border-top-color: #333;
  animation: half-circle-spinner-animation 1300ms infinite;
}

.half-circle-spinner .circle.circle-2 {
  border-bottom-color: #fbc100;
  animation: half-circle-spinner-animation 1300ms infinite;
}

@keyframes half-circle-spinner-animation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
