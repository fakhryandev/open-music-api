const { nanoid } = require('nanoid')
const { Pool } = require('pg')
const InvariantError = require('../../exceptions/InvariantError')
const NotFoundError = require('../../exceptions/NotFoundError')
const AuthorizationError = require('../../exceptions/AuthorizationError')

class PlaylistsService {
  constructor(collaborationsService, cacheService) {
    this._pool = new Pool()
    this._collaborationsService = collaborationsService
    this._cacheService = cacheService
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

    await this._cacheService.delete(`playlists:${owner}`)

    return result.rows[0].id
  }

  async getPlaylists(owner) {
    try {
      const result = await this._cacheService.get(`playlists:${owner}`)

      return [JSON.parse(result), true]
    } catch (error) {
      const query = {
        text: `SELECT a.id, c.fullname, c.username FROM playlists a 
                LEFT JOIN collaborations b ON a.id = b.playlist_id
                JOIN users c ON a.owner = c.id
                WHERE a.owner=$1 OR b.user_id = $1`,
        values: [owner],
      }

      const result = await this._pool.query(query)

      const playlists = result.rows.map(({ id, fullname: name, username }) => ({
        id,
        name,
        username,
      }))

      await this._cacheService.set(
        `playlists:${owner}`,
        JSON.stringify(playlists)
      )

      return [playlists, false]
    }
  }

  async deletePlaylist(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id=$1 RETURNING id, owner',
      values: [id],
    }

    const result = await this._pool.query(query)

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan')
    }

    await this._cacheService.delete(`playlists:${result.rows[0].owner}`)
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

    await this._cacheService.delete(`playlist:${playlistId}`)
    return result.rows[0].id
  }

  async getPlaylistById({ playlistId }) {
    try {
      const result = await this._cacheService.get(`playlist:${playlistId}`)

      return [JSON.parse(result), true]
    } catch (error) {
      const query = {
        text: `SELECT a.song_id, b.id, b.name, c.username FROM playlist_songs a
                JOIN playlists b ON a.playlist_id = b.id
                JOIN users c ON b.owner = c.id
                WHERE b.id = $1`,
        values: [playlistId],
      }

      const result = await this._pool.query(query)

      if (!result.rows.length) {
        throw new NotFoundError('Playlist tidak ditemukan')
      }

      const playlist = result.rows.map(
        ({ song_id: songId, id, name, username }) => ({
          songId,
          id,
          name,
          username,
        })
      )

      await this._cacheService.set(
        `playlist:${playlistId}`,
        JSON.stringify(playlist)
      )

      return [playlist, false]
    }
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

    await this._cacheService.delete(`playlist:${playlistId}`)
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

  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId)
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error
      }

      try {
        await this._collaborationsService.verifyCollaborator(playlistId, userId)
      } catch {
        throw error
      }
    }
  }
}

module.exports = PlaylistsService

