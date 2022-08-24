const routes = (handler) => [
  {
    method: 'GET',
    path: '/songs',
    handler: handler.getSongsHandler,
  },
  {
    method: 'POST',
    path: '/songs',
    handler: handler.postSongHandler,
  },
]

module.exports = routes

