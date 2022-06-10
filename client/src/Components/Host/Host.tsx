import React, { useEffect, useState, useRef } from 'react'
import socket from '../../Services/socket'
import SearchButton from '../SearchButton/SearchButton'
import { User, SelectedSong } from '../../Types/Types'
import { saveNewPassword, searchNewSong, changeRoomName, removeHost } from '../../Services/clientServices'
import svgInfo from '../../images/info.svg'
import { v4 as uuidv4 } from 'uuid';
import DeleteButton from '../DeleteButton/DeleteButton'


const _id = uuidv4().toString();

const Host = ({ userInfo }: { userInfo: User }) => {

  const [songName, setSongName] = useState<SelectedSong[]>([])
  const [selectedSong, setSelectedSong] = useState<SelectedSong>({
    name: undefined,
    artist: undefined,
    uri: undefined,
    userWhoAdded: _id,
  })
  const [deleteSong, setDeleteSong] = useState<SelectedSong>({
    name: undefined,
    artist: undefined,
    uri: undefined,
    userWhoAdded: _id,
  })
  const [addedSong, setAddedSong] = useState<SelectedSong[]>([])
  const [passGiven, setPassGiven] = useState<boolean>(false)
  const [newRoom, setNewRoom] = useState<string | undefined>(userInfo.id)

  //search bar states
  const [hovered, setHovered] = useState<boolean>(false)
  const [readOnly, setReadOnly] = useState<boolean>(false)


  const addedSongsRef = useRef<HTMLLIElement>(null)

  const scrollToBottom = () => {
    if (addedSongsRef.current !== null) {
      addedSongsRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }
  useEffect(scrollToBottom, [addedSong])

  //we want one Hook for joining the Socket IO room that eventually will be used by the rest of the users. It will appear when userInfo is
  // rendered.
  useEffect(() => {
    if (newRoom !== undefined) {
      socket.emit('join_room', userInfo.id)
    }
  }, [userInfo])

  //the other useEffect is the one that is going to render all the information that WE send to socket IO room
  useEffect(() => {
    if (selectedSong.name !== undefined) {
      const room = userInfo.id
      console.log('selectedSong', selectedSong, room)
      socket.emit('send_search', { selectedSong, room })
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== selectedSong.name)
        return [...arr, selectedSong]
      })
    }
  }, [selectedSong])
  useEffect(() => {
    //This last useEffect is the one we are going to use to render the added songs from other people.

    socket.on('receive_data', async (data) => {
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== data.name)
        return [...arr, data]
      })
      socket.removeAllListeners()
    })
  }, [socket, addedSong])

//FOR DELETE:

  useEffect(() => {
    if (deleteSong.name !== undefined) {
      const room = userInfo.id
      console.log('DELETE THIS', deleteSong, room)
      socket.emit('send_delete', { deleteSong, room })
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== deleteSong.name)
        return [...arr]
      })
    }
  }, [deleteSong])

  useEffect(() => {
    socket.on('deleted_data', async (data) => {
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== data.name)
        return [...arr]
      })
      socket.removeAllListeners()
    })
  }, [socket, deleteSong])



  //we want to be able to set a Password associated on the backend to the user so noone but our friends are able to add songs from the
  //client side.
  const setPassword = async (e: React.MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const pass = (e.target as HTMLFormElement).password.value
      await saveNewPassword(userInfo, pass);
      setPassGiven(true)
    } catch (error) {
      alert('Something happened')
    }
  }
  //Searching for a song. Then attaching it to the State and rendering the buttons with that.
  const sendSearch = async (e: React.MouseEvent<HTMLFormElement>) => {
    console.log(_id)
    try {
      e.preventDefault();
      setSongName([])
      const searchString = (e.target as HTMLFormElement).searchString.value
      const searchResult = await searchNewSong(userInfo, searchString)
      for (const song of searchResult.tracks.items) {
        const item = {
          name: song.name,
          artist: song.artists[0].name,
          uri: song.uri,
          userWhoAdded: _id,
        }
        setSongName(prev => [...prev, item])
      }
    } catch (error) {
      alert('Something happened')
    }
  }
  const handleRoomChange = async (e: any) => {
    if (e.key === 'Enter') {
      const newRoom = e.target.value
      const checkingChange = await changeRoomName(userInfo, newRoom)
      if (checkingChange) {
        setNewRoom(newRoom)
        e.target.value = encodeURI(`http://localhost:3000/room/${newRoom}`)
        setReadOnly(true);
      } else {
        alert('this room already exists')
        e.target.value = ''
      }
    }
  }

  const handleRemoveHost = async () => {
    const left = await removeHost(userInfo)
    left ? window.location.href = 'http://localhost:3000/' : alert('something went wrong')
  }

  //showing information
  const handleHoverEnter = () => {
    setHovered(true);
  }
  const handleHoverLeave = () => {
    setHovered(false);
  }
  const handleCopyButton = async () => {
    if(newRoom === userInfo.id){
      await changeRoomName(userInfo, userInfo.id)
      setNewRoom(newRoom)
      setReadOnly(true);
    }
    navigator.clipboard.writeText(
      encodeURI(`http://localhost:3000/room/${newRoom}`))
  }


  return (
    <div className="hostMenu">
      <div className="sharingContainer">
        <div className="shareMenu">
          <div className="shareBar">
            <input id="urlInput" onKeyPress={handleRoomChange} readOnly={readOnly} placeholder={`http://localhost:3000/room/${newRoom}`}></input>
            <img src={svgInfo} alt='' id="shareInfo" onMouseEnter= {handleHoverEnter} onMouseLeave= {handleHoverLeave}></img>
          </div>
          {hovered &&<span id="information">
            Select the room name you want. <br/>If you select none, your Spotify user ID will be used. <br/>
            Room name only allows alphanumeric characters.
            <br/>You won't be able to change the room after setting it.</span>}
          <button onClick={handleCopyButton}>copy</button></div>
        {passGiven === false && <form className="setPasswordForm" onSubmit={setPassword}>
          <input name="password" type="password" placeholder='Password for your playlist'></input>
          <button type='submit'>Set password</button>
        </form>}
      </div>
      <div className="addedSongsList">
        <ul>
          {addedSong.map((song, index) => {
            return <li ref={addedSongsRef} key={index} >Added&nbsp;<div className="addedSong">{song.name}&nbsp;</div>from
              <div className="addedArtist">&nbsp;{song.artist}&nbsp;</div>
              <div className="deleteContainer">to the playlist&nbsp;
              {song.userWhoAdded === _id ? <DeleteButton userId={userInfo.id} song={song} key={index} setDeleteSong={setDeleteSong}></DeleteButton>: <></>}
              </div></li>
          })}
        </ul>
      </div>
      <div className="searchMenu">
        {passGiven && <form onSubmit={sendSearch}>
          <input name='searchString' placeholder="Song / artist name"></input>
          <button type="submit">Search</button>
        </form>}
        {songName && songName.map((song, index) => { return <SearchButton song={song} key={index} userId={userInfo.id} setSelectedSong={setSelectedSong}></SearchButton> })}
      </div>
      <button className="logoutButton" onClick={handleRemoveHost}>stop sharing</button>
    </div>
  )
}

export default Host