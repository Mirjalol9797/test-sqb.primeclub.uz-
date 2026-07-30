import TmButton from "@/components/ui/TmButton.vue";
import TmInput from "@/components/ui/TmInput.vue";
import TmSelect from "@/components/ui/TmSelect.vue";
import TmModal from "@/components/ui/TmModal.vue";
import TmCopyImage from "@/components/ui/TmCopyImage.vue";
import UiMobileModal from "@/components/ui/UiMobileModal.vue";

import TmLoader from "@/components/TmLoader.vue";

import VueDatePicker from "@vuepic/vue-datepicker";
import "@vuepic/vue-datepicker/dist/main.css";

export const registerComponents = (app) => {
  app.component("tm-button", TmButton);
  app.component("tm-input", TmInput);
  app.component("tm-select", TmSelect);
  app.component("tm-modal", TmModal);
  app.component("VueDatePicker", VueDatePicker);
  app.component("tm-loader", TmLoader);
  app.component("tm-copy-img", TmCopyImage);
  app.component("ui-mobile-modal", UiMobileModal);
};
