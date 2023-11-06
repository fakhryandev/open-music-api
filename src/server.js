const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')

const albums = require('./api/albums')
const AlbumsService = require('./service/postgres/AlbumsService')
const AlbumsValidator = require('./validator/albums')

const songs = require('./api/songs')
const SongsService = require('./service/postgres/SongsService')
const SongsValidator = require('./validator/songs')

const users = require('./api/users')
const UsersService = require('./service/postgres/UsersService')
const UsersValidator = require('./validator/users')

const authentications = require('./api/authentications')
const AuthenticationsService = require('./service/postgres/AuthenticationsService')

const playlists = require('./api/playlists')
const PlaylistsService = require('./service/postgres/PlaylistsService')
const PlaylistsValidator = require('./validator/playlists')

const collaborations = require('./api/collaborations')
const CollaborationsService = require('./service/postgres/CollaborationsService')
const CollaborationsValidator = require('./validator/collaborations')

const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')
const ClientError = require('./exceptions/ClientError')

require('dotenv').config()

const init = async () => {
  const albumsService = new AlbumsService()
  const songsService = new SongsService()
  const usersService = new UsersService()
  const collaborationsService = new CollaborationsService()
  const playlistsService = new PlaylistsService(collaborationsService)
  const authenticationsService = new AuthenticationsService()

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  })

  server.ext('onPreResponse', (request, h) => {
    const { response } = request

    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        })
        newResponse.code(response.statusCode)

        return newResponse
      }

      if (!response.isServer) {
        return h.continue
      }

      const newResponse = h.response({
        status: 'error',
        message: 'terjadi kegagalan pada server kami',
      })
      newResponse.code(500)
      return newResponse
    }

    return h.continue
  })

  await server.register([
    {
      plugin: Jwt,
    },
  ])

  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  })

  await server.register([
    {
      plugin: albums,
      options: {
        service: albumsService,
        songsService,
        validator: AlbumsValidator,
      },
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator,
      },
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        songsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        playlistsService,
        validator: CollaborationsValidator,
      },
    },
  ])

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()

