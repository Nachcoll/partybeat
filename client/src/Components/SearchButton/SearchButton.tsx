import React from 'react'
import { SearchProps } from '../../Types/Types'
import { addingSong } from '../../Services/clientServices'




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
    <button onClick={handleClick}>{song.name} from {song.artist}</button>
  )
}

export default SearchButton