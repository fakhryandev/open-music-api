const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class SongsService {
  constructor(cacheService) {
    this._pool = new Pool()
    this._cacheService = cacheService
  }

  async addSong({ title, year, genre, performer, duration, albumId }) {
    const id = `song-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO songs values($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id',
      values: [
        id,
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
        createdAt,
        updatedAt,
      ],
    }

    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan')
    }
    await this._cacheService.delete(`albumSongs:${albumId}`)

    return result.rows[0].id
  }

  async getSongs({ title = '', performer = '' }) {
    const query = {
      text: 'SELECT id, title, performer FROM songs WHERE title ILIKE $1 AND performer ILIKE $2',
      values: [`%${title}%`, `%${performer}%`],
    }

    const result = await this._pool.query(query)

    return result.rows
  }

  async getSongById(id) {
    try {
      const result = await this._cacheService.get(`song:${id}`)

      return [JSON.parse(result), true]
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE id=$1',
        values: [id],
      }

      const result = await this._pool.query(query)

      if (!result.rows.length) {
        throw new NotFoundError('Song tidak ditemukan')
      }

      await this._cacheService.set(`song:${id}`, JSON.stringify(result.rows[0]))

      return [result.rows[0], false]
    }
  }

  async getSongByAlbumId(albumId) {
    try {
      const result = await this._cacheService.get(`albumSongs:${albumId}`)

      return [JSON.parse(result), true]
    } catch (error) {
      const query = {
        text: 'SELECT * FROM songs WHERE album_id=$1',
        values: [albumId],
      }

      const result = await this._pool.query(query)

      const albumSongs = result.rows.map(({ id, title, performer }) => ({
        id,
        title,
        performer,
      }))

      await this._cacheService.set(
        `albumSongs:${albumId}`,
        JSON.stringify(albumSongs)
      )

      return [albumSongs, false]
    }
  }

  async editSongById(id, { title, year, genre, performer, duration, albumId }) {
    const updatedAt = new Date().toISOString()
    const query = {
      text: 'UPDATE songs SET title=$1, year=$2, genre=$3, performer=$4, duration=$5, album_id=$6, updated_at=$7 WHERE id=$8 RETURNING id',
      values: [title, year, genre, performer, duration, albumId, updatedAt, id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Song tidak ditemukan')
    }

    await this._cacheService.delete(`song:${result.rows[0].id}`)
  }

  async deleteSongById(id) {
    const query = {
      text: 'DELETE FROM songs WHERE id=$1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Song gagal dihapus. Id tidak ditemukan')
    }
    await this._cacheService.delete(`song:${result.rows[0].id}`)
  }
}

module.exports = SongsService

