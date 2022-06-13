import dotenv from "dotenv";
import fetch from "node-fetch";
import db from "../model/model.js";
dotenv.config();

const baseURL = "https://api.spotify.com/v1";
//clientID and clientSecret are inside .env file.
const clientID = process.env.CLIENT_ID;
const clientSecret = process.env.CLIENT_SECRET;

let user = {};
let users = db.users;

const login = async (req, res) => {
  //first thing we do in login is creating a new user.
  user = {
    accessToken: undefined,
    refreshToken: undefined,
    userId: undefined,
    playlist: undefined,
    addedTracks: [],
    password: "",
    room: "",
    _id: "",
  };
  //we redirect the frontEnd to spotify authorization
  let authorizeUrl = "https://accounts.spotify.com/authorize?";
  authorizeUrl += "client_id=" + clientID;
  authorizeUrl += "&response_type=code";
  authorizeUrl +=
    "&redirect_uri=" + "https://partybeat-nachcoll.vercel.app/menu";
  authorizeUrl += "&show_dialog=true";
  authorizeUrl +=
    "&scope=user-read-private ugc-image-upload app-remote-control user-read-email user-modify-playback-state user-read-playback-position user-library-read streaming user-read-playback-state user-read-recently-played playlist-read-collaborative playlist-modify-public playlist-read-private playlist-modify-private";
  await res.redirect(authorizeUrl);
};

//this request is the one we will use to save the token that the Host and the Clients are going to use.
const newToken = async (req, res) => {
  const code = req.body.token;
  const _id = req.body._id;
  let body = "grant_type=authorization_code";
  body += "&code=" + code;
  body += "&redirect_uri=" + "https://partybeat-nachcoll.vercel.app/menu";
  body += "&client_id=" + clientID;
  body += "&client_secret=" + clientSecret;
  //call authorizationAPI
  try {
    const authorizationAPI = await fetch(
      "https://accounts.spotify.com/api/token",
      {
        method: "POST",
        headers: {
          "Content-type": "application/x-www-form-urlencoded",
          Authorization:
            "Basic " +
            new Buffer.from(clientID + ":" + clientSecret).toString("base64"),
        },
        body: body,
      }
    );
    const aunthData = await authorizationAPI.json();
    //we check if the user already logged with a token. We don't want to update it.
    if (user.accessToken === undefined) {
      user.accessToken = aunthData.access_token;
      user.refreshToken = aunthData.refresh_token;
      user._id = _id;
    }
    const result = await fetch(`${baseURL}/me`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + user.accessToken,
      },
    });
    const data = await result.json();
    user.userId = data.id;
    //we check if user is already In and we update the values if he is
    let alreadyIn = false;
    for (let indx in users) {
      if (users[indx].userId === user.userId) {
        users[indx].accessToken = user.accessToken;
        users[indx].refreshToken = user.refreshToken;
        alreadyIn = true;
        if (users[indx]._id) user._id = users[indx]._id;
      }
    }
    //we create an object so the frontEnd does have access only to the data it needs.
    const securedUser = {
      id: data.id,
      display_name: data.display_name,
      _id: undefined,
    };
    alreadyIn ? (securedUser._id = user._id) : users.push(user);
    res.status(200);
    res.send(securedUser);
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something happened while getting the authorization from Spotify");
  }
};

export default {
  login,
  newToken,
};