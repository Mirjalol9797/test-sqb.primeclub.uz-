<script setup>
import { computed } from "vue";
import { useSettingsStore } from "@/stores/settings";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";
import { setLocale } from "@/plugins/i18n";

const settingsStore = useSettingsStore();
const { locale } = useI18n();
const route = useRoute();

const currentLocale = computed(() => locale.value);

function closeModal() {
  settingsStore.isModalChangeLanguage = false;
}

function switchLocale(target) {
  closeModal();
  const full = route.fullPath;
  let next = full;

  if (target === "uz") {
    next = full.startsWith("/uz")
      ? full
      : "/uz" + (full.startsWith("/") ? full : "/" + full);
  } else {
    next = full.replace(/^\/uz(?=\/|$)/, "") || "/";
  }

  console.log(`🔄 New URL: ${next}`);

  // Сохраняем язык в localStorage
  setLocale(target);

  let newUrl = "/offer";
  if (target === "uz") {
    newUrl = "/uz/offer";
  }

  // Перенаправляем на offer с правильным языком
  window.location.href = newUrl;
}
</script>

<template>
  <tm-modal
    width="320"
    :closeBtn="false"
    titleClass="text-center !mb-6"
    @closeModal="closeModal"
    class="change-language-modal"
    classWrap="modal-wrap"
    :title="$t('select_application_language')"
  >
    <template #modal_content>
      <div>
        <!-- Кнопка для переключения на русский -->
        <button
          v-if="currentLocale === 'uz'"
          @click="switchLocale('ru')"
          class="site-btn-grey w-full"
        >
          Русский
        </button>

        <!-- Кнопка для переключения на узбекский -->
        <button
          v-if="currentLocale === 'ru'"
          @click="switchLocale('uz')"
          class="site-btn-grey w-full"
        >
          O'zbek
        </button>
        <div class="flex justify-center mt-4">
          <button @click="closeModal" class="text-[#666] text-center underline">
            {{ $t("cancel2") }}
          </button>
        </div>
      </div>
    </template>
  </tm-modal>
</template>

<style lang="scss">
.change-language-modal {
  .modal-wrap {
    padding: 24px 32px !important;
  }
}
</style>
