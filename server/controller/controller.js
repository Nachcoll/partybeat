// const XMLHttpRequest = require('xhr2');
import dotenv from 'dotenv'
import fetch from 'node-fetch';
import bcrypt from 'bcrypt'
// const Fetch = require('node-fetch')
dotenv.config();

const baseURL = 'https://api.spotify.com/v1'
//clientID and clientSecret are inside .env file.
const clientID = process.env.CLIENT_ID
const clientSecret = process.env.CLIENT_SECRET


let user = {
  accessToken: undefined,
  refreshToken: undefined,
  userId: undefined,
  playlist: undefined,
  addedTracks: [],
  password: '',
  room: '',
  _id: '',
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
    room: '',
    _id: '',
  }

  let authorizeUrl = 'https://accounts.spotify.com/authorize?'
  authorizeUrl += 'client_id=' + clientID;
  authorizeUrl += '&response_type=code';
  authorizeUrl += '&redirect_uri=' + 'https://partybeat-nachcoll.vercel.app/menu';
  authorizeUrl += '&show_dialog=true';
  authorizeUrl += '&scope=user-read-private ugc-image-upload app-remote-control user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private'

  await res.redirect(authorizeUrl);
  //AFTER we should hide the code from the url.
}

const newToken = async (req, res) => {
  console.log(users);
  console.log(req.body)
  const code = req.body.token;
  const _id = req.body._id
  let body = 'grant_type=authorization_code'
  body += '&code=' + code;
  body += '&redirect_uri=' + 'https://partybeat-nachcoll.vercel.app/menu';
  body += '&client_id=' + clientID;
  body += '&client_secret=' + clientSecret;

  //call authorizationAPI
  try {
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
      user._id = _id
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
    // console.log(users);
    let alreadyIn = false;
    //we check if user is already In and we update the values if he is
    for (let indx in users) {
      if (users[indx].userId === user.userId) {
        users[indx].accessToken = user.accessToken
        users[indx].refreshToken = user.refreshToken
        alreadyIn = true;
        if(users[indx]._id) user._id = users[indx]._id
      }
    }
    console.log(user, alreadyIn)
    const securedUser = {
      id: data.id,
      display_name: data.display_name,
      _id: undefined,
    }
    alreadyIn ? securedUser._id = user._id : users.push(user)
    // console.log(users)
    res.status = 200;
    res.send(JSON.stringify(securedUser))
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }

}

const setPassword = async (req, res) => {
  try {
    const actualUserID = req.params.userID
    const newPass = req.body
    const hashedPass = await bcrypt.hash(newPass.pass, 10)
    for (let indx in users) {
      if (users[indx].userId === actualUserID) {
        users[indx].password = hashedPass
      }
    }
    res.status = 201
    res.send(JSON.stringify('password updated'))
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }
}

const checkPassword = async (req, res) => {
  try {
    const passwordAttempt = req.body.pass
    const actualUserID = req.params.userID
    const actualUser = users.find((el) => {
      return el.userId === actualUserID
    })
    if (actualUser !== undefined) {
      console.log(actualUser, passwordAttempt)
      if (actualUser.password === '' && passwordAttempt === '') {
        res.send(JSON.stringify(true))
      } else {
        const accessed = await bcrypt.compare(passwordAttempt, actualUser.password)
        accessed ? res.send(JSON.stringify(true)) : res.send(JSON.stringify(false))
      }
    } else {
      res.status = 404;
    }
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }
}

const setRoomForHost = async (req, res) => {
  try {
    const actualUserID = req.params.userID
    const newRoom = req.body.newRoom
    console.log(users);
    console.log(actualUserID, newRoom)
    let roomAlreadyExists = false;
    for (let indx in users) {
      if (users[indx].room === newRoom) {
        roomAlreadyExists = true;
      }
    }
    if (!roomAlreadyExists) {
      for (let indx in users) {
        if (users[indx].userId === actualUserID) {
          users[indx].room = newRoom
          break
        }
      }
      res.status = 201;
      res.send(JSON.stringify(true))
    } else {
      res.status = 201;
      res.send(JSON.stringify(false))
    }
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }

}

const getHostidByRoom = async (req, res) => {
  const room = req.body.room
  console.log(users)
  const actualUser = users.find((el) => {
    return el.room === room
  })
  console.log(actualUser.userId);
  res.send(JSON.stringify(actualUser.userId))
}


const getPlayLists = async (req, res) => {
  try {
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
    res.status = 200;
    res.send(JSON.stringify(data))
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }

}

//creating a new playlist if user selects that:
const createNewPlaylist = async (req, res) => {
  try {
    const actualUserID = req.params.userID
    const actualUser = users.find((el) => {
      return el.userId === actualUserID
    })
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
    //we save the playlist.id here so we dont have to fetch with it everytime on client side.
    for (const user of users) {
      if (user.userId === actualUserID) {
        user.playlist = data.id
        user.addedTracks = [];
      }
    }
    res.status = 201
    res.send(JSON.stringify(data))
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }
}

