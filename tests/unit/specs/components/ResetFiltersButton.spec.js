import { App } from '@/main'
import ResetFiltersButton from '@/components/ResetFiltersButton'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import flushPromises from 'flush-promises'

const { i18n, localVue, router, store } = App.init(createLocalVue()).useAll()

describe('ResetFiltersButton.vue', function () {
  let wrapper

  beforeEach(() => {
    store.commit('search/reset')
    wrapper = shallowMount(ResetFiltersButton, { localVue, i18n, router, store, sync: false })
  })

  it('should display a disabled button, by default', () => {
    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn').attributes().disabled).toEqual('disabled')
  })

  it('should display an active button if a facet is valuated', async () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })
    await flushPromises()

    expect(wrapper.find('.btn').exists()).toBeTruthy()
    expect(wrapper.find('.btn[disabled]').exists()).toBeFalsy()
  })

  it('shouldn\'t have facets', () => {
    expect(wrapper.vm.hasFilters).toBeFalsy()
  })

  it('should have facets', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })
    expect(wrapper.vm.hasFilters).toBeTruthy()
  })

  it('should reset facets on facets reset', () => {
    store.commit('search/addFacetValue', { name: 'language', value: 'en' })

    wrapper.vm.resetFacets()

    expect(wrapper.vm.hasFilters).toBeFalsy()
  })

  it('should reset query on facets reset', () => {
    store.commit('search/query', 'this is a query')

    wrapper.vm.resetFacets()

    expect(store.state.search.query).toBe('')
  })

  it('should not change the index on facets reset', () => {
    store.commit('search/index', 'my-index')

    wrapper.vm.resetFacets()

    expect(store.state.search.index).toBe('my-index')
  })

  it('should not change the globalSearch setting on facets reset', () => {
    store.commit('search/setGlobalSearch', false)

    wrapper.vm.resetFacets()

    expect(store.state.search.globalSearch).toBeFalsy()
  })

  it('should not change the starredDocuments on facets reset', () => {
    store.commit('search/starredDocuments', ['doc_01', 'doc_02'])

    wrapper.vm.resetFacets()

    expect(store.state.search.starredDocuments).toEqual(['doc_01', 'doc_02'])
  })

  it('should emit an event "bv::hide::popover" on facets reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('bv::hide::popover', mockCallback)

    wrapper.vm.resetFacets()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should emit an event "facet::search::reset-filters" on facets reset', () => {
    const mockCallback = jest.fn()
    wrapper.vm.$root.$on('facet::search::reset-filters', mockCallback)

    wrapper.vm.resetFacets()

    expect(mockCallback.mock.calls).toHaveLength(1)
  })

  it('should call router push on facets reset', () => {
    jest.spyOn(router, 'push')
    wrapper = shallowMount(ResetFiltersButton, { localVue, i18n, router, store, sync: false })

    wrapper.vm.resetFacets()

    expect(router.push).toHaveBeenCalled()
  })
})
