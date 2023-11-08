/* eslint-disable camelcase */
const tableName = 'playlist_song_activities'
const constraintPlaylistTable =
  'fk_playlist-song-activities.playlistid_playlists.id'

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
    song_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    action: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    time: {
      type: 'TEXT',
      notNull: true,
    },
    created_at: {
      type: 'TEXT',
      notNull: true,
    },
    updated_at: {
      type: 'TEXT',
      notNull: true,
    },
  })

  pgm.addConstraint(
    tableName,
    constraintPlaylistTable,
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint(tableName, constraintPlaylistTable)
  pgm.dropTable(tableName)
}

