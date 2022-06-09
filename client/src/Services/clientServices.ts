import { User, Playlist, SelectedSong } from "../Types/Types";

//request for Host user info:
const getNewToken = async (token: string) => {
  try {
    const result = await fetch('http://localhost:8000/newToken', {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ token })
    })
    const data = await result.json();
    return data
  } catch (error) {
    alert('Something happened')
  }
}
//request for Host user playlists so he can choose which playlist he wants to modify:
const getAllPlaylistFromUser = async (userInfo: User) => {
  try {
    const playlistOptions = await fetch(`http://localhost:8000/infoPL/${userInfo.id}`, {
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
    const useExistingPlaylist = await fetch(`http://localhost:8000/useExistingPlaylist/${userInfo.id}`, {
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
    const newPlayList = await fetch(`http://localhost:8000/createPlaylist/${userInfo.id}`, {
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
    const result = await fetch(`http://localhost:8000/setPass/${userInfo.id}`, {
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
    const result = await fetch(`http://localhost:8000/checkPass/${userInfo}`, {
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
const changeRoomName = async (userInfo: User, newRoom: string) => {
  try {
    const result = await fetch(`http://localhost:8000/setNewRoom/${userInfo.id}`, {
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
    const result = await fetch(`http://localhost:8000/getUserByRoom/`, {
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
    let url!: string;
    if (typeof userInfo === 'string') {
      url = `http://localhost:8000/search/${userInfo}/${search}`
    } else {
      url = `http://localhost:8000/search/${userInfo.id}/${search}`
    }
    const result = await fetch(url, {
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
    const result = await fetch(`http://localhost:8000/addSong/${userId}`, {
      method: "POST",
      headers: { 'Content-type': 'application/json' },
      body: JSON.stringify({ 'song': song })
    })
    return await result.json();
  } catch (error) {
    alert('Something happened')
  }

}





export {
  getNewToken, getAllPlaylistFromUser, getExistingPlaylist, getNewPlaylist, saveNewPassword,
  searchNewSong, addingSong, checkPassword, changeRoomName, findUserIdByRoom
}