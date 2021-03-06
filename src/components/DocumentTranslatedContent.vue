<template>
  <div class="document-translated-content" :class="{ 'document-translated-content--original': showOriginal }">
    <template v-if="document.hasTranslationsIn(language)">
      <div class="document-translated-content__translation m-3">
        <div class="document-translated-content__translation__header px-3 py-2">
          <fa icon="globe" class="mr-2" />
          <abbr :title="$t(`filter.lang.${document.source.language}`)" v-if="document.translationIn(language).source_language === document.source.language">
            {{ $t('documentTranslatedContent.detected') }}
          </abbr>
          <span v-else>
            {{ $t(`filter.lang.${document.translationIn(language).source_language}`) }}
          </span>
          <fa icon="angle-right" class="mx-2" />
          <strong>{{ $t(`filter.lang.${language}`) }}</strong>
          <button class="btn btn-sm btn-link ml-3" @click="toggleOriginalContent">
            {{ $t(showOriginal ? 'documentTranslatedContent.viewTranslated' : 'documentTranslatedContent.viewOriginal') }}
          </button>
        </div>
        <document-content ref="content" class="document-translated-content__translation__header__content" :document="document" :translated-content="translatedContent" />
      </div>
    </template>
    <template v-else>
      <document-content ref="content" class="document-translated-content__original" :document="document" />
    </template>
  </div>
</template>

<script>
import DocumentContent from '@/components/DocumentContent'

/**
 * Displayed document text content and it's translated alternatives.
 */
export default {
  name: 'DocumentTranslatedContent',
  props: {
    /**
     * The selected document.
     */
    document: {
      type: Object
    }
  },
  components: {
    DocumentContent
  },
  data () {
    return {
      language: 'ENGLISH',
      showOriginal: false
    }
  },
  methods: {
    toggleOriginalContent () {
      this.showOriginal = !this.showOriginal
    }
  },
  computed: {
    translatedContent () {
      if (!this.showOriginal) {
        return this.document.translatedContentIn(this.language)
      }
      return null
    }
  }
}
</script>

<style lang="scss">
  .document-translated-content {
    &__translation {
      box-shadow: 0 0 0 3px $translation-bg inset;

      .document-translated-content--original & {
        box-shadow: none;

        &__header {
          background: transparent;
        }
      }

      &__header {
        background: $translation-bg;
        color: rgba(darken($translation-bg, 70), 0.7);
      }
    }
  }
</style>
