import { Dispatch, SetStateAction } from "react";

export interface User {
  display_name: string;
  id: string | undefined;
}
export interface Playlist {
  name: string;
  uri: string;
}
export interface SelectedSong {
  name: string | undefined;
  artist: string | undefined;
  uri: string | undefined;
  userWhoAdded: string | undefined;
}
export interface HostProps {
  _id: string;
  userInfo: User;
  set_id: Dispatch<SetStateAction<string>>;
}
export interface SearchProps {
  userId: string | undefined;
  song: SelectedSong;
  setSelectedSong: Dispatch<SetStateAction<SelectedSong>>;
}
export interface deleteProps {
  userId: string | undefined;
  song: SelectedSong;
  setDeleteSong: Dispatch<SetStateAction<SelectedSong>>;
}
export interface GeneralPlaylist {
  name: string;
  uri: string;
  owner: { id: string };
}
