import { getOS, isAuthenticated, getDocumentTypeLabel, getExtractionLevelTranslationKey } from '@/utils/utils'
import { setCookie } from 'tiny-cookie'

describe('utils', () => {
  let languageGetter

  beforeEach(() => {
    languageGetter = jest.spyOn(window.navigator, 'platform', 'get')
  })

  it('should retrieve Mac OS', () => {
    languageGetter.mockReturnValue('MacIntel')
    expect(getOS()).toEqual('mac')
  })

  it('should retrieve Windows OS', () => {
    languageGetter.mockReturnValue('Win32')
    expect(getOS()).toEqual('windows')
  })

  it('should retrieve Linux OS', () => {
    languageGetter.mockReturnValue('Linux x86_64')
    expect(getOS()).toEqual('linux')
  })

  it('should retrieve no OS', () => {
    languageGetter.mockReturnValue('FreeBSD i386')
    expect(getOS()).toEqual('other')
  })

  it('should not be authenticated in test mode', () => {
    expect(isAuthenticated()).toBeFalsy()
  })

  it('should not be authenticated if the cookie has no login field', () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, 'doe', JSON.stringify)
    expect(isAuthenticated()).toBeFalsy()
  })

  it('should be authenticated if there is a cookie with a login field', () => {
    setCookie(process.env.VUE_APP_DS_COOKIE_NAME, { 'login': 'doe' }, JSON.stringify)
    expect(isAuthenticated()).toBeTruthy()
  })

  it('should retrieve the document type for PDF', () => {
    expect(getDocumentTypeLabel('application/pdf')).toEqual('Portable Document Format (PDF)')
  })

  it('should retrieve the document type if no type (1/2)', () => {
    expect(getDocumentTypeLabel('')).toEqual('')
  })

  it('should retrieve the document type if no type (2/2)', () => {
    expect(getDocumentTypeLabel()).toEqual('')
  })

  it('should retrieve the document type for unknown type', () => {
    expect(getDocumentTypeLabel('Unknown')).toEqual('Unknown')
  })

  it('should retrieve the correct extraction level translation key', () => {
    expect(getExtractionLevelTranslationKey(5)).toEqual('facet.level.level_05')
  })

  it('should retrieve the extraction level if no level (1/2)', () => {
    expect(getExtractionLevelTranslationKey('')).toEqual('facet.level.')
  })

  it('should retrieve the extraction level if no level (1/2)', () => {
    expect(getExtractionLevelTranslationKey()).toEqual('')
  })

  it('should retrieve the extraction level for unknown level', () => {
    expect(getExtractionLevelTranslationKey('Unknown')).toEqual('facet.level.Unknown')
  })
})