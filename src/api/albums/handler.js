const ClientError = require('../../exceptions/ClientError')

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator

    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.postAlbumHandler = this.postAlbumHandler.bind(this)
  }

  async postAlbumHandler(request, h) {
    try {
      this._validator.validateAlbumPayload(request.payload)
      const { name = 'untitled', year } = request.payload

      const albumId = await this._service.addAlbum({ name, year })

      const response = h.response({
        status: 'success',
        message: 'Album berhasil ditambahkan',
        data: {
          albumId,
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
    }
  }

  async getAlbumByIdHandler(request, h) {
    try {
      const { id } = request.params
      const album = await this._service.getAlbumById(id)

      return {
        status: 'success',
        data: {
          album: {
            id: album.id,
            name: album.name,
            year: album.year,
          },
        },
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
        status: 'fail',
        message: 'Maaf, terjadi kegagalan pada server kami',
      })
      response.code(500)
      console.error(error)
      return response
    }
  }
}

module.exports = AlbumsHandler

