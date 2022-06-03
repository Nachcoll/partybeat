// const XMLHttpRequest = require('xhr2');
import XMLHttpRequest from 'xhr2';
import fetch from 'node-fetch';
// const Fetch = require('node-fetch')

const baseURL = 'https://api.spotify.com/v1'
const clientID = '9591fcd7d636458cacd869a7dec3fa1b'
const clientSecret = 'd70092a35c2947a381ac02217c128927'
let accessToken;
let refreshToken;
let userId;
let playlist;

const login = async (req, res) => {

  let authorizeUrl = 'https://accounts.spotify.com/authorize?'
  authorizeUrl += 'client_id=' + clientID;
  authorizeUrl += '&response_type=code';
  authorizeUrl += '&redirect_uri=' + 'http://localhost:3000/menu';
  authorizeUrl += '&show_dialog=true';
  authorizeUrl += '&scope=user-read-private ugc-image-upload app-remote-control user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private'

  await res.redirect(authorizeUrl);
}


const newToken = async (req, res) => {
  const token = req.body.token;
  let body = 'grant_type=authorization_code'
  body += '&code=' + token;
  body += '&redirect_uri=' + 'http://localhost:3000/menu';
  body += '&client_id=' + clientID;
  body += '&client_secret=' + clientSecret;


  //call authorizationAPI
  let xhr = new XMLHttpRequest();
  xhr.open("POST", 'https://accounts.spotify.com/api/token', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + (new Buffer.from(clientID + ':' + clientSecret).toString('base64')))
  xhr.send(body);

  xhr.onload = function () {
    const data = JSON.parse(xhr.responseText)
    // console.log('data', data)

    if (accessToken === undefined) {
      accessToken = data.access_token;
    }
    if (refreshToken === undefined) {
      refreshToken = data.refresh_token;
    }
    // console.log('access token', accessToken)
    // console.log(refreshToken)
  }
}

const getUserInfo = async (req, res) => {

  const result = await fetch(`${baseURL}/me`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  })
  const data = await result.json();
  console.log(data);
  userId = data.id
  res.send(JSON.stringify(data))
}

const getPlayLists = async (req, res) => {
  const result = await fetch(`${baseURL}/me/playlists?limit=50`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  })
  const data = await result.json();
  // console.log(data);
  res.send(JSON.stringify(data))
}
//creating a new playlist if user selects that:
const createNewPlaylist = async (req, res) => {
  console.log(userId)
  const result = await fetch(`${baseURL}/users/${userId}/playlists`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
    body: JSON.stringify({
      'name': 'New Partybeat',
      'description': 'New Partybeat list',
    })
  })

  const data = await result.json();
  console.log(data);
  //we save the playlist.id here so we dont have to fetch with it everytime on client side.
  playlist = data.id
  res.send(JSON.stringify(data))
}
const useExistingPlaylist = async (req, res) => {
  //we are only going to save the playlist here so client won't have access to the value.
  playlist = req.body.playlist[0].id
}

//search for new track / artist

const searchItem = async (req, res) => {

  const searchString = req.params.string

  console.log(searchString)

  const result = await fetch(`${baseURL}/search?q=${searchString}&type=track&limit=5`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  })
  const data = await result.json();
  res.send(JSON.stringify(data))
}

//ADDING SONG TO PLAYLIST
const addSong = async(req, res) =>{
  const songUri = req.body.song.uri
  const result = await fetch(`${baseURL}/playlists/${playlist}/tracks?uris=${songUri}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + accessToken
    },
  })
  const data = await result.json();
  res.send(JSON.stringify(data))
}






//function for refreshing the token, not tested:
const refreshAccessToken = async () => {
  let body = 'grant_type=refresh_token'
  body += '&refresh_token=' + refreshToken;
  body += '&client_id=' + clientID;
  accessToken = undefined;
  refreshToken = undefined;

  //call authorizationAPI
  let xhr = new XMLHttpRequest();
  xhr.open("POST", 'https://accounts.spotify.com/api/token', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + (new Buffer.from(clientID + ':' + clientSecret).toString('base64')))
  xhr.send(body);

  xhr.onload = function () {
    const data = JSON.parse(xhr.responseText)
    if (accessToken === undefined) {
      accessToken = data.access_token;
    }
    if (refreshToken === undefined) {
      refreshToken = data.refresh_token;
    }

  }
}







// module.exports = { login, newToken, getUserInfo }
export default { login, newToken, getUserInfo, searchItem, getPlayLists, createNewPlaylist, useExistingPlaylist, addSong }
