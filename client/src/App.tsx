
import './App.css';
import Dashboard from './Components/Dashboard/Dashboard';
import Test from './Components/Test/Test';
import { BrowserRouter, Routes, Route } from 'react-router-dom'

function App() {
  return (
    // <div className="App">
      <BrowserRouter>
      <Routes>
        <Route path= '/' element={<Dashboard/>}/>
        <Route path= 'test' element={<Test/>}/>
      </Routes>
      </BrowserRouter>

  );
}

export default App;
