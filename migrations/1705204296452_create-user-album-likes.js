/* eslint-disable camelcase */
const tableName = 'user_album_likes'
const constraintUserAlbumLikes = 'fk_user-album-likes.userid_users.id'
const constraintAlbumAlbumLikes = 'fk_user-album-likes.albumid_albums.id'

exports.up = (pgm) => {
  pgm.createTable(tableName, {
    id: {
      type: 'VARCHAR(50)',
      prmaryKey: true,
    },
    user_id: {
      type: 'VARCHAR(50)',
      notNull: true,
    },
    album_id: {
      type: 'VARCHAR(50)',
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
    constraintUserAlbumLikes,
    'FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE'
  )

  pgm.addConstraint(
    tableName,
    constraintAlbumAlbumLikes,
    'FOREIGN KEY(album_id) REFERENCES albums(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint(tableName, constraintUserAlbumLikes)
  pgm.dropConstraint(tableName, constraintAlbumAlbumLikes)
  pgm.dropTable(tableName)
}

