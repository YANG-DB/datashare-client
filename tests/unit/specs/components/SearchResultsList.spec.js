import SearchResultsList from '@/components/SearchResultsList'
import VueI18n from 'vue-i18n'
import BootstrapVue from 'bootstrap-vue'
import Murmur from '@icij/murmur'
import { createLocalVue, shallowMount } from '@vue/test-utils'
import esConnectionHelper from 'tests/unit/specs/utils/esConnectionHelper'
import { IndexedDocuments, IndexedDocument, letData } from 'tests/unit/es_utils'
import messages from '@/lang/en'
import store from '@/store'
import { datashare } from '@/store/modules/search'
import { jsonOk } from 'tests/unit/tests_utils'

const localVue = createLocalVue()
localVue.use(VueI18n)
localVue.use(Murmur)
localVue.use(BootstrapVue)
const i18n = new VueI18n({ locale: 'en', messages: { 'en': messages } })

async function createView (query = '*', from = 0, size = 25) {
  await store.dispatch('search/query', { query, from, size })
  return shallowMount(SearchResultsList, {
    localVue,
    i18n,
    store
  })
}

describe('SearchResultsListList.vue', () => {
  let wrapper
  esConnectionHelper()
  const es = esConnectionHelper.es
  // High timeout because multiple searches can be heavy for the Elasticsearch
  jest.setTimeout(1e4)

  beforeAll(() => {
    Murmur.config.merge({ userIndices: [process.env.VUE_APP_ES_INDEX] })
    store.commit('search/index', process.env.VUE_APP_ES_INDEX)
  })

  beforeEach(() => {
    store.commit('search/reset')
    jest.spyOn(datashare, 'fetch')
    datashare.fetch.mockReturnValue(jsonOk([]))
  })

  describe('filter the results', () => {
    it('should display no documents found', async () => {
      wrapper = await createView()

      expect(wrapper.find('.search-results-list__header__number-of-results').text()).toEqual('No documents found')
    })

    it('should return 2 documents', async () => {
      await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()
      wrapper = await createView('document', 0, 2)

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)
    })

    it('should return 3 documents', async () => {
      await letData(es).have(new IndexedDocuments().setBaseName('doc').withContent('document').count(4)).commit()
      wrapper = await createView('document', 0, 3)

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(3)
    })

    it('should display all the documents that have a NE person Paris', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withNer('paris', 1, 'LOCATION')).commit()
      await letData(es).have(new IndexedDocument('doc_02')
        .withNer('paris')).commit()
      await letData(es).have(new IndexedDocument('doc_03')
        .withNer('paris')).commit()

      store.commit('search/addFacetValue', { name: 'named-entity-person', value: 'paris' })
      wrapper = await createView()

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)
    })

    it('should display all the documents without creation date', async () => {
      await letData(es).have(new IndexedDocument('doc_01')
        .withCreationDate('2018-05-01T00:00:00.000Z')).commit()
      await letData(es).have(new IndexedDocument('doc_02')).commit()
      await letData(es).have(new IndexedDocument('doc_03')).commit()

      store.commit('search/addFacetValue', { name: 'creation-date', value: -62167219200000 })
      wrapper = await createView()

      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)
    })
  })

  it('should search with boolean', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withContent('first')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withContent('second')).commit()
    await letData(es).have(new IndexedDocument('doc_03').withContent('third')).commit()

    wrapper = await createView('first')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('second')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('first second')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

    wrapper = await createView('first AND second')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(0)
  })

  it('should search with wildcards', async () => {
    await letData(es).have(new IndexedDocument('doc_01').withContent('first')).commit()
    await letData(es).have(new IndexedDocument('doc_02').withContent('firs')).commit()
    await letData(es).have(new IndexedDocument('doc_03').withContent('foxes')).commit()

    wrapper = await createView('firste')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(0)

    wrapper = await createView('first')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('firs?')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)

    wrapper = await createView('firs*')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

    wrapper = await createView('f*')
    expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(3)
  })

  describe('lucene querying', () => {
    it('should search with field names', async () => {
      await letData(es).have(new IndexedDocument('doc_01').withContent('first').withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_02').withContent('firs').withContentType('type_01')).commit()
      await letData(es).have(new IndexedDocument('doc_03').withContent('foxes').withContentType('type_02')).commit()

      wrapper = await createView('contentType:type_01')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('contentType:type_02')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)
    })

    it('should search with fuzziness', async () => {
      await letData(es).have(new IndexedDocument('doc_01').withContent('first')).commit()
      await letData(es).have(new IndexedDocument('doc_02').withContent('firs')).commit()
      await letData(es).have(new IndexedDocument('doc_03').withContent('foxes')).commit()

      wrapper = await createView('firt~')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('fokes~1')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)
    })

    it('should search with exact query', async () => {
      await letData(es).have(new IndexedDocument('doc_01').withContent('this should be an exact content')).commit()
      await letData(es).have(new IndexedDocument('doc_02').withContent('this should be an approximate content')).commit()
      await letData(es).have(new IndexedDocument('doc_03').withContent('this is an exact content')).commit()

      wrapper = await createView('"exact content"')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(2)

      wrapper = await createView('"this should be an exact content"')
      expect(wrapper.findAll('.search-results-list__items__item__link')).toHaveLength(1)
    })
  })
})