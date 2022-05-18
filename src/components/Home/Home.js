import React, { useState, useEffect } from 'react' ;
import { NavigationType, useNavigate } from 'react-router-dom';
import { View, Text,TextInput} from 'react-native';
import { Icon, Input } from 'semantic-ui-react'
import SearchIcon from '@material-ui/icons/Search';
import classes from './Home.module.css';
import SearchLogo from './logo.png'
import axios from 'axios'
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import MicIcon from '@material-ui/icons/Mic';
import { stemmer } from 'stemmer';

const Home = () => {

const navigate = useNavigate();
const [filteredResults, setFilteredResults] = useState([]);
const [searchSuggestions, setSearchSuggestions] = useState([]);
const [filterSuggestions, setFilterSuggestions] = useState([]);
const [searchQuery, setSearchQuery] = useState('');
const [speechRedirect, setSpeechRedirect] = useState('');
const apiURL = 'http://localhost:3002/data' ;   //json server
const suggestionsURL = 'http://localhost:3002/queries' ; 
const backendURL = "http://localhost:8080" ; 

const commands=[{
    command:["*"],
    callback:(redirectQ)=>setSpeechRedirect(redirectQ)}];

const {transcript, resetTranscript}=useSpeechRecognition({commands});


useEffect(() => {
    axios.get(backendURL+"/suggestion/getAll") 
    .then(resp => {
        if(resp.data.length>0){
                console.log("Suggestions",resp.data);
                setSearchSuggestions(resp.data);
        }
    }).catch(error => {
        console.log(error);
        setSearchSuggestions([]);
    });
  }, []);

useEffect(() => {
    console.log(speechRedirect);
    if(speechRedirect){
        setSearchQuery(speechRedirect);
        postDataToBackend();
        axios.get( backendURL+"/response/search" + "?query=" + speechRedirect.toLowerCase() + "&phraseSearch=false") 
    .then(resp => {
        setFilteredResults(resp.data); 
            navigate('/searchresults?q='+speechRedirect,{ state: {results: resp.data, query: speechRedirect} });
    }).catch(error => {
        console.log(error);
        setFilteredResults([]);
    });
    resetTranscript();
    }
}, [speechRedirect]);

const handleQueryInput = (e) => {
if(e.target.value === ''){
    setFilterSuggestions([]);
    return ;
}
setSearchQuery(e.target.value);
const newFilter = searchSuggestions.filter((value)=>{
    return value.query.toLowerCase().startsWith(e.target.value.toLowerCase());
})
setFilterSuggestions(newFilter);
}

const handleSearch = (e) => {
    e.preventDefault();
    if(searchQuery===''){
        return ;
    }
    var q = searchQuery.toLowerCase();
    if(q && filterSuggestions.includes(q)===false){
        postDataToBackend();
    }
    if(searchQuery.startsWith('"') && searchQuery.endsWith('"')){
        var newQuery = searchQuery.substring(1,(searchQuery.length)-1); //remove double quotes
        getDataFromPhrase(newQuery);
    }
    else{
        getDataFromQuery();
    }
}

const handleSuggClick = (val) => {
setSearchQuery(val);
if(val.startsWith('"') && val.endsWith('"')){
    var newQuery = val.substring(1,(val.length)-1); //remove double quotes
    searchPhraseSugg(newQuery);
}
else{
    searchQuerySugg(val);
}
}

const searchQuerySugg = (val) => {
    axios.get( backendURL+"/response/search" + "?query=" + val.toLowerCase() + "&phraseSearch=false") 
    .then(resp => {
        setFilteredResults(resp.data);
        navigate('/searchresults?q='+val,{ state: {results: resp.data, query: val} });
    }).catch(error => {
        console.log(error);
        setFilteredResults([]);
    });
}

const searchPhraseSugg = (val) => {
    axios.get( backendURL+"/response/search" + "?query=" + val.toLowerCase() + "&phraseSearch=true") 
    .then(resp => {
        setFilteredResults(resp.data);
        navigate('/searchresults?q='+val,{ state: {results: resp.data, query: '"'+val+'"'} });
    }).catch(error => {
        console.log(error);
        setFilteredResults([]);
    });
}

const getDataFromQuery = () => {
    axios.get( backendURL+"/response/search" + "?query=" + searchQuery.toLowerCase() + "&phraseSearch=false") 
    .then(resp => {
        setFilteredResults(resp.data);
        if(resp.data.length>0){
            console.log(resp.data);
            console.log(resp.data[0].metadata);
            console.log(resp.data[0].metadata["og:title"]);;
            navigate('/searchresults?q='+searchQuery,{ state: {results: resp.data, query: searchQuery} });
        }
        else{
            navigate('/searchresults',{ state: {results: resp.data, query: searchQuery} });
        }
    }).catch(error => {
        console.log(error);
        setFilteredResults([]);
    });
}

const getDataFromPhrase = (newQuery) => {
    axios.get( backendURL+"/response/search" + "?query=" + newQuery.toLowerCase() + "&phraseSearch=true") 
    .then(resp => {
        setFilteredResults(resp.data);
        if(resp.data.length>0){
            console.log(resp.data);
            console.log(resp.data[0].metadata);
            console.log(resp.data[0].metadata["og:title"]);;
            navigate('/searchresults?q='+newQuery,{ state: {results: resp.data, query: searchQuery} });
        }
        else{
            navigate('/searchresults',{ state: {results: resp.data, query: newQuery} });
        }
    }).catch(error => {
        console.log(error);
        setFilteredResults([]);
    });
}

const postDataToBackend = () => {
    axios.get( backendURL+"/suggestion/add" + "?query=" + searchQuery.toLowerCase())    
      .then(response => {
      console.log(response);
    }).catch(error => {
      console.log(error.response.data);
  }); 
}

// --------------------------------------------------------------------------------------- //

return (
    
     <div className={classes.div_search}>
         <img src={SearchLogo} className={classes.logo}></img> 
         <div className={classes.search}>
         <div className={classes.div_searchBar}>
          <div className={classes.searchIcon}>
             <SearchIcon style={{ color: 'white', paddingTop: '7px'}}/>
           </div>
           <form onSubmit={handleSearch} className={classes.searchForm}>
             <input type="text" placeholder="What's on your mind ..." className={classes.searchBar} onChange={handleQueryInput}/>
            </form>
             <button className={classes.speechButton} onClick={SpeechRecognition.startListening}>  
                 <MicIcon className={classes.speechIcon}></MicIcon>
            </button>
            <button className={classes.searchButton} onClick={handleSearch}> Search </button>
        </div>
        </div>
        {filterSuggestions.length!=0 && 
           <div className={classes.searchSuggestions}>
            {filterSuggestions.slice(0,15).map((value,key)=>{
                return(
                    <p onClick={() => handleSuggClick(value.query)} className={classes.suggestion} key={key}>
                        {value.query}
                    </p>
                )
            }
            )}
        </div>}
     </div>
)
}

export default Home;
