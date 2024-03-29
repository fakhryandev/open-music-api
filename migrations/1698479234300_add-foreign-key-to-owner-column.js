/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint(
    'playlists',
    'fk_playlists.owner_users.id',
    'FOREIGN KEY(owner) REFERENCES users(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint('songs', 'fk_playlists.owner_users.id')
}

