import axios from 'axios'

import Api from '@/api'
import { EventBus } from '@/utils/event-bus'

jest.mock('axios', () => {
  return {
    request: jest.fn().mockResolvedValue({ data: {} })
  }
})

const api = new Api()

describe('Datashare backend client', () => {
  let json

  it('should return backend response to index', async () => {
    json = await api.index({})
    expect(json).toEqual({})
  })

  it('should return backend response to findNames', async () => {
    json = await api.findNames('pipeline', {})
    expect(json).toEqual({})
  })

  it('should return backend response to stopPendingTasks', async () => {
    json = await api.stopPendingTasks()
    expect(json).toEqual({})
  })

  it('should return backend response to stopTask', async () => {
    json = await api.stopTask()
    expect(json).toEqual({})
  })

  it('should return backend response to deleteDoneTasks', async () => {
    json = await api.deleteDoneTasks()
    expect(json).toEqual({})
  })

  it('should return backend response to getTasks', async () => {
    json = await api.getTasks()
    expect(json).toEqual({})
  })

  it('should return backend response to createIndex', async () => {
    json = await api.createIndex()
    expect(json).toEqual({})
  })

  it('should return backend response to deleteAll', async () => {
    json = await api.deleteAll()
    expect(json).toEqual({})
  })

  it('should return backend response to getVersion', async () => {
    json = await api.getVersion()
    expect(json).toEqual({})
  })

  it('should return backend response to getConfig', async () => {
    json = await api.getConfig()
    expect(json).toEqual({})
  })

  it('should return backend response to setConfig', async () => {
    json = await api.setConfig({})
    expect(json).toEqual({})
  })

  it('should return backend response to deleteNamedEntitiesByMentionNorm', async () => {
    json = await api.deleteNamedEntitiesByMentionNorm('mentionNorm')
    expect(json).toEqual({})
  })

  it('should return backend response to getSource', async () => {
    json = await api.getSource('relativeUrl')
    expect(json).toEqual({})
  })

  it('should return backend response to getStarredDocuments', async () => {
    json = await api.getStarredDocuments('project')
    expect(json).toEqual({})
  })

  it('should return backend response to starDocument', async () => {
    json = await api.getStarredDocuments('project', 'documentId')
    expect(json).toEqual({})
  })

  it('should return backend response to unstarDocument', async () => {
    json = await api.getStarredDocuments('project', 'documentId')
    expect(json).toEqual({})
  })

  it('should return backend response to tagDocument', async () => {
    json = await api.tagDocument('project', 'documentId', 'routingId', ['tag_01'])
    expect(json).toEqual({})
  })

  it('should return backend response to untagDocument', async () => {
    json = await api.untagDocument('project', 'documentId', 'routingId', ['tag_01'])
    expect(json).toEqual({})
  })

  it('should return backend response to batchSearch', async () => {
    const name = 'name'
    const csvFile = 'csvFile'
    const description = 'description'
    const project = 'project'
    const phraseMatch = false
    const fuzziness = 2
    const fileTypes = [{ mime: 'application/pdf' }, { mime: 'text/plain' }]
    const paths = ['one', 'or', 'two', 'paths']
    const published = true
    json = await api.batchSearch(name, csvFile, description, project, phraseMatch, fuzziness, fileTypes, paths, published)

    const body = new FormData()
    body.append('name', name)
    body.append('csvFile', csvFile)
    body.append('description', description)
    body.append('phrase_matches', phraseMatch)
    body.append('fuzziness', fuzziness)
    body.append('fileTypes', 'application/pdf')
    body.append('fileTypes', 'text/plain')
    body.append('paths', 'one')
    body.append('paths', 'or')
    body.append('paths', 'two')
    body.append('paths', 'paths')
    body.append('published', published)
    expect(json).toEqual({})
    expect(axios.request).toBeCalledWith({ url: Api.getFullUrl('/api/batch/search/project'), method: 'POST', body })
  })

  it('should return backend response to getBatchSearches', async () => {
    json = await api.getBatchSearches()
    expect(json).toEqual({})
  })

  it('should return backend response to getBatchSearchResults', async () => {
    json = await api.getBatchSearchResults()
    expect(json).toEqual({})
  })

  it('should return backend response to deleteBatchSearches', async () => {
    json = await api.deleteBatchSearches()
    expect(json).toEqual({})
  })

  it('should emit an error if the backend response has a bad status', async () => {
    const error = new Error('Forbidden')
    axios.request.mockReturnValue(Promise.reject(error))
    const mockCallback = jest.fn()
    EventBus.$on('http::error', mockCallback)

    try {
      await api.createIndex()
    } catch (err) {
      expect(err).toEqual(error)
    }

    expect(mockCallback.mock.calls.length).toBe(1)
    expect(mockCallback.mock.calls[0][0]).toEqual(error)
  })
})