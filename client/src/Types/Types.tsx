import React, { Dispatch, SetStateAction } from 'react'

export interface User {
  display_name: string,
  id: string | undefined,
  uri: string,
  email: string,
}

export interface Playlist {
  name: string,
  uri: string,
}

export interface SelectedSong {
  name: string | undefined,
  artist: string | undefined,
  uri: string | undefined,
  userWhoAdded: string | undefined,
}

export interface SearchProps {
  userId: string | undefined,
  song: SelectedSong,
  setSelectedSong: Dispatch<SetStateAction<SelectedSong>>,
}

export interface deleteProps {
  userId: string | undefined,
  song: SelectedSong,
  setDeleteSong: Dispatch<SetStateAction<SelectedSong>>,
}

export interface GeneralPlaylist {
  name: string,
  uri: string,
  owner: {id: string}
}