const ClientError = require('../../exceptions/ClientError')

class AlbumsHandler {
  constructor(service, validator) {
    this._service = service
    this._validator = validator

    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
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

