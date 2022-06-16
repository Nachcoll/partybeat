import fetch from "node-fetch";
import db from "../model/model.js";


const baseURL = "https://api.spotify.com/v1";

let users = db.users;


//SEARCH for new track / artist. This function is going to be used more than once (hopefully)
const searchItem = async (req, res) => {
  try {
    const actualUserID = req.params.userID;
    const actualUser = users.find((el) => {
      return el.userId === actualUserID;
    });
    const searchString = req.params.string;
    //we limit the search to 5 in the query.
    const result = await fetch(
      `${baseURL}/search?q=${searchString}&type=track&limit=5`,
      {
        method: "GET",
        headers: {
          "content-type": "application/json",
          Authorization: "Bearer " + actualUser.accessToken,
        },
      }
    );
    const data = await result.json();
    res.status(202);
    res.send(data);
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something happened");
  }
};

//ADDING SONG TO PLAYLIST
const addSong = async (req, res) => {
  try {
    const Addedsong = req.body.song;
    const actualUserID = req.params.userID;
    const actualUser = users.find((el) => {
      return el.userId === actualUserID;
    });
    //find if the song is already in the playlist:
    const alreadyIn = actualUser.addedTracks.some((song) => {
      return song.uri === Addedsong.uri;
    });
    //if not added yet
    if (alreadyIn === false) {
      const result = await fetch(
        `${baseURL}/playlists/${actualUser.playlist}/tracks?uris=${Addedsong.uri}`,
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "content-type": "application/json",
            Authorization: "Bearer " + actualUser.accessToken,
          },
        }
      );
      const data = await result.json();
      //we save also save the new song in our user array.
      for (const user of users) {
        if (user.userId === actualUserID) {
          user.addedTracks.push(Addedsong);
        }
      }
      res.status(201);
      res.send(data);
    } else {
      //if already added
      res.status(406);
      res.send("this song was already in the list");
    }
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something happened while adding a song");
  }
};

//DELETE SONG:
const deleteSong = async (req, res) => {
  try {
    //find the user:
    const deleteSong = req.body.song;
    const actualUserID = req.params.userID;
    const actualUser = users.find((el) => {
      return el.userId === actualUserID;
    });
    //check if the song is in
    const alreadyIn = actualUser.addedTracks.some((song) => {
      return song.uri === deleteSong.uri;
    });

    if (alreadyIn === true) {
      const result = await fetch(
        `${baseURL}/playlists/${actualUser.playlist}/tracks`,
        {
          method: "DELETE",
          headers: {
            Accept: "application/json",
            "content-type": "application/json",
            Authorization: "Bearer " + actualUser.accessToken,
          },
          body: JSON.stringify({ tracks: [{ uri: deleteSong.uri }] }),
        }
      );
      const data = await result.json();
      //we delete the song from the user array:
      for (const user of users) {
        if (user.userId === actualUserID) {
          const newTracks = user.addedTracks.filter((el) => {
            return el.uri !== deleteSong.uri;
          });
          user.addedTracks = newTracks;
        }
      }
      res.status(201);
      res.send(data);
    } else {
      //if we didn't find the song:
      res.status(406);
      res.send("this was already deleted");
    }
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Something happened while deleting this track");
  }
};



export default {
  searchItem,
  addSong,
  deleteSong,

};
