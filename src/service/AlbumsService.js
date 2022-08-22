const { Pool } = require('pg')
const NotFoundError = require('../exceptions/NotFoundError')

class AlbumsService {
  constructor() {
    this._pool = new Pool()
  }

  async getAlbumById(albumId) {
    const query = {
      text: 'SELECT * FROM albums WHERE id=$1',
      values: [albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }
  }
}

module.exports = AlbumsService
