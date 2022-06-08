import React, { useEffect, useState, useRef } from 'react'
// import io from 'socket.io-client'
import socket from '../../Services/socket'
import SearchButton from '../SearchButton/SearchButton'
import { SelectedSong } from '../../Types/Types'
import { searchNewSong, checkPassword } from '../../Services/clientServices'
import './Client.css'

//This is the client side. It's going to render only when the Host has already choosen the playlist and a password and
//has given the link to a friend.

const Client = () => {

  const [songName, setSongName] = useState<SelectedSong[]>([])
  const [selectedSong, setSelectedSong] = useState<SelectedSong>({
    name: undefined,
    artist: undefined,
    uri: undefined,
  })
  const [addedSong, setAddedSong] = useState<SelectedSong[]>([])
  const [access, setAccess] = useState<boolean>(false)


  const addedSongsRef = useRef<HTMLLIElement>(null)
  const scrollToBottom = () => {
    if(addedSongsRef.current !== null){
      addedSongsRef.current.scrollIntoView({behavior:'smooth'})
    }
  }
  useEffect(scrollToBottom,[addedSong])


  //we take the hostID from the params and it's what we are going to use for fetching for new songs once the password is correct.
  const hostId = window.location.pathname.substring(6)


  //When page loads we want to join the socket IO room and we want to check the password from the host
  useEffect(() => {
    socket.emit('join_room', hostId)
  }, [])

  //this hook works the same way than for the host. Is just updating the songs we decide to add in socket IO and rendering them.
  useEffect(() => {
    if (selectedSong.name !== undefined) {
      console.log(selectedSong.name, hostId)
      socket.emit('send_search', { selectedSong, hostId })
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== selectedSong.name)
        return [...arr, selectedSong]
      })
    }
  }, [selectedSong])

  //just like in the host part. We are reciving from Socket IO all the songs that are added and we are rendering them.
  useEffect(() => {
    socket.on('receive_data', (data) => {
      console.log(data)
      setAddedSong((prev) => {
        const arr = prev.filter((el) => el.name !== data.name)
        return [...arr, data]
      })
      socket.removeAllListeners()
    })
  }, [socket, addedSong, selectedSong])

//Here we check the password. This is wrong since we are fetching it from backend instead of pushing the tryout.
  const checkPass = async (e: React.MouseEvent<HTMLFormElement>) => {
    e.preventDefault();
    const pass = (e.target as HTMLFormElement).pass.value
    const attempt = await checkPassword(hostId, pass)

    //if host puts no password you should be able to join:
    if (attempt === true) {
      setAccess(true);
    }
    else {
      alert('Wrong password')
    }
  }

  //Here we search for a new item and render the results. Just like in Host side.
  const sendSearch = async (e: React.MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      setSongName([])
      const searchString = (e.target as HTMLFormElement).searchString.value
      const searchResult = await searchNewSong(hostId, searchString)
      for (const song of searchResult.tracks.items) {
        const item = {
          name: song.name,
          artist: song.artists[0].name,
          uri: song.uri,
        }
        setSongName(prev => [...prev, item])
      }
    } catch (error) {
      alert('something happended')
    }
  }

  return (
    <div className="container">
      <div className="title">
        <h3>Partybeat of: {hostId}</h3>
      </div>
      {!access && <div className="passChecker">
        <form onSubmit={checkPass}>
          <input name="pass" placeholder='Password'></input>
          <button type="submit">Join</button>
        </form>
      </div>}
      {access && <div className="clientContainer">
        <div className="addedSongsList">
          <ul>
            {addedSong.map((song, index) => {
              return <li ref={addedSongsRef} key={index} >Added <span className="addedSong">{song.name}</span> from
                <span className="addedArtist"> {song.artist}</span> to the playlist</li>
            })}
          </ul>
        </div>
        <div className="searchMenu">
          <form onSubmit={sendSearch}>
            <input name='searchString' placeholder="Song / artist name"></input>
            <button type="submit">Search</button>
          </form>
          {songName && songName.map((song, index) => { return <SearchButton song={song} key={index} userId={hostId} setSelectedSong={setSelectedSong}></SearchButton> })}
        </div>
      </div>}
    </div>
  )
}

export default Client