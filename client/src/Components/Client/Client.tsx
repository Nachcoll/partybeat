import React, { useEffect, useState, useRef } from "react";
// import io from 'socket.io-client'
import socket from "../../Services/socket";
import SearchButton from "../SearchButton/SearchButton";
import { SelectedSong } from "../../Instances/Instances";
import {
  searchNewSong,
  checkPassword,
  findUserIdByRoom,
  getCurrentList,
} from "../../Services/clientServices";
import "./Client.css";
import { v4 as uuidv4 } from "uuid";
import DeleteButton from "../DeleteButton/DeleteButton";
import logo from "../../images/logo.png";

//This is the client side. It's going to render only when the Host has already choosen the playlist and a password and
//has given the link to a friend.

const Client = () => {
  const [_id, set_id] = useState<string>(uuidv4().toString());
  const [songName, setSongName] = useState<SelectedSong[]>([]);
  const [selectedSong, setSelectedSong] = useState<SelectedSong>({
    name: undefined,
    artist: undefined,
    uri: undefined,
    userWhoAdded: _id,
  });
  const [deleteSong, setDeleteSong] = useState<SelectedSong>({
    name: undefined,
    artist: undefined,
    uri: undefined,
    userWhoAdded: _id,
  });
  const [addedSong, setAddedSong] = useState<SelectedSong[]>([]);
  const [access, setAccess] = useState<boolean>(false);
  const [hostId, setHostId] = useState<string>("");

  const addedSongsRef = useRef<HTMLLIElement>(null);
  const scrollToBottom = () => {
    if (addedSongsRef.current !== null) {
      addedSongsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };
  useEffect(scrollToBottom, [addedSong]);

  //we take the hostID from the params and it's what we are going to use for fetching for new songs once the password is correct.
  const title = decodeURI(window.location.pathname.substring(6));

  //When page loads we want to join the socket IO room and we want to check the password from the host

  const onLoad = async () => {
    const old_id = JSON.parse(sessionStorage.getItem("_id") || "{}");
    const previousAccess = JSON.parse(sessionStorage.getItem("access") || "{}");
    const sessionSongs = JSON.parse(sessionStorage.getItem("songList") || "{}");
    if (!old_id._id) {
      sessionStorage.setItem("_id", JSON.stringify({ _id }));
    } else {
      set_id(old_id._id);
      previousAccess.access && setAccess(previousAccess.access);
      sessionSongs.songs.length > 0 && setAddedSong([...sessionSongs.songs]);
    }
    const result = await findUserIdByRoom(title);
    setHostId(result);
  };

  useEffect(() => {
    onLoad();
  }, []);

  useEffect(() => {
    if (hostId !== "") {
      socket.emit("join_room", hostId);
    }
    if (hostId !== "") {
      getCurrentList(hostId).then((data) => {
        data = data.songList.flat();
        setAddedSong([...data]);
      });
    }
  }, [hostId]);

  //this hook works the same way than for the host. Is just updating the songs we decide to add in socket IO and rendering them.
  useEffect(() => {
    if (selectedSong.name !== undefined) {
      socket.emit("send_search", { selectedSong, room: hostId });
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== selectedSong.name);
        return [...arr, selectedSong];
      });
      sessionStorage.removeItem("songList");
      sessionStorage.setItem("songList", JSON.stringify({ songs: addedSong }));
    }
  }, [selectedSong]);

  //just like in the host part. We are reciving from Socket IO all the songs that are added and we are rendering them.
  useEffect(() => {
    socket.on("receive_data", (data) => {
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== data.name);
        return [...arr, data];
      });
      socket.removeAllListeners();
    });
    sessionStorage.removeItem("songList");
    sessionStorage.setItem("songList", JSON.stringify({ songs: addedSong }));
  }, [socket, addedSong, selectedSong]);

  //FOR DELETE:

  useEffect(() => {
    if (deleteSong.name !== undefined) {
      const room = hostId;
      socket.emit("send_delete", { deleteSong, room });
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== deleteSong.name);
        return [...arr];
      });
    }
  }, [deleteSong]);

  useEffect(() => {
    socket.on("deleted_data", async (data) => {
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== data.name);
        return [...arr];
      });
      socket.removeAllListeners();
    });
  }, [socket, addedSong, deleteSong]);

  //Here we check the password. This is wrong since we are fetching it from backend instead of pushing the tryout.
  const checkPass = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pass = (e.target as HTMLFormElement).pass.value;
    const attempt = await checkPassword(hostId, pass);
    //if host puts no password you should be able to join:
    if (attempt === true) {
      setAccess(true);
      sessionStorage.setItem("access", JSON.stringify({ access: true }));
    } else {
      alert("Wrong password");
    }
  };

  //Here we search for a new item and render the results. Just like in Host side.
  const sendSearch = async (e: React.MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setSongName([]);
      const searchString = (e.target as HTMLFormElement).searchString.value;
      const searchResult = await searchNewSong(hostId, searchString);
      for (const song of searchResult.tracks.items) {
        const item = {
          name: song.name,
          artist: song.artists[0].name,
          uri: song.uri,
          userWhoAdded: _id,
        };
        setSongName((prev) => [...prev, item]);
      }
    } catch (error) {
      alert("something happended during the search");
    }
  };

  return (
    <div className="container">
      <img src={logo} className="miniLogoClient"></img>
      <div className="title">
        <h3>{title}'s Partybeat</h3>
      </div>
      {!access && (
        <div className="passChecker">
          <form onSubmit={checkPass}>
            <input name="pass" placeholder="Password"></input>
            <button type="submit">Join</button>
          </form>
        </div>
      )}
      {access && (
        <div className="clientContainer">
          <div className="addedSongsList typeClient">
            <ul>
              {addedSong.map((song, index) => {
                return (
                  <li className="songRow" ref={addedSongsRef} key={index}>
                    Added&nbsp;
                    <div className="addedSong">{song.name}&nbsp;</div>by
                    <div className="addedArtist">&nbsp;{song.artist}&nbsp;</div>
                    <div className="deleteContainer">
                      {song.userWhoAdded === _id ? (
                        <DeleteButton
                          userId={hostId}
                          song={song}
                          key={index}
                          setDeleteSong={setDeleteSong}
                        ></DeleteButton>
                      ) : (
                        <></>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
          <div className="searchMenu">
            <form onSubmit={sendSearch}>
              <input
                name="searchString"
                placeholder="Song / artist name"
              ></input>
              <button type="submit">Search</button>
            </form>
            <div className="searchButtonsContainer">
              {songName &&
                songName.map((song, index) => {
                  return (
                    <SearchButton
                      song={song}
                      key={index}
                      userId={hostId}
                      setSelectedSong={setSelectedSong}
                    ></SearchButton>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Client;
