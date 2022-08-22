const Hapi = require('@hapi/hapi')
const albums = require('./api/albums')
const AlbumsService = require('./service/AlbumsService')
require('dotenv').config()

const init = async () => {
  const albumsService = new AlbumsService()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  await server.register({
    plugin: albums,
    options: {
      service: albumsService,
    },
  })

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()
