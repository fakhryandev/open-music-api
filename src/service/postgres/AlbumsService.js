const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class AlbumsService {
  constructor(cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO albums VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, year, createdAt, updatedAt],
    }

    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Album gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getAlbumById(albumId) {
    try {
      const result = await this._cacheService.get(`album:${albumId}`)

      return [JSON.parse(result), true]
    } catch (error) {
      const query = {
        text: 'SELECT * FROM albums WHERE id=$1',
        values: [albumId],
      }

      const result = await this._pool.query(query)

      if (!result.rows.length) {
        throw new NotFoundError('Album tidak ditemukan')
      }

      const album = result.rows.map(({ id, name, year, cover }) => ({
        id,
        name,
        year,
        cover,
      }))[0]

      await this._cacheService.set(`album:${albumId}`, JSON.stringify(album))

      return [album, false]
    }
  }

  async editAlbumById(id, { name, year }) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE albums SET name=$1, year=$2, updated_at=$3 WHERE id=$4 RETURNING id',
      values: [name, year, updatedAt, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    await this._cacheService.delete(`album:${result.rows[0].id}`)
  }

  async deleteAlbumById(id) {
    const query = {
      text: 'DELETE FROM albums WHERE id=$1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album gagal dihapus. Id tidak ditemukan')
    }

    await this._cacheService.delete(`album:${result.rows[0].id}`)
  }

  async addCoverAlbumById(id, coverUrl) {
    const query = {
      text: 'UPDATE albums SET cover=$1 WHERE id=$2 RETURNING id',
      values: [coverUrl, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album tidak ditemukan')
    }

    await this._cacheService.delete(`album:${result.rows[0].id}`)
  }
}

module.exports = AlbumsService

