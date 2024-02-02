class AlbumsHandler {
  constructor(service, songsService, storageService, likesService, validator) {
    this._service = service
    this._validator = validator
    this._songsService = songsService
    this._storageService = storageService
    this._likesService = likesService

    this.getAlbumByIdHandler = this.getAlbumByIdHandler.bind(this)
    this.postAlbumHandler = this.postAlbumHandler.bind(this)
    this.putAlbumByIdHandler = this.putAlbumByIdHandler.bind(this)
    this.deleteAlbumByIdHandler = this.deleteAlbumByIdHandler.bind(this)

    this.postAlbumCoverByIdHandler = this.postAlbumCoverByIdHandler.bind(this)

    this.getLikesAlbum = this.getLikesAlbum.bind(this)
    this.addAlbumLikes = this.addAlbumLikes.bind(this)
    this.deleteAlbumLikes = this.deleteAlbumLikes.bind(this)
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

  async getAlbumByIdHandler(request, h) {
    const { id } = request.params
    const [album, cache] = await this._service.getAlbumById(id)
    const [songs, cacheSong] = await this._songsService.getSongByAlbumId(
      album.id
    )

    const response = h.response({
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
    })

    if (cache && cacheSong) {
      response.header('X-Data-Source', 'cache')
    }

    return response
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

  async getLikesAlbum(request, h) {
    const { id } = request.params

    const [albumLikes, cache] = await this._likesService.getLikesAlbum({
      albumId: id,
    })

    const response = h.response({
      status: 'success',
      data: {
        likes: albumLikes,
      },
    })

    if (cache) {
      response.header('X-Data-Source', 'cache')
    }

    return response
  }

  async addAlbumLikes(request, h) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._service.getAlbumById(id)

    await this._likesService.checkLikeAlbum({
      albumId: id,
      userId: credentialId,
    })

    await this._likesService.addLikeAlbum({ albumId: id, userId: credentialId })

    const response = h.response({
      status: 'success',
      message: `Sukses menyukai album ${id}`,
    })
    response.code(201)

    return response
  }

  async deleteAlbumLikes(request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials

    await this._likesService.deleteLikeAlbum({
      albumId: id,
      userId: credentialId,
    })

    return {
      status: 'success',
      message: `Sukses batal menyukai album ${id}`,
    }
  }
}

module.exports = AlbumsHandler

