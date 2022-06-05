// const XMLHttpRequest = require('xhr2');
import XMLHttpRequest from 'xhr2';
import fetch from 'node-fetch';
// const Fetch = require('node-fetch')

const baseURL = 'https://api.spotify.com/v1'
const clientID = '9591fcd7d636458cacd869a7dec3fa1b'
const clientSecret = 'd70092a35c2947a381ac02217c128927'

let user = {
  accessToken: undefined,
  refreshToken: undefined,
  userId: undefined,
  playlist: undefined,
  addedTracks: [],
  password: '',
}
const users = []

const login = async (req, res) => {
  user = {
    accessToken: undefined,
    refreshToken: undefined,
    userId: undefined,
    playlist: undefined,
    addedTracks: [],
    password: '',
  }

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
  const authorizationAPI = await fetch('https://accounts.spotify.com/api/token', {
    method: "POST",
    headers: {
      'Content-type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + (new Buffer.from(clientID + ':' + clientSecret).toString('base64'))
    },
    body: body
  })
  const aunthData = await authorizationAPI.json()
  if (user.accessToken === undefined) {
    user.accessToken = aunthData.access_token;
    user.refreshToken = aunthData.refresh_token;
  }

  const result = await fetch(`${baseURL}/me`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + user.accessToken
    },
  })
  const data = await result.json();
  user.userId = data.id

  //for a reason only god knows, spotify login executes 2 times, that's why length of user might be 1 and still be ok.
  if (users.length <= 1) {
    users.push(user)
  } else {
    //if SAME HOST connects again we update the token.
    for (let indx in users) {
      if (users[indx].userId === user.userId) {
        users[indx].accessToken = user.accessToken
        users[indx].refreshToken = user.refreshToken
      }
    }
  }
  // console.log(users)
  res.send(JSON.stringify(data))
}

const setPassword = async (req, res) => {
  const actualUserID = req.params.userID
  const newPass = req.body
  console.log(newPass)
  for(let indx in users){
    if (users[indx].userId === actualUserID) {
      users[indx].password = newPass
    }
  }
res.send(JSON.stringify('password updated'))
}

const checkPassword = async (req, res) => {
  const actualUserID = req.params.userID
  const actualUser = users.find((el) => {
    return el.userId === actualUserID
  })
  res.send(JSON.stringify(actualUser.password))
}


const getPlayLists = async (req, res) => {
  const actualUserID = req.params.userID
  const actualUser = users.find((el) => {
    return el.userId === actualUserID
  })
  // console.log('actualUser', actualUser)
  const result = await fetch(`${baseURL}/me/playlists?limit=50`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + actualUser.accessToken
    },
  })
  const data = await result.json();
  // console.log(data);
  res.send(JSON.stringify(data))
}

//creating a new playlist if user selects that:
const createNewPlaylist = async (req, res) => {
  const actualUserID = req.params.userID
  // console.log('useeeeeeeeeeeeeeeeeeersssssssssssssssssssss', users);
  const actualUser = users.find((el) => {
    return el.userId === actualUserID
  })
  // console.log('actualUser', actualUser)
  const result = await fetch(`${baseURL}/users/${actualUser.userId}/playlists`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + actualUser.accessToken
    },
    body: JSON.stringify({
      'name': 'New Partybeat',
      'description': 'New Partybeat list',
    })
  })

  const data = await result.json();
  // console.log(data);
  //we save the playlist.id here so we dont have to fetch with it everytime on client side.
  for (const user of users) {
    if (user.userId === actualUserID) {
      user.playlist = data.id
    }
  }
  // console.log(users)
  res.send(JSON.stringify(data))
}

const useExistingPlaylist = async (req, res) => {
  const actualUserID = req.params.userID
  const actualUser = users.find((el) => {
    return el.userId === actualUserID
  })

  //we are only going to save the playlist here so client won't have access to the value.
  let playlist = req.body.playlist[0].id
  for (const user of users) {
    if (user.userId === actualUserID) {
      user.playlist = playlist
    }
  }
//we then fetch for all the tracks on the playlist. So we wont have to fetch during the add-song proccess.
  const result = await fetch(`${baseURL}/playlists/${playlist}/tracks?fields=items(track(uri))`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + actualUser.accessToken
    }})

    const data = await result.json();

    for (const user of users) {
      if (user.userId === actualUserID) {
        for(const track of data.items){
          user.addedTracks.push(track.track.uri)
        }
      }
      // console.log(user)
    }

}

//search for new track / artist

const searchItem = async (req, res) => {
  const actualUserID = req.params.userID
  const actualUser = users.find((el) => {
    return el.userId === actualUserID
  })
  const searchString = req.params.string

  // console.log(searchString)

  const result = await fetch(`${baseURL}/search?q=${searchString}&type=track&limit=5`, {
    method: 'GET',
    headers: {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + actualUser.accessToken
    },
  })
  const data = await result.json();
  res.send(JSON.stringify(data))
}

//ADDING SONG TO PLAYLIST
const addSong = async (req, res) => {
  const songUri = req.body.song.uri
  const actualUserID = req.params.userID
  const actualUser = users.find((el) => {
    return el.userId === actualUserID
  })
  //find if the song is already in
  const alreadyIn = actualUser.addedTracks.some((song) => {
    return song === songUri})

  if(alreadyIn === false){
  const result = await fetch(`${baseURL}/playlists/${actualUser.playlist}/tracks?uris=${songUri}`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + actualUser.accessToken
    },
  })
  const data = await result.json();
  //we save the new song
  for (const user of users) {
    if (user.userId === actualUserID) {
        user.addedTracks.push(songUri)
      }
  }
  res.send(JSON.stringify(data))
} else{
  res.send(JSON.stringify('this song was already in the list'))
}
}



//function for refreshing the token, not tested:
// const refreshAccessToken = async () => {
//   let body = 'grant_type=refresh_token'
//   body += '&refresh_token=' + refreshToken;
//   body += '&client_id=' + clientID;
//   accessToken = undefined;
//   refreshToken = undefined;

//   //call authorizationAPI
//   let xhr = new XMLHttpRequest();
//   xhr.open("POST", 'https://accounts.spotify.com/api/token', true);
//   xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
//   xhr.setRequestHeader('Authorization', 'Basic ' + (new Buffer.from(clientID + ':' + clientSecret).toString('base64')))
//   xhr.send(body);

//   xhr.onload = function () {
//     const data = JSON.parse(xhr.responseText)
//     if (accessToken === undefined) {
//       accessToken = data.access_token;
//     }
//     if (refreshToken === undefined) {
//       refreshToken = data.refresh_token;
//     }

//   }
// }







// module.exports = { login, newToken, getUserInfo }
export default { login, newToken, searchItem, getPlayLists, createNewPlaylist, useExistingPlaylist, addSong, setPassword, checkPassword }
