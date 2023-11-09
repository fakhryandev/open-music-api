const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')

class ActivitiesService {
  constructor() {
    this._pool = new Pool()
  }

  async addActivities({ playlistId, songId, userId, action }) {
    const id = `activities-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO playlist_song_activities VALUES($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id',
      values: [
        id,
        playlistId,
        songId,
        userId,
        action,
        createdAt,
        createdAt,
        updatedAt,
      ],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist activities gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylistActivityById({ id, owner }) {
    const query = {
      text: `SELECT d.username, c.title, a.action, a.time FROM playlist_song_activities a
                JOIN playlists b ON a.playlist_id = b.id
                JOIN songs c ON a.song_id = c.id
                JOIN users d ON a.user_id = d.id
                WHERE a.user_id = $1 AND a.playlist_id = $2`,
      values: [owner, id],
    }

    const result = await this._pool.query(query)

    return result.rows.map(({ username, title, action, time }) => ({
      username,
      title,
      action,
      time,
    }))
  }
}

module.exports = ActivitiesService

