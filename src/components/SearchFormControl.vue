<script>
/**
 * A search input with pill layout.
 */
export default {
  name: 'SearchFormControl',
  props: {
    /**
     * Input value
     * @model
     */
    value: {
      type: [String, Number]
    },
    /**
     * Optional placeholder text
     */
    placeholder: {
      type: String
    },
    /**
     * Text to use in the submit button
     * @default $t('searchFormControl.submitLabel')
     */
    submitLabel: {
      type: String
    },
    /**
     * Fill the submit button with primary color
     */
    fillSubmit: {
      type: Boolean
    },
    /**
     * Show the text in the submit button (only visible for screen-readers by default)
     */
    showSubmitLabel: {
      type: Boolean
    },
    /**
     * Hide the magnifying glass icon
     */
    noIcon: {
      type: Boolean
    },
    /**
     * Set the autofocus on the search bar on load
     * @default True
     */
    autofocus: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    searchFormClassAttr () {
      return {
        'search-form-control--fill-submit': this.fillSubmit,
        'search-form-control--show-submit-label': this.showSubmitLabel,
        'search-form-control--no-icon': this.noIcon
      }
    }
  }
}
</script>

<template>
  <b-form @submit="$emit('submit', value)">
    <b-input-group size="sm" class="search-form-control" :class="searchFormClassAttr">
      <b-form-input :placeholder="placeholder" class="search-form-control__input" :value="value" @input="$emit('input', $event)" :autofocus="autofocus"></b-form-input>
      <b-input-group-append  class="search-form-control__addon search-form-control__addon--append">
        <b-button variant="light" class="search-form-control__addon__submit" type="submit">
          <fa icon="search" v-if="!noIcon"></fa>
          <span :class="{ 'sr-only': !showSubmitLabel }">
            {{ submitLabel || $t('searchFormControl.submitLabel') }}
          </span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
  </b-form>
</template>

<style lang="scss" scoped>
  .search-form-control {
    position: relative;

    & &__input {
      border-bottom-left-radius: $rounded-pill;
      border-top-left-radius: $rounded-pill;
    }

    &__input:focus {
      border-right: 0;
      box-shadow: none;
    }

    &__input:focus + &__addon &__addon__submit {
      border-color: $input-focus-border-color;
    }

    &__input:focus + &__addon:after {
      box-shadow: $input-focus-box-shadow;
    }

    &__addon {

      &:after {
        border-radius: $rounded-pill;
        bottom: 0;
        box-shadow: 0 0 0 $input-btn-focus-width transparent;
        content: "";
        left: 0;
        pointer-events: none;
        position: absolute;
        right: 0;
        top: 0;
        transition: $input-transition;
        z-index: 0;
      }

      & &__submit:last-of-type {
        background: $input-bg;
        border-bottom-right-radius: $rounded-pill;
        border-color: $input-border-color;
        border-left: 0;
        border-top-right-radius: $rounded-pill;
        transition: $input-transition;
      }
    }

    &--fill-submit &__addon__submit.btn {
      @include gradient-bg($primary);
      border-color: $primary;
      color: color-yiq($primary);
    }
  }
</style>
