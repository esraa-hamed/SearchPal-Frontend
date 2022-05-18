import './App.css';
import React,{useEffect} from 'react';
//import {BrowserRouter as Router, Route, Routes, Link, Switch} from "react-router-dom";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
//import {BrowserRouter,Route,Routes} from 'react-router-dom';
import Home from './components/Home/Home';
import SearchResults from './components/SearchResults/SearchResults';

function App() {
  useEffect(() => {
    document.title = "SearchPal";
  }, [])

  return (
    <Router>
     <div className="wrapper">
        <Routes>
         <Route exact path="/" element={<Home />}>
         </Route>
         <Route exact path="/searchresults" element={<SearchResults />}>
         </Route>
        </Routes>
    </div> 
    </Router>
  );
}

export default App;
