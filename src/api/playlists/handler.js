class PlaylistsHandler {
  constructor(service, songsService, validator) {
    this._service = service
    this._songsService = songsService
    this._validator = validator

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this)
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this)
    this.deletePlaylistHandler = this.deletePlaylistHandler.bind(this)
    this.postSongPlaylistHandler = this.postSongPlaylistHandler.bind(this)
    this.getSongPlaylistHandler = this.getSongPlaylistHandler.bind(this)
    this.deleteSongPlaylistHandler = this.deleteSongPlaylistHandler.bind(this)
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload)
    const { name } = request.payload
    const { id: credentialId } = request.auth.credentials

    const playlistId = await this._service.addPlaylist({
      name,
      owner: credentialId,
    })

    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    })
    response.code(201)

    return response
  }

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials

    const playlists = await this._service.getPlaylists(credentialId)
    return {
      status: 'success',
      data: {
        playlists,
      },
    }
  }

  async deletePlaylistHandler(request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.verifyPlaylistOwner(id, credentialId)
    await this._service.deletePlaylist(id)

    return {
      status: 'success',
      message: 'Playlist berhasil dihapus',
    }
  }

  async postSongPlaylistHandler(request, h) {
    const { id: playlistId } = request.params
    const { songId } = request.payload
    const { id: credentialId } = request.auth.credentials

    this._validator.validatePlaylistSongPayload(request.payload)
    await this._songsService.getSongById(songId)
    await this._service.verifyPlaylistOwner(playlistId, credentialId)
    const playslistSongId = await this._service.addSongPlaylist({
      playlistId,
      songId,
    })

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        playslistSongId,
      },
    })
    response.code(201)

    return response
  }

  async getSongPlaylistHandler(request) {
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials
    await this._service.verifyPlaylistOwner(playlistId, credentialId)
    const playlist = await this._service.getPlaylistById({ playlistId })

    const songs = (
      await Promise.all(
        playlist.map(async (item) =>
          this._songsService.getSongById(item.songId)
        )
      )
    ).map(({ id, title, performer }) => ({ id, title, performer }))

    const { id, name, username } = playlist[0]

    return {
      status: 'success',
      data: {
        playlist: {
          id,
          name,
          username,
          songs,
        },
      },
    }
  }

  async deleteSongPlaylistHandler(request) {
    const { id: playlistId } = request.params
    const { id: credentialId } = request.auth.credentials
    this._validator.validatePlaylistSongPayload(request.payload)

    const { songId } = request.payload

    await this._service.verifyPlaylistOwner(playlistId, credentialId)
    await this._service.deletePlaylistSong({ playlistId, songId })

    return {
      status: 'success',
      message: 'Song pada playlist berhasil dihapus',
    }
  }
}

module.exports = PlaylistsHandler