const useExistingPlaylist = async (req, res) => {
  try {
    const actualUserID = req.params.userID
    const actualUser = users.find((el) => {
      return el.userId === actualUserID
    })
    //we are only going to save the playlist here so client won't have access to the value.
    let playlist = req.body.playlist.id
    for (const user of users) {
      if (user.userId === actualUserID) {
        user.playlist = playlist
      }
    }
    console.log('entramos en fetch', playlist)
    //we then fetch for all the tracks on the playlist. So we wont have to fetch during the add-song proccess.
    const result = await fetch(`${baseURL}/playlists/${playlist}/tracks?fields=items(track(name,uri,album(artists(name))))`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'content-type': 'application/json',
        'Authorization': 'Bearer ' + actualUser.accessToken
      }
    })
    const data = await result.json();
    for (const user of users) {
      if (user.userId === actualUserID) {
        user.addedTracks = [];
        for (const track of data.items) {
          const song = {
            uri: track.track.uri,
            name: track.track.name,
            artist: track.track.album.artists[0].name,
            userWhoAdded: actualUser._id
          }
          console.log(song);
          // user.addedTracks.push(track.track.uri)
          user.addedTracks.push(song)
        }
      }
    }
    res.status = 200
    res.send(JSON.stringify(true))
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }

}

//search for new track / artist

const searchItem = async (req, res) => {
  try {
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
    res.status = 202
    res.send(JSON.stringify(data))
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }

}

//ADDING SONG TO PLAYLIST
const addSong = async (req, res) => {
  try {
    const Addedsong = req.body.song
    const actualUserID = req.params.userID
    const actualUser = users.find((el) => {
      return el.userId === actualUserID
    })
    //find if the song is already in
    const alreadyIn = actualUser.addedTracks.some((song) => {
      return song.uri === Addedsong.uri
    })

    if (alreadyIn === false) {
      // console.log('hacemos el famoso fetch', actualUserID, actualUser.playlist)
      const result = await fetch(`${baseURL}/playlists/${actualUser.playlist}/tracks?uris=${Addedsong.uri}`, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + actualUser.accessToken
        },
      })
      const data = await result.json();
      console.log('respuesta de fetch a spotify', data)
      //we save the new song
      for (const user of users) {
        if (user.userId === actualUserID) {
          user.addedTracks.push(Addedsong)
        }
      }
      res.status = 201
      res.send(JSON.stringify(data))
    } else {
      res.status = 406
      res.send(JSON.stringify('this song was already in the list'))
    }
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }

}

//DELETE SONG:
const deleteSong = async (req, res) => {
  try {
    const deleteSong = req.body.song
    const actualUserID = req.params.userID
    const actualUser = users.find((el) => {
      return el.userId === actualUserID
    })
    //find if the song is already in
    const alreadyIn = actualUser.addedTracks.some((song) => {
      return song.uri === deleteSong.uri
    })

    if (alreadyIn === true) {
      // console.log('hacemos el famoso fetch', actualUserID, actualUser.playlist)
      const result = await fetch(`${baseURL}/playlists/${actualUser.playlist}/tracks`, {
        method: 'DELETE',
        headers: {
          'Accept': 'application/json',
          'content-type': 'application/json',
          'Authorization': 'Bearer ' + actualUser.accessToken
        },
        body: JSON.stringify({ "tracks": [{ "uri": deleteSong.uri }] })
      })
      const data = await result.json();
      console.log('respuesta de DELETE a spotify', data)
      //we save the new song
      for (const user of users) {
        if (user.userId === actualUserID) {
          const newTracks = user.addedTracks.filter((el) => {
            return el.uri !== deleteSong.uri
          })
          user.addedTracks = newTracks
        }
      }
      res.status = 201
      res.send(JSON.stringify(data))
    } else {
      res.status = 406
      res.send(JSON.stringify('this was already deleted'))
    }
  } catch (error) {
    res.status = 500;
    res.send(JSON.stringify('Something happened'))
  }
}

const logout = async (req, res) => {
  try {
    const loggedUser = req.body.user
    for (const indx in users) {
      if (users[indx].userId === loggedUser) {
        users.splice(indx, 1)
      }
    }
    res.status = 201;
    res.send(JSON.stringify(true))
  } catch (error) {
    console.log(error);
    res.send(JSON.stringify(false))
  }
}

const getCurrentList = async (req, res) => {
  try {
    const actualUserID = req.body.user
    const songList = []
    for (const user of users) {
      if (user.userId === actualUserID) {
        songList.push(user.addedTracks)
      }}
      res.status = 200
    res.send(JSON.stringify({songList}))
  } catch (error) {
    console.log(error);
    res.send(JSON.stringify('Something happened'))
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
export default {
  login, newToken, searchItem, getPlayLists, createNewPlaylist,
  useExistingPlaylist, addSong, setPassword, checkPassword, setRoomForHost, getHostidByRoom, deleteSong, logout, getCurrentList
}
