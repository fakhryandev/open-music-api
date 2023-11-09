class ActivitiesHandler {
  constructor(service, playlistsService) {
    this._service = service
    this._playlistsService = playlistsService

    this.getPlaylistActivityHandler = this.getPlaylistActivityHandler.bind(this)
  }

  async getPlaylistActivityHandler(request) {
    const { id } = request.params
    const { id: credentialId } = request.auth.credentials
    await this._playlistsService.verifyPlaylistOwner(id, credentialId)

    const playlist = await this._service.getPlaylistActivityById({
      id,
      owner: credentialId,
    })
    return {
      status: 'success',
      data: {
        playlistId: id,
        activities: playlist,
      },
    }
  }
}

module.exports = ActivitiesHandler

