import React from 'react'

const Test = () => {

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
}



  return (
    <>
    <div onLoad={onLoad()}></div>
    <div>Test</div>
    <button onClick={getUserData}>Hacer peticion</button>

    </>
  )
}

export default Test