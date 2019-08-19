<template>
  <router-link :to="{ name: 'document', params }" class="search-results-list-link d-flex align-self-stretch flex-nowrap">
    <document-thumbnail :document="document" class="search-results-list-link__thumbnail" crop lazy />
    <div class="search-results-list-link__wrapper">
      <h5 class="search-results-list-link__basename">
        <document-sliced-name :document="document" />
      </h5>
      <span class="search-results-list-link__location small">
        <fa icon="folder" class="mr-1" />
        {{ location }}
      </span>
      <div class="search-results-list-link__fragments small" v-if="document.highlight" v-html="document.highlight.content.join(' [...] ')"></div>
    </div>
  </router-link>
</template>

<script>
import DocumentSlicedName from '@/components/DocumentSlicedName'
import DocumentThumbnail from '@/components/DocumentThumbnail'
import ner from '@/mixins/ner'

export default {
  name: 'SearchResultsLink',
  mixins: [ner],
  props: {
    document: {
      type: Object
    }
  },
  components: {
    DocumentSlicedName,
    DocumentThumbnail
  },
  computed: {
    folder () {
      // Extract location parts
      let parts = this.document.get('_source.path', '').split('/')
      // Remove the file name
      parts.splice(-1, 1)
      // And return the new path
      return parts.join('/') + '/'
    },
    location () {
      return '.' + this.folder.split(this.$config.get('dataDir', process.env.VUE_APP_DATA_PREFIX)).pop()
    },
    folderParams () {
      return { q: `path:${this.folder}*` }
    },
    params () {
      return this.document.routerParams
    }
  },
  filters: {
    truncate (text = '', length = 30, clamp = '...') {
      if (text.length <= length) return text

      let truncated = text.slice(0, length - clamp.length)
      let last = truncated.length - 1

      while (last > 0 && truncated[last] !== ' ' && truncated[last] !== clamp[0]) {
        last -= 1
      }
      // Fix for case when text dont have any `space`
      last = last || length - clamp.length
      truncated = truncated.slice(0, last)
      return truncated + clamp
    }
  }
}
</script>

<style lang="scss">
  .search-results-list-link {
    display: block;

    &:visited:not(.router-link-active) &__basename {
      color: mix(#609, white, 50%);
    }

    &.router-link-active {
      position: relative;

      &:before {
        content: "";
        border-left: 2px solid $secondary;
        position: absolute;
        top: 0;
        left: 0;
        bottom: 0;
        box-shadow: 0 0 10px 0 $secondary;
      }
    }

    &__thumbnail {
      margin: $spacer;
      margin-right: 0;
    }

    &__wrapper {
      margin: $spacer;
      min-width: 0;
      flex-grow: 1;
    }

    &__basename {
      font-size: 1rem;
      margin: 0;
      word-break: break-all;
    }

    &__location {
      display: block;
      white-space: nowrap;
      width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      color: $gray-500;
    }

    &__fragments {
      font-size: 0.9em;
      color: $text-muted;
    }

  }
</style>