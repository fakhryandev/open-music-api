const AlbumsHandler = require('./handler')
const routes = require('./router')

module.exports = {
  name: 'albums',
  version: '1.1.0',
  register: async (server, { service, songsService, validator }) => {
    const albumsHandler = new AlbumsHandler(service, songsService, validator)
    server.route(routes(albumsHandler))
  },
}

