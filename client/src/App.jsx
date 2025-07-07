import React from 'react';
import Header from './components/header/Header';
import Home from './components/home/Home';
import {Route, Routes} from 'react-router-dom'
import Login from './components/login/Login';
import Footer from './components/footer/Footer';

function App() {
  return (
    <div>
      <Header />
      <Routes>
        <Route path='/home' element={<Home/>}/>
        <Route path='/login' element={<Login/>}/>
      </Routes>
      <Footer/>
    </div>
  );
}

export default App;
