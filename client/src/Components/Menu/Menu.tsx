import React, { useState, useEffect } from 'react'
import Host from '../Host/Host'
import { User, Playlist, GeneralPlaylist } from '../../Types/Types'
import { getNewToken, getAllPlaylistFromUser, getExistingPlaylist, getNewPlaylist } from '../../Services/clientServices'
import { v4 as uuidv4 } from 'uuid';
import logo from '../../images/logo.png'

const rootUrl = `https://partybeat-nachcoll.vercel.app/`

const Menu = () => {

  const [userInfo, setUserInfo] = useState<User>({ display_name: '', id: undefined})
  const [playLists, setPlayLists] = useState<Playlist[]>([])
  const [playListSelected, setPlayListSelected] = useState<boolean>(false)
  const [_id, set_id] = useState<string>(uuidv4().toString())
  //When page loads we want to create the new Token ASAP.
  useEffect(() => {
    const sessionUser = JSON.parse(sessionStorage.getItem('host') || '{}')
    const sessionPlaylist = JSON.parse(sessionStorage.getItem('playlistSelected') || '{}')
    console.log(sessionUser, _id)
    if(!sessionUser.hostId){
      onLoad()
    }
    else{
      set_id(sessionUser._id)
      const user = {
        id: sessionUser.hostId,
        display_name: sessionUser.display_name,
      }
      setUserInfo(user)
      //refresh the playlist stage
      sessionPlaylist.playlistSelected && setPlayListSelected(sessionPlaylist.playlistSelected)
    }
  }, [])
  //we take the code from Spotify API and then clear the browser so it's not that easy to access. I think it's not sensitive data since we
  //still need to ask for a token in order to use it.
  const onLoad = async () => {
      const completeUrl = window.location.search;
      const token = completeUrl.substring(6)
      //We don't want to show the query from Spotify

      window.history.pushState("", "", `${rootUrl}menu`)
      const user = await getNewToken(JSON.stringify({token, _id }))
      console.log(user)
      user._id && set_id(user._id)
      sessionStorage.setItem('host', JSON.stringify({hostId : user.id, display_name: user.display_name, token: token}))
      setUserInfo(user)
  }

  //After clicking on the button for loading playlists we are rendering them on a form.
  const getPlaylists = async () => {
    try {
      console.log(userInfo)
      const playlistData = await getAllPlaylistFromUser(userInfo)
      console.log(playlistData);
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
      const playlistName = (e.target as HTMLFormElement).playlist.value
      //if the selected playlist is already there:
      console.log(playlistName)
      if (playlistName !== 'New playlist') {
        const playlist = playLists.filter((el) => { return el.name === playlistName })
        await getExistingPlaylist(userInfo, playlist[0])
      } else {
        //create new playlist
      await getNewPlaylist(userInfo)
      }
      setPlayListSelected(true);
      sessionStorage.setItem('playlistSelected', JSON.stringify({playlistSelected: true}))
    } catch (error) {
      alert('Something happened')
    }
  }

  return (
    <div className="mainContainer">
      <img src={logo} className="miniLogo"></img>
      {(playLists.length === 0 && playListSelected === false)&& <button onClick={getPlaylists}>Load or create a playlist</button>}
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
      {playListSelected && <Host set_id={set_id} _id={_id} userInfo={userInfo}></Host>}
    </div>
  )
}

export default Menu