const Hapi = require('@hapi/hapi')
const Jwt = require('@hapi/jwt')
const Inert = require('@hapi/inert')
const path = require('path')

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

const _exports = require('./api/exports')
const ProducerService = require('./service/rabbitmq/ProducerService')
const ExportsValidator = require('./validator/exports')

const activities = require('./api/activities')
const PlaylistActivitiesService = require('./service/postgres/ActivitiesService')

const LikesAlbumService = require('./service/postgres/LikesAlbumService')

const CacheService = require('./service/redis/CacheService')
const StorageService = require('./service/storage/StorageService')

const TokenManager = require('./tokenize/TokenManager')
const AuthenticationsValidator = require('./validator/authentications')
const ClientError = require('./exceptions/ClientError')

require('dotenv').config()

const init = async () => {
  const cacheService = new CacheService()
  const albumsService = new AlbumsService(cacheService)
  const songsService = new SongsService(cacheService)
  const usersService = new UsersService()
  const collaborationsService = new CollaborationsService()
  const playlistActivitiesService = new PlaylistActivitiesService()
  const playlistsService = new PlaylistsService(
    collaborationsService,
    cacheService
  )
  const authenticationsService = new AuthenticationsService()
  const likesAlbumService = new LikesAlbumService(cacheService)
  const storageService = new StorageService(
    path.resolve(__dirname, 'api/albums/file/images')
  )

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
    {
      plugin: Inert,
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
        storageService,
        likesAlbumService,
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
        playlistActivitiesService,
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
    {
      plugin: activities,
      options: {
        service: playlistActivitiesService,
        playlistsService,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        playlistsService,
        validator: ExportsValidator,
      },
    },
  ])

  await server.start()
  console.log(`Server berjalan pada ${server.info.uri}`)
}

init()

