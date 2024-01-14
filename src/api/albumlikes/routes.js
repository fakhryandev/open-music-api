const routes = (handler) => [
  {
    method: 'GET',
    path: '/albums/{id}/likes',
    handler: handler.getAlbumLikes,
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

