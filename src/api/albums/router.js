const path = require('path')

const routes = (handler) => [
  {
    method: 'GET',
    path: '/albums/{id}',
    handler: handler.getAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums',
    handler: handler.postAlbumHandler,
  },
  {
    method: 'PUT',
    path: '/albums/{id}',
    handler: handler.putAlbumByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/albums/{id}',
    handler: handler.deleteAlbumByIdHandler,
  },
  {
    method: 'POST',
    path: '/albums/{id}/covers',
    handler: handler.postAlbumCoverByIdHandler,
    options: {
      payload: {
        allow: 'multipart/form-data',
        multipart: true,
        output: 'stream',
        maxBytes: 512000,
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/cover/{param*}',
    handler: {
      directory: {
        path: path.resolve(__dirname, 'file/images'),
      },
    },
  },
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getLikesAlbum,
  },
  {
    method: 'POST',
    path: '/albums/{id}/likes',
    handler: handler.addAlbumLikes,
    options: {
      auth: 'openmusic_jwt',
    },
  },
  {
    method: 'DELETE',
    path: '/albums/{id}/likes',
    handler: handler.deleteAlbumLikes,
    options: {
      auth: 'openmusic_jwt',
    },
  },
]

module.exports = routes

