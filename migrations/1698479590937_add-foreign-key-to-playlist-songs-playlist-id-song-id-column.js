/* eslint-disable camelcase */
exports.up = (pgm) => {
  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist-songs.playlistid_songs.id',
    'FOREIGN KEY(song_id) REFERENCES songs(id) ON DELETE CASCADE'
  )

  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist-songs.playlistid_playlists.id',
    'FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE'
  )
}

exports.down = (pgm) => {
  pgm.dropConstraint('playlist_songs', 'fk_playlist-songs.playlistid_songs.id')
  pgm.dropConstraint(
    'playlist_songs',
    'fk_playlist-songs.playlistid_playlists.id'
  )
}

