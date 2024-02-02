class SongsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator

    this.postSongHandler = this.postSongHandler.bind(this)
    this.getSongsHandler = this.getSongsHandler.bind(this)
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this)
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this)
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this)
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload)
    const {
      title = 'untitled',
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload

    const songId = await this._service.addSong({
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    })

    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        songId,
      },
    })
    response.code(201)

    return response
  }

  async getSongsHandler(request) {
    const songs = await this._service.getSongs(request.query)

    return {
      status: 'success',
      data: {
        songs,
      },
    }
  }

  async getSongByIdHandler(request, h) {
    const { id } = request.params
    const [song, cache] = await this._service.getSongById(id)

    const response = h.response({
      status: 'success',
      data: {
        song,
      },
    })

    if (cache) {
      response.header('X-Data-Source', 'cache')
    }

    return response
  }

  async putSongByIdHandler(request) {
    const { id } = request.params
    this._validator.validateSongPayload(request.payload)
    await this._service.editSongById(id, request.payload)

    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    }
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params
    await this._service.deleteSongById(id)

    return {
      status: 'success',
      message: 'Song berhasil dihapus',
    }
  }
}

module.exports = SongsHandler

