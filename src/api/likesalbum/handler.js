class AlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service
    this._albumsService = albumsService

    this.getLikesAlbum = this.getLikesAlbum.bind(this)
    this.addAlbumLikes = this.addAlbumLikes.bind(this)
    this.deleteAlbumLikes = this.deleteAlbumLikes.bind(this)
  }

  async getLikesAlbum(request, h) {
    const { id } = request.params

    const [albumLikes, cache] = await this._service.getLikesAlbum({
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

    await this._albumsService.getAlbumById(id)

    await this._service.checkLikeAlbum({
      albumId: id,
      userId: credentialId,
    })

    await this._service.addLikeAlbum({ albumId: id, userId: credentialId })

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

    await this._service.deleteLikeAlbum({ albumId: id, userId: credentialId })

    return {
      status: 'success',
      message: `Sukses batal menyukai album ${id}`,
    }
  }
}

module.exports = AlbumLikesHandler

