<script setup>
import { useRouter } from "vue-router";
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { localePath } from "@/plugins/i18n";
import { useLoginStore } from "@/stores/login";
import { useSettingsStore } from "@/stores/settings";
import ModalChangeLanguage from "@/components/modals/ModalChangeLanguage.vue";
import ModalSupportService from "@/components/modals/ModalSupportService.vue";

const settingsStore = useSettingsStore();
const { t } = useI18n();
const loginStore = useLoginStore();
const router = useRouter();

function logOut() {
  loginStore.logout();
  localStorage.removeItem("telegramAuthCode");
  router.push(localePath("/offer"));
}
</script>

<template>
  <div class="page-profile h-[90vh] pb-[100px] pt-5 py-5 relative">
    <div class="site-container">
      <div class="site-title">{{ $t("my_profile") }}</div>
      <div class="flex flex-col gap-0">
        <div class="flex flex-col w-full mb-4">
          <router-link
            :to="localePath('/profile/detail-info')"
            class="flex items-center justify-between gap-3 p-2.5 border-[#ffffff1f] bg-transparent border-0 border-b px-1 rounded-none py-4 mb-0"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
              <span>{{ $t("personal_info") }}</span>
            </div>
            <div class="block">
              <svg
                class="w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </router-link>
          <router-link
            :to="localePath('/favorites')"
            class="flex items-center justify-between gap-3 p-2.5 border-[#ffffff1f] bg-transparent border-0 border-b px-1 rounded-none py-4 mb-0"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                ></path>
              </svg>
              <span>{{ $t("favorites") }}</span>
            </div>
            <div class="block">
              <svg
                class="w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </router-link>
          <div
            @click="settingsStore.isModalSupportService = true"
            class="flex items-center justify-between cursor-pointer gap-3 p-2.5 border-[#ffffff1f] bg-transparent border-0 border-b px-1 rounded-none py-4 mb-0"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                ></path>
              </svg>
              <span>{{ $t("support_service") }}</span>
            </div>
            <div class="block">
              <svg
                class="w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </div>
          <div
            @click="settingsStore.isModalChangeLanguage = true"
            class="border-[#ffffff1f] flex items-center justify-between gap-3 p-2.5 border-0 border-b px-1 rounded-none py-4 mb-0"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                ></path>
              </svg>
              <span>{{ $t("language") }}</span>
            </div>
            <div class="">
              <svg
                class="w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </div>
        </div>
        <div class="hidden mb-2 font-medium text-base">
          {{ $t("legal_info") }}
        </div>
        <div class="flex flex-col w-full">
          <a
            href="https://primeclub.uz/terms"
            target="_blank"
            class="flex items-center justify-between gap-3 p-2.5 border-[#ffffff1f] bg-transparent border-0 border-b px-1 rounded-none py-4 mb-0"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                ></path>
              </svg>
              <span>{{ $t("privacy_policy_link") }}</span>
            </div>
            <div class="block">
              <svg
                class="w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </a>
          <a
            href="https://primeclub.uz/data-processing"
            target="_blank"
            class="flex items-center justify-between gap-3 p-2.5 border-[#ffffff1f] bg-transparent border-0 border-b px-1 rounded-none py-4 mb-0"
          >
            <div class="flex items-center gap-3">
              <svg
                class="w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                ></path>
              </svg>
              <span>{{ $t("user_agreement_link") }}</span>
            </div>
            <div class="block">
              <svg
                class="w-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            </div>
          </a>
        </div>
        <div
          class="flex justify-center fixed bottom-28 left-1/2 -translate-x-1/2 max-w-[640px] mx-auto w-full"
        >
          <button
            @click="logOut"
            class="block button-exit text-center text-base text-black font-medium bg-white border border-black rounded-3xl py-3 px-6"
          >
            <span>{{ $t("exit") }}</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <ModalChangeLanguage v-if="settingsStore.isModalChangeLanguage" />
  <ModalSupportService v-if="settingsStore.isModalSupportService" />
</template>

<style lang="scss" scoped>
.page-profile {
  .button-exit {
    width: calc(100% - 80px);
  }
}
</style>
