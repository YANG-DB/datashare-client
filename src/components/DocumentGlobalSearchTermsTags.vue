<script>
import { mapGetters } from 'vuex'
import utils from '@/mixins/utils'
import store from '@/store'

export default {
  name: 'DocumentGlobalSearchTermsTags',
  store,
  mixins: [ utils ],
  props: {
    document: Object
  },
  computed: {
    ...mapGetters('search', {
      globalSearchTermsInDocument: 'retrieveContentQueryTermsInDocument'
    }),
    terms () {
      return this.globalSearchTermsInDocument(this.document)
    }
  },
  methods: {
    getTermIndexClass (index, term) {
      return {
        'document-global-search-terms-tags__item--negation': term.negation,
        [`document-global-search-terms-tags__item--index-${index}`]: true
      }
    }
  }
}
</script>

<template>
  <div class="document-global-search-terms-tags d-flex align-items-center" v-if="document && terms.length" v-once>
    <div class="mr-2">
      {{ $t('document.researched_terms') }}
    </div>
    <ul class="list-inline m-0">
      <li v-for="(term, index) in terms" :key="term.label" class="list-inline-item">
        <mark class="document-global-search-terms-tags__item" :style="getTermIndexBorderColor(index)" :class="getTermIndexClass(index, term)">
          <span class="document-global-search-terms-tags__item__label">
            {{ term.label }}
          </span>
          <span class="document-global-search-terms-tags__item__count py-0" :style="getTermIndexBackgroundColor(index)">
            {{ term.length }}
          </span>
        </mark>
      </li>
    </ul>
  </div>
</template>

<style lang="scss">
  .document-global-search-terms-tags {

    &__item {
      border-bottom: 3px solid transparent;

      & &__count {
        position: relative;
        top: -0.1rem;
        padding: 0;
        display: inline-block;
        height: 1.2rem;
        line-height: 1.2rem;
        font-size: 0.8rem;
        font-weight: bold;
        padding: 0 0.2rem;
        min-width: 1.2rem;
        border-radius: 0.3rem;
        text-align: center;
      }

      &--negation {
        text-decoration: line-through;
      }
    }
  }
</style>