import fetch from "node-fetch";
import bcrypt from "bcrypt";
import db from "../model/model.js";


const baseURL = "https://api.spotify.com/v1";

let users = db.users;


//this function is the one we are going to use to get all the playlist from the Host id so he can then choose wich one he wants to
//use
const getPlayLists = async (req, res) => {
  try {
    const actualUserID = req.params.userID;
    const actualUser = users.find((el) => {
      return el.userId === actualUserID;
    });
    const result = await fetch(`${baseURL}/me/playlists?limit=50`, {
      method: "GET",
      headers: {
        "content-type": "application/json",
        Authorization: "Bearer " + actualUser.accessToken,
      },
    });
    const data = await result.json();
    res.status(200);
    res.send(data);
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something happened while loading all the playlists.");
  }
};
//we are going to use this function to set a password for the Socket Room that the host is creating.
const setPassword = async (req, res) => {
  try {
    const actualUserID = req.params.userID;
    const newPass = req.body;
    //we encrypt the password and save it to the current user.
    const hashedPass = await bcrypt.hash(newPass.pass, 10);
    console.log(hashedPass);
    for (let indx in users) {
      if (users[indx].userId === actualUserID) {
        users[indx].password = hashedPass;
      }
    }
    res.status(201);
    console.log(users)
    res.send("password updated");
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something happened while creating the password.");
  }
};
//we are going to use this function to set a room (that will be used by socket io) for the users.
const setRoomForHost = async (req, res) => {
  try {
    const actualUserID = req.params.userID;
    const newRoom = req.body.newRoom;
    //we first check if the room is not already in use:
    let roomAlreadyExists = false;
    for (let indx in users) {
      if (users[indx].room === newRoom) {
        roomAlreadyExists = true;
      }
    }
    if (!roomAlreadyExists) {
      for (let indx in users) {
        if (users[indx].userId === actualUserID) {
          users[indx].room = newRoom;
          //after updating the room we can break the loop since we already found the user.
          break;
        }
      }
      res.status(201);
      res.send(true);
    } else {
      //if room already exists:
      res.status(201);
      res.send(false);
    }
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something went wrong while creating the room");
  }
};
//creating a new playlist if user selects that:
const createNewPlaylist = async (req, res) => {
  try {
    const actualUserID = req.params.userID;
    const actualUser = users.find((el) => {
      return el.userId === actualUserID;
    });
    const result = await fetch(
      `${baseURL}/users/${actualUser.userId}/playlists`,
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "content-type": "application/json",
          Authorization: "Bearer " + actualUser.accessToken,
        },
        body: JSON.stringify({
          name: "New Partybeat",
          description: "New Partybeat list",
        }),
      }
    );
    const data = await result.json();
    //we save the playlist.id here so we dont have to fetch with it everytime on client side.
    for (const user of users) {
      if (user.userId === actualUserID) {
        user.playlist = data.id;
        user.addedTracks = [];
      }
    }
    res.status(201);
    res.send(data);
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something went wrong while creating a new playlist");
  }
};
//and this one is for using a playlist we already have.
const useExistingPlaylist = async (req, res) => {
  try {
    const actualUserID = req.params.userID;
    const actualUser = users.find((el) => {
      return el.userId === actualUserID;
    });
    //we are only going to save the playlist here so client won't have access to the value.
    let playlist = req.body.playlist.id;
    for (const user of users) {
      if (user.userId === actualUserID) {
        user.playlist = playlist;
      }
    }
    //we then fetch for all the tracks on the playlist. So we wont have to fetch during the add-song proccess.
    const result = await fetch(
      `${baseURL}/playlists/${playlist}/tracks?fields=items(track(name,uri,album(artists(name))))`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "content-type": "application/json",
          Authorization: "Bearer " + actualUser.accessToken,
        },
      }
    );
    const data = await result.json();
    for (const user of users) {
      if (user.userId === actualUserID) {
        user.addedTracks = [];
        //we save every fetched song inside the array with the data that we need.
        for (const track of data.items) {
          const song = {
            uri: track.track.uri,
            name: track.track.name,
            artist: track.track.album.artists[0].name,
            userWhoAdded: actualUser._id,
          };
          user.addedTracks.push(song);
        }
      }
    }
    res.status(200);
    res.send(true);
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something went wrong during the playlist selection.");
  }
};

//we want the host to be able to remove his data from the backend so noone is able to push more songs.
const logout = async (req, res) => {
  try {
    const loggedUser = req.body.user;
    for (const indx in users) {
      if (users[indx].userId === loggedUser) {
        //we delete the user from the array:
        users.splice(indx, 1);
      }
    }
    res.status(201);
    res.send(true);
  } catch (error) {
    console.log(error);
    //we return false and will handle the error in the frontend
    res.send(false);
  }
};

export default {
  getPlayLists,
  createNewPlaylist,
  useExistingPlaylist,
  setPassword,
  logout,
  setRoomForHost,
};
