import React, {useState, useEffect} from 'react'
import Main from '../Main/Main'
import Client from '../Client/Client'

const Test = () => {

  const [userInfo, setUserInfo] = useState({})

  useEffect(()=>{
    onLoad()
  }, [])

  let token!:string

const onLoad: any = async () => {
  if(window.location.search.length > 0){
    const queryString = window.location.search;
    token = queryString.substring(6)
    console.log(token);

    const result = await fetch('http://localhost:8000/newToken', {
      method: "POST",
      headers: {'Content-type' : 'application/json'},
      body: JSON.stringify({token})
    })
    const data = await result.json();
    console.log('dataaaaaaaaa',data);
  }
  return null;
}

const getUserData = async () => {
  const result = await fetch('http://localhost:8000/info', {
    method: "GET",
    headers: {'Content-type' : 'application/json'}
  })
  const data = await result.json();
  console.log(data);
  setUserInfo(data)
}



  return (
    <>
    <div>
    </div>
    <div>Test</div>
    <button onClick={getUserData}>Hacer peticion</button>
    <br></br>
    <Main userInfo={userInfo}></Main>
    <br></br>
    <Client></Client>
    </>
  )
}

export default Test