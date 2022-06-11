import { User, Playlist, SelectedSong } from "../Types/Types";

const url = `https://c240-139-47-32-93.eu.ngrok.io/`
//request for Host user info:
const getNewToken = async (data: string) => {
  try {
    const result = await fetch(`${url}newToken`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: data
    })
    const json = await result.json();
    return json
  } catch (error) {
    alert('Something happened')
  }
}
//request for Host user playlists so he can choose which playlist he wants to modify:
const getAllPlaylistFromUser = async (userInfo: User) => {
  try {
    const playlistOptions = await fetch(`${url}infoPL/${userInfo.id}`, {
      method: "GET",
      headers: { 'Content-type': 'application/json' }
    })
    const playlistData = await playlistOptions.json();
    return playlistData;
  } catch (error) {
    alert('Something happened')
  }
}
//request for chosing an existing playlist and use it
const getExistingPlaylist = async (userInfo: User, playlist: Playlist) => {
  try {
    const useExistingPlaylist = await fetch(`${url}useExistingPlaylist/${userInfo.id}`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ 'playlist': playlist })
    })
    return await useExistingPlaylist.json()
  } catch (error) {
    alert('Something happened')
  }
}
//in case we choose a new playlist:
const getNewPlaylist = async (userInfo: User) => {
  try {
    await fetch(`${url}createPlaylist/${userInfo.id}`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' }
    })
  } catch (error) {
    alert('Something happend')
  }
}

//request where the host saves a new password:
const saveNewPassword = async (userInfo: User, pass: string) => {
  try {
    const result = await fetch(`${url}setPass/${userInfo.id}`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ 'pass': pass })
    })
    return await result.json();
  } catch (error) {
    alert('Something happened')
  }
}
//checking pass
const checkPassword = async (userInfo: string, pass: string) => {
  try {
    const result = await fetch(`${url}checkPass/${userInfo}`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ pass }),
    })
    return await result.json();
  } catch (error) {
    alert('Something happened')
  }
}
//set new room name as host:
const changeRoomName = async (userInfo: User, newRoom: string | undefined) => {
  try {
    const result = await fetch(`${url}setNewRoom/${userInfo.id}`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ newRoom }),
    })
    return await result.json();
  } catch (error) {
    alert('Something happened')
  }
}
//find userId by room name
const findUserIdByRoom = async (room: string) => {
  try {
    const result = await fetch(`${url}getUserByRoom/`, {
      method: 'POST',
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ room }),
    })
    const data =  result.json();
    return data;
  } catch (error) {
    alert('Something happened')
  }
}


//request for searching songs. We first check if userInfo is a string or an object because the client side only has access to
// the id.
const searchNewSong = async (userInfo: User | string, search: string) => {
  try {
    let searchUrl!: string;
    if (typeof userInfo === 'string') {
      searchUrl = `${url}search/${userInfo}/${search}`
    } else {
      searchUrl = `${url}search/${userInfo.id}/${search}`
    }
    const result = await fetch(searchUrl, {
      method: "GET",
      headers: { 'Content-type': 'application/json' },
    })
    return await result.json();
  } catch (error) {
    alert('Something happened')
  }
}

//request for people to add a song to the playlist:
const addingSong = async (userId: string, song: SelectedSong) => {
  try {
    const result = await fetch(`${url}addSong/${userId}`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ 'song': song })
    })
    return await result.json();
  } catch (error) {
    alert('Something happened')
  }
}

const deletingSong = async (userId: string, song: SelectedSong) => {
  try {
    const result = await fetch(`${url}deleteSong/${userId}`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ 'song': song })
    })
    return await result.json();
  } catch (error) {
    alert('Something happened')
  }
}

const removeHost = async (userInfo: User) => {
  try {
    const result = await fetch(`${url}logout/`,{
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ 'user': userInfo.id })
    })
   const json =  await result.json();
   return json;
  } catch (error) {
    alert('Something happened')
  }
}

const getCurrentList = async (userId: string) => {
  const result = await fetch(`${url}getCurrentList/`,{
    method: "POST",
    headers: { 'Content-type': 'application/json' },
    body: JSON.stringify({ 'user':userId })
  })
  const json = await result.json();
  console.log(json);
  return json;
}







export {
  getNewToken, getAllPlaylistFromUser, getExistingPlaylist, getNewPlaylist, saveNewPassword,
  searchNewSong, addingSong, checkPassword, changeRoomName, findUserIdByRoom, deletingSong, removeHost, getCurrentList
}