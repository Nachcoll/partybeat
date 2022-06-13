import React from 'react'
import { SearchProps } from '../../Types/Types'
import { addingSong } from '../../Services/clientServices'
import './SearchButton.css'



const SearchButton = ({ userId, song, setSelectedSong }: SearchProps) => {

  //here we manage the adding button:
  const handleClick = async (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault();
    if(userId !== undefined){
      addingSong(userId, song);
      setSelectedSong(song);
    }
  }

  return (
    <button className="songButton" onClick={handleClick}><span>{song.name}</span> by {song.artist}</button>
  )
}

export default SearchButton