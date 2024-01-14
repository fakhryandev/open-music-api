const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class AlbumLikesServices {
  constructor() {
    this._pool = new Pool()
  }

  async checkLikeAlbum({ albumId, userId }) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id=$2',
      values: [userId, albumId],
    }

    const result = await this._pool.query(query)

    if (result.rows.length) {
      throw new InvariantError('Anda sudah menyukai album ini')
    }

    return result
  }

  async getAlbumLikes({ albumId }) {
    const query = {
      text: 'SELECT * FROM user_album_likes WHERE album_id = $1',
      values: [albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Album likes tidak ditemukan')
    }

    return result.rows
  }

  async addLikeAlbum({ albumId, userId }) {
    const id = `album-like-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO user_album_likes VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, userId, albumId, createdAt, updatedAt],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Album likes gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async deleteLikeAlbum({ albumId, userId }) {
    const query = {
      text: 'DELETE FROM user_album_likes WHERE user_id=$1 AND album_id=$2 RETURNING id',
      values: [userId, albumId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError(
        'Album likes gagal dihapus. albumId tidak ditemukan'
      )
    }
  }
}

module.exports = AlbumLikesServices

