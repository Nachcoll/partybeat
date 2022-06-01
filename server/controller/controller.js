// const XMLHttpRequest = require('xhr2');
import XMLHttpRequest from 'xhr2';
import fetch from 'node-fetch';
// const Fetch = require('node-fetch')


const baseURL = 'https://api.spotify.com/v1'
const clientID = '9591fcd7d636458cacd869a7dec3fa1b'
const clientSecret = 'd70092a35c2947a381ac02217c128927'
let accessToken;
let refreshToken;

const login = async (req, res) =>{

  let authorizeUrl = 'https://accounts.spotify.com/authorize?'
  authorizeUrl += 'client_id=' + clientID;
  authorizeUrl += '&response_type=code';
  authorizeUrl += '&redirect_uri=' + 'http://localhost:3000/test/';
  authorizeUrl += '&show_dialog=true';
  authorizeUrl += '&scope=user-read-private ugc-image-upload app-remote-control user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private'

    await res.redirect(authorizeUrl);
}


const newToken = async (req, res) => {
  const token = req.body.token;
  let body = 'grant_type=authorization_code'
  body += '&code=' + token;
  body += '&redirect_uri=' + 'http://localhost:3000/test/';
  body += '&client_id=' + clientID;
  body += '&client_secret=' + clientSecret;


  //call authorizationAPI
  let xhr = new XMLHttpRequest();
  xhr.open("POST", 'https://accounts.spotify.com/api/token', true);
  xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
  xhr.setRequestHeader('Authorization', 'Basic ' + (new Buffer.from(clientID + ':' + clientSecret).toString('base64')))
  xhr.send(body);

  xhr.onload = function() {
      const data = JSON.parse(xhr.responseText)
      console.log('data', data)

      if(accessToken === undefined){
        accessToken  = data.access_token;
      }
      if(refreshToken === undefined){
        refreshToken = data.refresh_token;
      }
      console.log('access token', accessToken)
      console.log(refreshToken)
  }
}

const getUserInfo = async (req, res) => {

  const result = await fetch('https://api.spotify.com/v1/me', {
    method: 'GET',
    headers : {
      'content-type': 'application/json',
      'Authorization': 'Bearer ' + accessToken},
  })
  const data = await result.json();
  console.log(data);
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

    xhr.onload = function() {
      const data = JSON.parse(xhr.responseText)
      if(accessToken === undefined){
        accessToken  = data.access_token;
      }
      if(refreshToken === undefined){
        refreshToken = data.refresh_token;
      }

  }
}







// module.exports = { login, newToken, getUserInfo }
export default {login, newToken, getUserInfo}
