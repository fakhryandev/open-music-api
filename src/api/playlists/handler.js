const ClientError = require('../../exceptions/ClientError')

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
  }

  async postPlaylistHandler(request, h) {
    try {
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
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)

        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami,',
      })
      response.code(500)
      console.error(error)

      return response
    }
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

  async deletePlaylistHandler(request, h) {
    try {
      const { id } = request.params
      const { id: credentialId } = request.auth.credentials

      await this._service.verifyPlaylistOwner(id, credentialId)
      await this._service.deletePlaylist(id)

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
      }
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }

  async postSongPlaylistHandler(request, h) {
    try {
      const { id: playlistId } = request.params
      const { songId } = request.payload
      const { id: credentialId } = request.auth.credentials

      this._validator.validatePlaylistSongPayload(request.payload)
      await this._service.verifyPlaylistOwner(playlistId, credentialId)
      await this._songsService.getSongById(songId)
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
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        })
        response.code(error.statusCode)
        return response
      }

      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami',
      })
      response.code(500)
      console.error(error)

      return response
    }
  }
}

module.exports = PlaylistsHandler

