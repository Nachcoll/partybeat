import React, { useState, useEffect } from 'react'
import Main from '../Main/Main'
import { User, Playlist, GeneralPlaylist } from '../../Types/Types'
import { getNewToken, getAllPlaylistFromUser, getExistingPlaylist, getNewPlaylist } from '../../Services/clientServices'



const Menu = () => {

  const [userInfo, setUserInfo] = useState<User>({ display_name: '', id: undefined, uri: '', email: '' })
  const [playLists, setPlayLists] = useState<Playlist[]>([])
  const [playListSelected, setPlayListSelected] = useState<boolean>(false)

  //When page loads we want to create the new Token ASAP.
  useEffect(() => {
    onLoad()
  }, [])
  //we take the code from Spotify API and then clear the browser so it's not that easy to access. I think it's not sensitive data since we
  //still need to ask for a token in order to use it.
  const onLoad = async () => {
    if (window.location.search.length > 0) {
      const completeUrl = window.location.search;
      const token = completeUrl.substring(6)
      //We don't want to show the query from Spotify
      window.history.pushState("", "", 'http://localhost:3000/menu')
      const user = await getNewToken(token)
      setUserInfo(user)
    }
    return null;
  }

  //After clicking on the button for loading playlists we are rendering them on a form.
  const getPlaylists = async () => {
    try {
      const playlistData = await getAllPlaylistFromUser(userInfo)
      // Since we can only edit playlists from our own we are going to filter them
      const arr = playlistData.items.filter((el: GeneralPlaylist) => { return el.owner.id === userInfo.id })
      console.log(arr);
      setPlayLists((prev) => {
        return [...prev, ...arr]
      })
    } catch (error) {
      alert('Something happened')
    }
  }
  //Here we handle the decision of the playlist that is going to be edited. We can either use an existing playlist or we can
  // create a new one
  const handlePlaylistSubmit = async (e: React.MouseEvent<HTMLFormElement>) => {
    try {
      e.preventDefault();
      console.log(e.target)
      const playlistName = (e.target as HTMLFormElement).playlist.value
      //if the selected playlist is already there:
      if (playlistName !== 'New playlist') {
        const playlist = playLists.filter((el) => { return el.name === playlistName })
        await getExistingPlaylist(userInfo, playlist[0])
      } else {
        //create new playlist
        await getNewPlaylist(userInfo)
      }
      setPlayListSelected(true);
    } catch (error) {
      alert('Something happened')
    }
  }

  return (
    <div className="mainContainer">
      {playLists.length === 0 && <button onClick={getPlaylists}>Load all the playlists</button>}
      {(playLists.length > 0 && playListSelected === false) &&
      <div className="playlistContainer"><h2>Select the playlist:</h2>
        <form className="playlistSelector" onSubmit={handlePlaylistSubmit}>
          <div className="formInputAndButton">
          <select name='playlist'>
            <option>New playlist</option>
            {playLists.map((playlist, index) => { return <option key={index}>{playlist.name}</option> })}
          </select>
          <button type="submit" className="playlistSelectorButton">START sharing</button>
          </div>
        </form>
      </div>}
      {playListSelected && <Main userInfo={userInfo}></Main>}
    </div>
  )
}

export default Menu