const AlbumsHandler = require('./handler')
const routes = require('./router')

module.exports = {
  name: 'albums',
  version: '3.1.0',
  register: async (
    server,
    { service, songsService, storageService, likesAlbumService, validator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      service,
      songsService,
      storageService,
      likesAlbumService,
      validator
    )
    server.route(routes(albumsHandler))
  },
}

