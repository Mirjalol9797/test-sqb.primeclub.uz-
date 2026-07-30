<script setup></script>
<template>
  <div
    class="bg-[#141416] w-full rounded-2xl relative border-2 border-[#ffffff1f] mb-5 mt-10"
  >
    <div class="app-promo-block">
      <div class="app-promo-text">
        <span class="app-promo-badge">{{ $t("only_in_the_app") }}</span>
        <div class="app-promo-title">{{ $t("download_the_app") }}</div>
        <div class="app-promo-subtitle">
          {{ $t("get_your_certificate_in_the_app") }}
        </div>
      </div>

      <div class="qr-code">
        <img src="/icons/p-offer/qvrdj.png" alt="QR Code" />
      </div>

      <div class="store-buttons">
        <a href="https://ads.bank.uz/qvrdj" class="store-btn" target="_blank">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.5,12.92 20.16,13.19L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"
            ></path>
          </svg>
          Google Play
        </a>
        <a href="https://ads.bank.uz/qvrdj" class="store-btn" target="_blank">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z"
            ></path>
          </svg>
          App Store
        </a>
      </div>
    </div>
  </div>
</template>
<style lang="scss" scoped>
.app-promo-block {
  background: #141416;
  border-radius: 16px;
  padding: 16px;
  color: #fff;
}

.app-promo-badge {
  display: inline-block;
  background: #ff6900;
  color: white;
  font-size: 11px;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 12px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    display: none;
  }
}

.app-promo-text {
  text-align: center;
}

.app-promo-title {
  font-size: 20px;
  font-weight: 700;
  margin-bottom: 6px;
}

.app-promo-subtitle {
  font-size: 14px;
  margin-bottom: 20px;
}

.qr-code {
  width: 200px;
  height: 200px;
  background: #fff;
  border-radius: 12px;
  margin: 0 auto 20px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    display: none;
  }
}

.qr-code img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.store-buttons {
  display: flex;
  gap: 12px;
}

.store-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 16px;
  background: #1a1a1a;
  color: #fff;
  border-radius: 10px;
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s;
}

.store-btn:hover {
  background: #333;
  transform: translateY(-2px);
}

.store-btn svg {
  width: 20px;
  height: 20px;
  fill: #fff;
}

@media (max-width: 480px) {
  .store-buttons {
    flex-direction: column;
  }
}
</style>
