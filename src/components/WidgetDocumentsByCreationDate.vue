<template>
  <div class="widget">
    <div class="widget__header d-md-flex align-items-center" v-if="widget.title" :class="{ 'card-header': widget.card }">
      <h4 v-html="widget.title" class="m-0 flex-grow-1"></h4>
      <div class="widget__header__selectors d-flex align-items-center">
        <slot name="selector" :selectedPath="selectedPath" :setSelectedPath="setSelectedPath"></slot>
        <div class="btn-group">
          <span v-for="(value, interval) in intervals" :key="interval" class="btn btn-link border py-1 px-2" :class="{ 'active': selectedInterval === interval }">
            <span class="widget__header__selectors__selector" @click="selectInterval(interval)">
              {{ $t('widget.creationDate.intervals.' + interval) }}
            </span>
          </span>
        </div>
      </div>
    </div>
    <div class="widget__content" :class="{ 'card-body': widget.card }">
      <div class="widget__content__chart align-items-center" v-if="data.length > 0">
        <v-wait :for="loader">
          <div class="widget__content__chart__spinner" slot="waiting">
            <fa icon="circle-notch" spin size="2x"></fa>
          </div>
          <svg :height="height" width="100%" shape-rendering="crispEdges">
            <g :style="{ transform: `translate(${margin.left}px, ${margin.top}px)` }">
              <g class="widget__content__chart__axis widget__content__chart__axis--x" :style="{ transform: `translate(0px, ${this.innerHeight}px)` }"></g>
              <g class="widget__content__chart__axis widget__content__chart__axis--y"></g>
              <g class="widget__content__chart__bars">
                <g class="widget__content__chart__bars__item" v-for="(bar, index) in bars" :key="index" :transform="`translate(${bar.x}, ${bar.y})`">
                  <rect class="widget__content__chart__bars__item__bar" @mouseover="shownTooltip = index" @mouseleave="shownTooltip = -1" :height="bar.height" :width="bar.width"></rect>
                </g>
                <g class="widget__content__chart__tooltips">
                  <foreignObject :x="bar.flipX ? -200 : bar.width" :y="bar.flipY ? 0 : -100" width="200" height="100" class="widget__content__chart__tooltips__item" :class="tooltipClasses(index, bar)" v-for="(bar, index) in bars" :key="index" :transform="`translate(${bar.x}, ${bar.y})`">
                    <div class="widget__content__chart__tooltips__item__wrapper" xmlns="http://www.w3.org/1999/xhtml">
                      <span>
                        <h6 class="mb-0">
                          {{ intervalFormatFn(bar.date) }}
                        </h6>
                        {{ $tc('widget.creationDate.document', bar.doc_count, { total: $n(bar.doc_count) }) }}
                      </span>
                    </div>
                  </foreignObject>
                </g>
              </g>
            </g>
          </svg>
          <p class="widget__content__missing mt-2 small text-muted" v-if="missing" :title="$t('widget.creationDate.missingTooltip')">
            {{ $tc('widget.creationDate.missing', missing, { total: $n(missing) }) }}
          </p>
        </v-wait>
      </div>
      <div v-else>
        {{ $t('widget.noData') }}
      </div>
    </div>
  </div>
</template>

<script>
import compact from 'lodash/compact'
import get from 'lodash/get'
import keys from 'lodash/keys'
import map from 'lodash/map'
import sortBy from 'lodash/sortBy'
import startCase from 'lodash/startCase'
import uniqueId from 'lodash/uniqueId'
import * as d3 from 'd3'
import ResizeObserver from 'resize-observer-polyfill'
import { mapState } from 'vuex'

/**
 * Widget to display the number of file by creation date on the insights page.
 */
