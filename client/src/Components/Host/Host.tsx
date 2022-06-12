import React, { useEffect, useState, useRef } from 'react'
import socket from '../../Services/socket'
import SearchButton from '../SearchButton/SearchButton'
import { SelectedSong, HostProps } from '../../Types/Types'
import { saveNewPassword, searchNewSong, changeRoomName, removeHost, getCurrentList } from '../../Services/clientServices'
import svgInfo from '../../images/info.svg'
import DeleteButton from '../DeleteButton/DeleteButton'

const rootUrl = `https://partybeat-nachcoll.vercel.app/`

//??? maybe we dont sent _id but we take it from storage, same for userinfo actually

const Host = ({ userInfo, _id, set_id }: HostProps) => {

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

  useEffect(() => {
    //onload / refresh
    const sessionRoom = JSON.parse(sessionStorage.getItem('selectedRoom') || '{}');
    const sessionPass = JSON.parse(sessionStorage.getItem('passGiven') || '{}');
    const sessionSongs = JSON.parse(sessionStorage.getItem('songList') || '{}');

    if (sessionRoom.room) {
      setNewRoom(sessionRoom.room)
      setReadOnly(sessionRoom.readOnly)
      sessionPass.passGiven && setPassGiven(true);
      if (sessionSongs._id) {
        console.log(sessionSongs._id)
        setAddedSong([...sessionSongs.songs])
        set_id(sessionSongs._id)
      }
    }
  }, [])
  //we want one Hook for joining the Socket IO room that eventually will be used by the rest of the users. It will appear when userInfo is
  // rendered.
  useEffect(() => {
    if (newRoom !== undefined) {
      socket.emit('join_room', userInfo.id)
    }
    if (userInfo.id !== undefined) {
      console.log(userInfo.id)
      getCurrentList(userInfo.id).then((data) => {
        data = data.songList.flat()
        console.log(data[0].userWhoAdded)
        console.log(_id)
        setAddedSong([...data])
      })
      // console.log(data);
    }
  }, [userInfo])

  //the other useEffect is the one that is going to render all the information that WE send to socket IO room
  useEffect(() => {
    console.log('useEffect', selectedSong)
    if (selectedSong.name !== undefined) {
      const room = userInfo.id
      console.log('selectedSong', selectedSong, room)
      socket.emit('send_search', { selectedSong, room })
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== selectedSong.name)
        return [...arr, selectedSong]
      })
      sessionStorage.removeItem('songList')
      sessionStorage.setItem('songList', JSON.stringify({ _id: _id, songs: addedSong }))
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
    sessionStorage.removeItem('songList')
    sessionStorage.setItem('songList', JSON.stringify({ _id: _id, songs: addedSong }))
  }, [socket, , selectedSong, addedSong])

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
  }, [socket, deleteSong, addedSong])



  //we want to be able to set a Password associated on the backend to the user so noone but our friends are able to add songs from the
  //client side.
  const setPassword = async (e: React.MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      const pass = (e.target as HTMLFormElement).password.value
      await saveNewPassword(userInfo, pass);
      setPassGiven(true)
      sessionStorage.setItem('passGiven', JSON.stringify({ passGiven: true }))
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
        e.target.value = encodeURI(`${rootUrl}room/${newRoom}`)
        setReadOnly(true);
        sessionStorage.setItem('selectedRoom', JSON.stringify({ room: newRoom, readOnly: true }))
      } else {
        alert('this room already exists')
        e.target.value = ''
      }
    }
  }

  //showing information
  const handleHoverEnter = () => {
    setHovered(true);
  }
  const handleHoverLeave = () => {
    setHovered(false);
  }
  const handleCopyButton = async () => {
    //HERE what we actually do is checking if the input has been manipulated either in a previous session or by the host in the current
    //session. If it hasn't been it means that the host, on his first session, wants to use the default ID as Room name.
    if (!readOnly) {
      await changeRoomName(userInfo, userInfo.id)
      setNewRoom(newRoom)
      setReadOnly(true);
      sessionStorage.setItem('selectedRoom', JSON.stringify({ room: newRoom, readOnly: true }))
    }
    navigator.clipboard.writeText(
      encodeURI(`${rootUrl}room/${newRoom}`))
  }

  const changePlaylist = () => {
    sessionStorage.removeItem('playlistSelected')
    window.location.href = `${rootUrl}menu`
  }
  const handleRemoveHost = async () => {
    const left = await removeHost(userInfo)
    sessionStorage.clear()
    left ? window.location.href = `${rootUrl}` : alert('something went wrong')
  }


  return (
    <>
      <div className="hostMenu">
        <div className="sharingContainer">
          <div className="shareMenu">
            {/* THIS readOnly causes a warning error in console but we know it :) */}
            {readOnly ? <div className="shareBar">
              <input id="urlInput" onKeyPress={handleRoomChange} readOnly={true} value={`${rootUrl}room/${newRoom}`}></input>
              <img src={svgInfo} alt='' id="shareInfo" onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave}></img>
            </div>
              :
              <div className="shareBar">
                <input id="urlInput" onKeyPress={handleRoomChange} readOnly={readOnly} placeholder={`${rootUrl}room/${newRoom}`}></input>
                <img src={svgInfo} alt='' id="shareInfo" onMouseEnter={handleHoverEnter} onMouseLeave={handleHoverLeave}></img>
              </div>}
            {hovered && <span id="information">
              Select the room name you want. <br />If you select none, your Spotify user ID will be used. <br />
              Room name only allows alphanumeric characters.
              <br />You won't be able to change the room after setting it.</span>}
            <button onClick={handleCopyButton}>copy</button></div>
          {passGiven === false && <form className="setPasswordForm" onSubmit={setPassword}>
            <input name="password" type="password" placeholder='Password for your playlist'></input>
            <button type='submit'>Set password</button>
          </form>}
        </div>
        {passGiven && <div className="addedSongsList typeHost">
          <ul>
            {addedSong.map((song, index) => {
              return <li className="songRow" ref={addedSongsRef} key={index} >Added&nbsp;<div className="addedSong">{song.name}&nbsp;</div>by
                <div className="addedArtist">&nbsp;{song.artist}&nbsp;</div>
                <div className="deleteContainer">
                  {song.userWhoAdded === _id ? <DeleteButton userId={userInfo.id} song={song} key={index} setDeleteSong={setDeleteSong}></DeleteButton> : <></>}
                </div></li>
            })}
          </ul>
        </div>}
        <div className="searchMenu">
          {passGiven && <form onSubmit={sendSearch}>
            <input name='searchString' placeholder="Song / artist name"></input>
            <button type="submit">Search</button>
          </form>}
          <div className="searchButtonsContainer">
            {songName && songName.map((song, index) => { return <SearchButton song={song} key={index} userId={userInfo.id} setSelectedSong={setSelectedSong}></SearchButton> })}
          </div>
        </div>
      </div>

      <div className='backMenu'>
        <button className="logoutButton" onClick={handleRemoveHost}>logout</button>
        <button className="logoutButton" onClick={changePlaylist}>Change playlist</button>
      </div>
    </>
  )
}

export default Host