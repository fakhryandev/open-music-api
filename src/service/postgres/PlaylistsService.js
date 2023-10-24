const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor() {
    this._pool = new Pool()
  }

  async addPlaylist({ name, owner }) {
    const id = `playlist-${nanoid(16)}`
    const createdtAt = new Date().toISOString()
    const updatedAt = createdtAt

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, name, owner, createdtAt, updatedAt],
    }

    const result = await this._pool.query(query)
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan')
    }

    return result.rows[0].id
  }

  async getPlaylists(owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE owner=$1',
      values: [owner],
    }

    const result = await this._pool.query(query)

    return result.rows.map(({ id, name, owner: username }) => ({
      id,
      name,
      username,
    }))
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id=$1 RETURNING id',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }
  }

  async addSongPlaylist({ playlistId, songId }) {
    const id = `playlist-song-${nanoid(16)}`
    const createdAt = new Date().toISOString()
    const updatedAt = createdAt

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3, $4, $5) RETURNING id',
      values: [id, playlistId, songId, createdAt, updatedAt],
    }

    const result = await this._pool.query(query)

    if (!result.rows[0].id) {
      throw new InvariantError('Song gagal ditambahkan pada playlist')
    }

    return result.rows[0].id
  }

  async getPlaylistById({ playlistId }) {
    const query = {
      text: `SELECT a.song_id, b.id, b.name, c.username FROM playlist_songs a
              JOIN playlists b ON a.playlist_id = b.id
              JOIN users c ON b.owner = c.id
              WHERE b.id = $1`,
      values: [playlistId],
    }

    const result = await this._pool.query(query)

    return result.rows.map(({ song_id: songId, id, name, username }) => ({
      songId,
      id,
      name,
      username,
    }))
  }

  async deletePlaylistSong({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError(
        'Song pada playlist gagal dihapus. songId tidak ditemukan'
      )
    }
  }

  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id=$1',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan')
    }

    const playlist = result.rows[0]

    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini')
    }
  }
}

module.exports = PlaylistsService

