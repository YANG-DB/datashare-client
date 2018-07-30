import last from 'lodash/last'
import split from 'lodash/split'
import get from 'lodash/get'
import EsDoc from './EsDoc'
import moment from 'moment'

export default class Document extends EsDoc {
  get path () {
    return get(this, 'source.path', '')
  }
  get basename () {
    return last(this.path.split('/'))
  }
  get highlight () {
    return this.raw.highlight
  }
  get relativePath () {
    if (this.path.indexOf(process.env.VUE_APP_DATA_PREFIX) === -1) {
      return this.path
    }
    return '/api' + process.env.VUE_APP_DATA_PREFIX + split(this.path, process.env.VUE_APP_DATA_PREFIX, 2)[1]
  }
  get contentType () {
    return this.source.contentType || 'unknown'
  }
  get creationDate () {
    return moment(this.source.metadata.tika_metadata_creation_date).format('LLL')
  }
  get humanSize () {
    if (this.source.contentLength === -1) return 'unknown'
    let size = this.source.contentLength
    let unitIndex = Math.floor(size === 0 ? 0 : Math.log(size) / Math.log(1024))
    let value = (size / Math.pow(1024, unitIndex)).toFixed(2)
    let unit = ['B', 'kB', 'MB', 'GB', 'TB'][unitIndex]
    return unitIndex === 0 ? `${size} B` : `${value} ${unit} (${size} B)`
  }
  static get esName () {
    return 'Document'
  }
}
