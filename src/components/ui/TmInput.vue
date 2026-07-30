<template>
  <div class="form-item" :class="{ 'form-item__error': error }">
    <div class="form-item-input">
      <input
        :type="type"
        :class="inputClass"
        class="form-input"
        :placeholder="placeholder"
        :value="modelValue"
        @input="updateValue"
        ref="inputRef"
        :maxlength="maxlength"
        v-maska
        :data-maska="dataMaska"
        :disabled="disabled"
      />
      <span class="text-base form-item__label" :class="labelClass">
        {{ label }}
      </span>
    </div>
    <div class="text-error flex items-center" v-if="error">
      <img src="@/assets/images/alert-circle.svg" alt="" class="mr-1" />
      <span>{{ errorText }}</span>
    </div>
  </div>
</template>
<script setup>
import { vMaska } from "maska";
const props = defineProps({
  itemClass: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text",
  },
  inputClass: String,
  modelValue: "",
  label: String,
  error: Boolean,
  errorText: String,
  placeholder: {
    type: String,
    default: " ",
  },
  ref: String,
  labelClass: String,
  maxlength: {
    type: String,
  },
  dataMaska: {
    type: String,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue"]);

function updateValue(e) {
  emit("update:modelValue", e.target.value);
}
</script>
<style lang="scss" scoped>
.form-item {
  position: relative;
  width: 100%;

  &-input {
    position: relative;
  }

  &__label {
    position: absolute;
    top: 16px;
    left: 20px;
    transition: 0.2s;
    z-index: 1;
    color: #767676;
  }

  input {
    padding-top: 14px;
    /* Заменяем box-shadow на border для лучшей совместимости с iOS */
    border: 1px solid #ffffff1f;
    background-color: transparent;
    z-index: 2;
    position: relative;
    height: 3.5rem;
    width: 100%;
    border-radius: 0.5rem;
    padding-left: 1.25rem;
    padding-right: 1.25rem;
    font-size: 1rem;
    line-height: 1.5rem;
    outline: none;
    color: #767676;
    /* Добавляем специальные стили для iOS */
    -webkit-appearance: none;
    -moz-appearance: none;
    appearance: none;

    &:focus {
      border-color: #ffffff1f;
      border-width: 2px;
      /* Убираем outline для iOS */
      outline: none;
      -webkit-outline: none;
    }
  }

  input {
    &:focus ~ .form-item__label {
      top: 8px;
      font-size: 12px;
      line-height: 16px;
    }

    &:not(:placeholder-shown) ~ .form-item__label {
      top: 8px;
      font-size: 12px;
      line-height: 16px;
    }
  }

  &__error {
    input {
      border-color: #e01f19 !important;
      border-width: 1px !important;
    }
  }
  .input-filter {
    height: 32px;
    font-size: 12px;
    padding: 0 8px;
    border-radius: 4px;
  }
}

/* Специальные стили для iOS устройств */
@media screen and (-webkit-min-device-pixel-ratio: 2) {
  .form-item input {
    /* Усиливаем бордер для устройств с высоким DPI */
    border-width: 1.5px;

    &:focus {
      border-width: 2.5px;
    }
  }

  .form-item__error input {
    border-width: 1.5px !important;
  }
}

/* Специальные стили для iPhone SE и других устройств с высоким DPI */
@media screen and (-webkit-min-device-pixel-ratio: 3) {
  .form-item input {
    /* Еще больше усиливаем бордер для устройств с очень высоким DPI */
    border-width: 2px;

    &:focus {
      border-width: 3px;
    }
  }

  .form-item__error input {
    border-width: 2px !important;
  }
}

/* Специальные стили для Safari на iOS */
@supports (-webkit-touch-callout: none) {
  .form-item input {
    /* Дополнительные стили для Safari на iOS */
    -webkit-tap-highlight-color: transparent;
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    user-select: none;

    /* Усиливаем бордер для Safari */
    border-width: 1.5px;

    &:focus {
      border-width: 2.5px;
    }
  }

  .form-item__error input {
    border-width: 1.5px !important;
  }
}
</style>
