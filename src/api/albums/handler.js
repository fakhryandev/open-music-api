class AlbumsHandler {
  constructor(service, songsService, storageService, validator) {
    this._service = service
    this._validator = validator
    this._songsService = songsService
    this._storageService = storageService

    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)

    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this)
  }

  async postAlbumHandler(request, h) {
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
  }

  async getAlbumByIdHandler(request) {
    const { id } = request.params
    const album = await this._service.getAlbumById(id)
    const songs = await this._songsService.getSongByAlbumId(album.id)
    return {
      status: 'success',
      data: {
        album: {
          id: album.id,
          name: album.name,
          year: album.year,
          coverUrl: album.cover,
          songs,
        },
      },
    }
  }

  async putAlbumByIdHandler(request) {
    const { id } = request.params
    this._validator.validateAlbumPayload(request.payload)

    await this._service.editAlbumById(id, request.payload)

    return {
      status: 'success',
      message: 'Album berhasil diperbarui',
    }
  }

  async deleteAlbumByIdHandler(request) {
    const { id } = request.params
    await this._service.deleteAlbumById(id)

    return {
      status: 'success',
      message: 'Album berhasil dihapus',
    }
  }

  async postAlbumCoverByIdHandler(request, h) {
    const { id } = request.params
    const { cover } = request.payload
    this._validator.validateImageHeaders(cover.hapi.headers)

    const filename = await this._storageService.writeFile(cover, cover.hapi)
    await this._service.addCoverAlbumById(id, filename)

    const response = h.response({
      status: 'success',
      message: 'Cover Upload Successfully.',
    })
    response.code(201)
    return response
  }
}

module.exports = AlbumsHandler

