const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../exceptions/InvariantError')

class SongsService {
  constructor() {
    this._pool = new Pool()
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

    return result.rows[0].id
  }

  async getSongs() {
    const query = 'SELECT id, title, performer FROM songs'

    const result = await this._pool.query(query)

    return result.rows
  }
}

module.exports = SongsService