export default {
  name: 'WidgetDocumentsByCreationDate',
  props: {
    /**
     * The widget definition object.
     */
    widget: {
      type: Object
    }
  },
  data () {
    return {
      data: [],
      intervals: {
        year: {
          format: '%Y',
          time: d3.timeYear
        },
        month: {
          format: '%b %y',
          time: d3.timeMonth
        },
        day: {
          format: '%b %d, %y',
          time: d3.timeDay
        }
      },
      loader: `loading creationDate data ${uniqueId()}`,
      margin: { top: 20, right: 20, bottom: 20, left: 50 },
      missing: 0,
      mounted: false,
      selectedInterval: 'year',
      selectedPath: null,
      shownTooltip: -1,
      width: 0
    }
  },
  watch: {
    project () {
      this.$set(this, 'mounted', false)
      this.$set(this, 'selectedPath', this.dataDir)
      this.init()
    }
  },
  filters: {
    startCase
  },
  mounted () {
    this.$set(this, 'selectedPath', this.dataDir)
    this.$nextTick(() => this.init())
  },
  computed: {
    ...mapState('insights', ['project']),
    dataDir () {
      return this.$config.get('mountedDataDir') || this.$config.get('dataDir')
    },
    container () {
      return this.mounted ? this.$el.querySelector('.widget__content__chart') : null
    },
    chart () {
      return this.mounted ? d3.select(this.container).select('svg') : null
    },
    height () {
      return this.width / 2
    },
    innerHeight () {
      return this.height - this.margin.top - this.margin.bottom
    },
    innerWidth () {
      return this.width - this.margin.left - this.margin.right
    },
    x () {
      return d3.scaleTime()
        .domain([d3.min(this.data, d => d.date), d3.max(this.data, d => d.date)])
        .range([50, this.innerWidth - 50])
        .nice()
    },
    y () {
      return d3.scaleLinear()
        .domain([0, d3.max(this.data, d => d.doc_count)])
        .range([this.innerHeight, 0])
    },
    intervalFormatFn () {
      return d3.timeFormat(this.intervals[this.selectedInterval].format)
    },
    intervalTime () {
      return this.intervals[this.selectedInterval].time
    },
    barWidth () {
      const width = Math.ceil(this.innerWidth / this.x.ticks(this.intervalTime.every(1)).length)
      return Math.ceil(width - width * 0.3)
    },
    bars () {
      return this.data.map(d => {
        const x = this.x(d.date) - this.barWidth / 2
        const y = this.y(d.doc_count)
        return {
          ...d,
          x,
          y,
          flipX: x > this.innerWidth / 2,
          flipY: y < this.innerHeight / 2,
          width: this.barWidth,
          height: this.innerHeight - this.y(d.doc_count)
        }
      })
    }
  },
  methods: {
    setSelectedPath (path) {
      this.$set(this, 'mounted', false)
      this.$set(this, 'selectedPath', path)
      this.init()
    },
    async loadData () {
      this.$wait.start(this.loader)
      this.$set(this, 'missing', 0)
      const options = { size: 1000, interval: this.selectedInterval }
      const filters = []
      if (this.selectedPath) {
        const filter = this.$store.getters['insights/getFilter']({ name: 'path' })
        filter.values = [this.selectedPath]
        filters.push(filter)
      }
      const response = await this.$store.dispatch('insights/queryFilter', { name: 'creationDate', options, filters })
      const aggregation = get(response, ['aggregations', 'metadata.tika_metadata_creation_date', 'buckets'])
      const dates = map(aggregation, d => {
        if (d.key >= 0 && d.key < new Date().getTime()) {
          d.date = new Date(d.key)
          return d
        } else {
          this.$set(this, 'missing', this.missing + d.doc_count)
        }
      })
      this.$set(this, 'data', sortBy(compact(dates), ['key']))
      this.$wait.end(this.loader)
    },
    buildChart () {
      // Refresh the width so all computed properties that are dependent of
      // this value are refreshed (including scale functions)
      this.$set(this, 'width', this.container.offsetWidth)
      // Create/Update the x axis
      this.chart.select('.widget__content__chart__axis--x')
        .call(d3.axisBottom(this.x))
      // Create/Update the y axis
      const yAxisTicks = this.y.ticks().filter(tick => Number.isInteger(tick))
      this.chart.select('.widget__content__chart__axis--y')
        .call(d3.axisLeft(this.y).tickValues(yAxisTicks).tickFormat(d3.format('d')))
        .selectAll('.tick line')
        .attr('x2', this.width - this.margin.left - this.margin.right)
    },
    async init () {
      await this.loadData()
      this.$set(this, 'mounted', true)
      // Build the chart when its container is resized
      const observer = new ResizeObserver(this.buildChart)
      observer.observe(this.container)
    },
    async selectInterval (value) {
      this.$set(this, 'mounted', false)
      this.$set(this, 'selectedInterval', value)
      await this.init()
    },
    tooltipClasses (index, { flipX, flipY }) {
      return {
        'widget__content__chart__tooltips__item--flip-x': flipX,
        'widget__content__chart__tooltips__item--flip-y': flipY,
        'widget__content__chart__tooltips__item--visible': this.shownTooltip === index
      }
    },
    keys
  }
}
</script>

<style lang="scss">
  .widget {
    min-height: 100%;

    &__header__selectors__selector {
      cursor: pointer;
    }

    &__content {
      &__chart {
        padding-top: 50%;
        position: relative;
        width: 100%;

        &__spinner {
          align-items: center;
          display: flex;
          height: 100%;
          justify-content: center;
          left: 0;
          position: absolute;
          top: 0;
          width: 100%;

          .card & {
            background: $card-bg;
          }
        }

        svg:not(.svg-inline--fa) {
          font-family: $font-family-base;
          left: 0;
          position: absolute;
          top: 0;
        }

        &__bars {
          &__item {
            &__bar {
              fill: $primary;
            }

            &__bar:hover {
              fill: $secondary;
            }

            &__bar:hover + &__tooltip {
              display: flex;
            }
          }
        }

        &__tooltips {
          &__item {
            display: none;

            &--visible {
              display: block;
            }

            &--flip-x &__wrapper {
              justify-content: flex-end;
            }

            &--flip-x &__wrapper:after {
              border-left-color: rgba($tooltip-bg, $tooltip-opacity);
              transform: translateX(-$tooltip-arrow-width / 2);
            }

            &:not(&--flip-x)  &__wrapper:after {
              border-right-color: rgba($tooltip-bg, $tooltip-opacity);
            }

            &--flip-y &__wrapper {
              align-items: flex-start;
            }

            &--flip-y &__wrapper:after {
              border-top-color: rgba($tooltip-bg, $tooltip-opacity);
            }

            &:not(&--flip-y)  &__wrapper:after {
              border-bottom-color: rgba($tooltip-bg, $tooltip-opacity);
            }

            &__wrapper {
              display: flex;
              text-align: center;
              flex-direction: row;
              align-items: flex-end;
              justify-content: flex-start;
              height: 100%;
              pointer-events: none;
              position: relative;

              &:after {
                content: "";
                border: ($tooltip-arrow-width / 2) solid transparent;
                position: absolute;
                transform: translateX($tooltip-arrow-width / 2);
              }

              & > span {
                background: rgba($tooltip-bg, $tooltip-opacity);
                color: $tooltip-color;
                margin: 0 $tooltip-arrow-width;
                padding: .2rem .4rem;
              }
            }
          }
        }

        &__axis {
          .tick line {
            color: $gray-300;
          }

          .domain,
          &--x .tick line {
            display: none;
          }
        }
      }
    }
  }
</style>
