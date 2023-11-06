const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')

class CollaborationsService {
  constructor() {
    this._pool = new Pool()
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, userId, createdAt, updatedAt],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async verifyCollaborator(playlisId, userId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE playlist_id = $1 AND user_id = $2',
      values: [playlisId, userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi')
    }
  }

  async verifyCollaboratorId(userId) {
    const query = {
      text: 'SELECT * FROM users WHERE id = $1',
      values: [userId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError(
        'Kolaborasi gagal ditambahkan. Id user tidak ditemukan'
      )
    }
  }
}

module.exports = CollaborationsService

