import React from 'react'
import { SearchProps } from '../../Types/Types'




const SearchButton = ({userId, song, setSelectedSong}: SearchProps) => {

  const handleClick = async (e: React.MouseEvent<HTMLElement>) =>{
    e.preventDefault();

    const result = await fetch(`http://localhost:8000/addSong/${userId}`, {
      method: "POST",
    headers: {'Content-type' : 'application/json'},
    body: JSON.stringify({'song' : song})
  })
    const json = await result.json();
    console.log(json);
    setSelectedSong(song);
  }


  return (
    <button onClick={handleClick}>{song.name} from {song.artist}</button>
  )
}

export default SearchButton