import { User, Playlist, SelectedSong } from "../Instances/Instances";
import rootURL from "../utils/utils";
const url = rootURL;
//request for Host user info:
const getNewToken = async (data: string) => {
  try {
    const result = await fetch(`${url}newToken`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: data,
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Something happened while connecting to Spotify.");
  }
};
//request for Host user playlists so he can choose which playlist he wants to modify:
const getAllPlaylistFromUser = async (userInfo: User) => {
  try {
    const playlistOptions = await fetch(`${url}infoPL/${userInfo.id}`, {
      method: "GET",
      headers: { "Content-type": "application/json" },
    });
    if (playlistOptions.status < 400) return await playlistOptions.json();
    return Promise.reject(playlistOptions);
  } catch (error) {
    alert("Something happened while loading your playlists.");
  }
};
//request for chosing an existing playlist and use it
const getExistingPlaylist = async (userInfo: User, playlist: Playlist) => {
  try {
    const useExistingPlaylist = await fetch(
      `${url}useExistingPlaylist/${userInfo.id}`,
      {
        method: "POST",
        headers: { "Content-type": "application/json" },
        body: JSON.stringify({ playlist: playlist }),
      }
    );
    if (useExistingPlaylist.status < 400)
      return await useExistingPlaylist.json();
    return Promise.reject(useExistingPlaylist);
  } catch (error) {
    alert("Something happened while choosing this playlist.");
  }
};
//in case we choose a new playlist:
const getNewPlaylist = async (userInfo: User) => {
  try {
    await fetch(`${url}createPlaylist/${userInfo.id}`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
    });
  } catch (error) {
    alert("Cannot create a new playlist.");
  }
};

//request where the host saves a new password:
const saveNewPassword = async (userInfo: User, pass: string) => {
  try {
    const result = await fetch(`${url}setPass/${userInfo.id}`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ pass: pass }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Unable to set password.");
  }
};
//Here the client is going to give a password and it's going to be checked.
const checkPassword = async (userInfo: string, pass: string) => {
  try {
    const result = await fetch(`${url}checkPass/${userInfo}`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ pass }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Wrong password");
  }
};
//Function for the host to change the room name.
const changeRoomName = async (userInfo: User, newRoom: string | undefined) => {
  try {
    const result = await fetch(`${url}setNewRoom/${userInfo.id}`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ newRoom }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Something went wrong while selecting the room name.");
  }
};
//we fetch to get the Host ID by the room name. We will use this ID later.
const findUserIdByRoom = async (room: string) => {
  try {
    const result = await fetch(`${url}getUserByRoom/`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ room }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Unable to find the host.");
  }
};
//request for searching songs. We first check if userInfo is a string or an object because the client side only has access to
// the id.
const searchNewSong = async (userInfo: User | string, search: string) => {
  try {
    let searchUrl!: string;
    if (typeof userInfo === "string") {
      searchUrl = `${url}search/${userInfo}/${search}`;
    } else {
      searchUrl = `${url}search/${userInfo.id}/${search}`;
    }
    const result = await fetch(searchUrl, {
      method: "GET",
      headers: { "Content-type": "application/json" },
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Something happened during the last search.");
  }
};

//request for people to add a song to the playlist:
const addingSong = async (userId: string, song: SelectedSong) => {
  try {
    const result = await fetch(`${url}addSong/${userId}`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ song: song }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Couldn't add this song.");
  }
};
//request for deleting a song that the user has added.
const deletingSong = async (userId: string, song: SelectedSong) => {
  try {
    const result = await fetch(`${url}deleteSong/${userId}`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ song: song }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Unable to remove this song.");
  }
};
//this function is used to logout. We want to delete the Host data if he wants.
const removeHost = async (userInfo: User) => {
  try {
    const result = await fetch(`${url}logout/`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ user: userInfo.id }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Error. Try again.");
  }
};
//we use this fetch to load the songs of the playlist the first time a client logs in.
const getCurrentList = async (userId: string) => {
  try {
    const result = await fetch(`${url}getCurrentList/`, {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({ user: userId }),
    });
    if (result.status < 400) return await result.json();
    return Promise.reject(result);
  } catch (error) {
    alert("Something happened while loading the playlist");
  }
};

export {
  getNewToken,
  getAllPlaylistFromUser,
  getExistingPlaylist,
  getNewPlaylist,
  saveNewPassword,
  searchNewSong,
  addingSong,
  checkPassword,
  changeRoomName,
  findUserIdByRoom,
  deletingSong,
  removeHost,
  getCurrentList,
};
