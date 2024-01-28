const AlbumsHandler = require('./handler')
const routes = require('./router')

module.exports = {
  name: 'albums',
  version: '2.1.0',
  register: async (
    server,
    { service, songsService, storageService, validator }
  ) => {
    const albumsHandler = new AlbumsHandler(
      service,
      songsService,
      storageService,
      validator
    )
    server.route(routes(albumsHandler))
  },
}

