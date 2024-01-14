class AlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service
    this._albumsService = albumsService

    this.getAlbumLikes = this.getAlbumLikes.bind(this)
    this.addAlbumLikes = this.addAlbumLikes.bind(this)
    this.deleteAlbumLikes = this.deleteAlbumLikes.bind(this)
  }

  async getAlbumLikes(request) {
    const { id } = request.params

    const album = await this._service.getAlbumLikes({ albumId: id })

    return {
      status: 'success',
      data: {
        likes: album.length,
      },
    }
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

