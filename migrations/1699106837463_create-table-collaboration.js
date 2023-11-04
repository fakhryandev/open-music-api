/* eslint-disable camelcase */
const tableName = 'collaborations'
const constraintPlaylistTable = 'fk_collaborations.playlistid_playlists.id'
const constraintUserTable = 'fk_collaborations.userid_users.id'

exports.up = (pgm) => {
  pgm.createTable(tableName, {
    id: {
      type: 'VARCHAR(50)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
  })

  pgm.addConstraint(
    tableName,
    constraintPlaylistTable,
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  )

  pgm.addConstraint(
    tableName,
    constraintUserTable,
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint(tableName, constraintPlaylistTable)
  pgm.dropConstraint(tableName, constraintUserTable)
  pgm.dropTable(tableName)
}

