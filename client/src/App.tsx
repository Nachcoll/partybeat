
import './App.css';
import Dashboard from './Components/Dashboard/Dashboard';
import Test from './Components/Test/Test';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Client from './Components/Client/Client';

function App() {
  return (

      <BrowserRouter>
      <Routes>
        <Route path= '/' element={<Dashboard/>}/>
        <Route path= 'test' element={<Test/>}/>
        <Route path= '/room/:id' element={<Client/>}/>
      </Routes>
      </BrowserRouter>

  );
}

export default App;
