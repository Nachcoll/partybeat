import React, { useEffect, useState, useRef } from 'react'
import socket from '../../Services/socket'
import SearchButton from '../SearchButton/SearchButton'
import { User, SelectedSong } from '../../Types/Types'
import { saveNewPassword, searchNewSong } from '../../Services/clientServices'

const Main = ({ userInfo }: { userInfo: User }) => {

  const [songName, setSongName] = useState<SelectedSong[]>([])
  const [selectedSong, setSelectedSong] = useState<SelectedSong>({
    name: undefined,
    artist: undefined,
    uri: undefined,
  })
  const [addedSong, setAddedSong] = useState<SelectedSong[]>([])
  const [passGiven, setPassGiven] = useState<boolean>(false)


  const addedSongsRef = useRef<HTMLLIElement>(null)

  const scrollToBottom = () => {
    if(addedSongsRef.current !== null){
      addedSongsRef.current.scrollIntoView({behavior:'smooth'})
    }
  }
  useEffect(scrollToBottom,[addedSong])

  //we want one Hook for joining the Socket IO room that eventually will be used by the rest of the users. It will appear when userInfo is
  // rendered.
  useEffect(() => {
    if (userInfo.id !== undefined) {
      const room = userInfo.id;
      socket.emit('join_room', room)
      console.log(room);
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
        }
        setSongName(prev => [...prev, item])
      }
    } catch (error) {
      alert('Something happened')
    }
  }

  return (
    <div className="hostMenu">
      <div className="sharingContainer">
        <div className="shareMenu">
          <input id="urlInput" readOnly={true} value={`http://localhost:3000/room/${userInfo.id}`}></input>
          <button onClick={() => {
            navigator.clipboard.writeText(
              `http://localhost:3000/room/${userInfo.id}`
            )
          }}>copy</button></div>
        {passGiven === false && <form className="setPasswordForm" onSubmit={setPassword}>
          <input name="password" type="password" placeholder='Password for your playlist'></input>
          <button type='submit'>Set password</button>
        </form>}
      </div>
      <div className="addedSongsList">
        <ul>
          {addedSong.map((song, index) => {
            return <li ref={addedSongsRef} key={index} >Added <span className="addedSong">{song.name}</span> from
              <span className="addedArtist"> {song.artist}</span> to the playlist</li>
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
    </div>
  )
}

export default Main