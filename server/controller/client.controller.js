
import bcrypt from "bcrypt";
import db from "../model/model.js";

let users = db.users;

//we are going to use this function to check if the password that a "client" used to join the host's room was correct.
const checkPassword = async (req, res) => {
  try {
    const passwordAttempt = req.body.pass;
    //find the Host
    const actualUserID = req.params.userID;
    const actualUser = users.find((el) => {
      return el.userId === actualUserID;
    });
    if (actualUser !== undefined) {
      //if password is empty aka no password
      if (actualUser.password === "" && passwordAttempt === "") {
        res.send(true);
      } else {
        const accessed = await bcrypt.compare(
          passwordAttempt,
          actualUser.password
        );
        accessed ? res.send(true) : res.send(false);
      }
      //if the user is undefined: (means the Host logged out)
    } else {
      res.status(404);
    }
  } catch (error) {
    res.status(500);
    console.log(error);
    res.send("Error while checking the password.");
  }
};

//this function is used by the clients to get the hostID and connect to him. We do this because we are actually using the
//Host ID as room for socket. We only use the room that the host writes on the input for the "title" in client component in frontend.
const getHostidByRoom = async (req, res) => {
  try {
    const room = req.body.room;
    console.log(room.toString(), users);
    const actualUser = users.find((el) => {
      console.log(el.room, 'la room?', room, room.toString())
      return el.room === room.toString();
    });
    res.status(200)
    res.send(actualUser.userId);
  } catch (error) {
    res.status(400);
    res.send('error while checking host id')
  }
};
//we use this function everytime someone logs. We want the clients to see the songs that were added before he logged.
//we are just going to create an Array with the songs and will send it to render.
const getCurrentList = async (req, res) => {
  try {
    const actualUserID = req.body.user;
    const songList = [];
    for (const user of users) {
      if (user.userId === actualUserID) {
        songList.push(user.addedTracks);
      }
    }
    res.status(200);
    res.send({ songList });
  } catch (error) {
    console.log(error);
    res.send("Something happened while loading the songs.");
  }
};

export default {
  checkPassword,
  getHostidByRoom,
  getCurrentList,
};