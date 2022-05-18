import React, { useState, useEffect } from 'react' ;
import {useLocation} from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import classes from './SearchResults.module.css';
import axios from 'axios'
import Pagination from '../Pagination/Pagination'
import SearchLogo from './logo.png'
import SearchIcon from '@material-ui/icons/Search';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import MicIcon from '@material-ui/icons/Mic';
    
const SearchResults = (props) => {

const navigate = useNavigate();
const {state} = useLocation();
const {results, query} = state;

const [searchResults, setSearchResults] = useState(results);
const [defaultVal, setDefaultVal] = useState(true);
const [searchQuery, setSearchQuery] = useState(query);
const [searchSuggestions, setSearchSuggestions] = useState([]);
const [filterSuggestions, setFilterSuggestions] = useState([]);
const [speechRedirect, setSpeechRedirect] = useState('');

const apiURL = 'http://localhost:3002/data' ;   //json server
const suggestionsURL = 'http://localhost:3002/queries' ; 
const backendURL = "http://localhost:8080" ; 

//Voice Search
const commands=[{
    command:["*"],
    callback:(redirectQ)=>setSpeechRedirect(redirectQ)}];
const {transcript, resetTranscript}=useSpeechRecognition({commands});

//Pagination
const [colour, setColour] = ('white');
const [currentPage, setCurrentPage] = useState(1);
const [prevClicked, setPrevClicked] = useState(false);
const [nextClicked, setNextClicked] = useState(false);
const [resultsPerPage, setResultsPerPage] = useState(10);
const indexOfLastResult = currentPage * resultsPerPage ;
const indexOfFirstResult = indexOfLastResult - resultsPerPage ;
const currentResults = searchResults.slice(indexOfFirstResult, indexOfLastResult) ;

const handlePrevClick = () => {
    setCurrentPage(currentPage - 1);
    setPrevClicked(true);
    setNextClicked(false);
}
const handleNextClick = () => {
    setCurrentPage(currentPage + 1);
    setPrevClicked(false);
    setNextClicked(true);
}
const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
}
useEffect(() => {
    setCurrentPage(1);
  }, [searchResults]);

useEffect(() => {
    axios.get(backendURL+"/suggestion/getAll") 
    .then(resp => {
        if(resp.data.length>0){
                setSearchSuggestions(resp.data);
        }
    }).catch(error => {
        console.log(error);
        setSearchSuggestions([]);
    });
  }, []);

  useEffect(() => {
    if(speechRedirect){
        setSearchQuery(speechRedirect);
        postDataToBackend();
        axios.get( backendURL+"/response/search" + "?query=" + speechRedirect.toLowerCase() + "&phraseSearch=false") 
    .then(resp => {
        setSearchResults(resp.data); 
            navigate('/searchresults?q='+speechRedirect,{ state: {results: resp.data, query: speechRedirect} });
    }).catch(error => {
        console.log(error);
        setSearchResults([]);
    });
    resetTranscript();
    }
}, [speechRedirect]);

const handleQueryInput = (e) => {
    setSearchQuery(e.target.value);
    if(e.target.value === ''){
        setFilterSuggestions([]);
        return ;
    }
const newFilter = searchSuggestions.filter((value)=>{
    return value.query.toLowerCase().startsWith(e.target.value.toLowerCase());
})
setFilterSuggestions(newFilter);
setDefaultVal(false);
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
    setFilterSuggestions([]);
}

const searchQuerySugg = (val) => {
    axios.get( backendURL+"/response/search" + "?query=" + val.toLowerCase() + "&phraseSearch=false" ) 
    .then(resp => {
        setSearchResults(resp.data);
        navigate('/searchresults?q='+val,{ state: {results: resp.data, query: val} });
    }).catch(error => {
        console.log(error);
        setSearchResults([]);
    });
}

const searchPhraseSugg = (val) => {
    axios.get( backendURL+"/response/search" + "?query=" + val.toLowerCase() + "&phraseSearch=true" ) 
    .then(resp => {
        setSearchResults(resp.data);
        navigate('/searchresults?q='+val,{ state: {results: resp.data, query: '"'+val+'"'} });
    }).catch(error => {
        console.log(error);
        setSearchResults([]);
    });
}

const handleLogoClick = (e) => {
    navigate('/');
}

const handleSpeechClick = () => {
    SpeechRecognition.startListening();
}

const handleSearch = (e) => {
e.preventDefault();
if(searchQuery === ''){
    return ;
}
var q = searchQuery.toLowerCase();
if(q && !filterSuggestions.includes(q)){
        postDataToBackend();
}
if(searchQuery.startsWith('"') && searchQuery.endsWith('"')){
    var newQuery = searchQuery.substring(1,(searchQuery.length)-1); //remove double quotes
    getDataFromPhrase(newQuery);
}
else{
    getDataFromQuery();
}
// setFilterSuggestions([]);
}

  const getDataFromQuery = () => {
    axios.get( backendURL+"/response/search" + "?query=" + searchQuery.toLowerCase() + "&phraseSearch=false") 
    .then(resp => {
        setSearchResults(resp.data);
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
        setSearchResults([]);
    });
}

const getDataFromPhrase = (newQuery) => {
    axios.get( backendURL+"/response/search" + "?query=" + newQuery.toLowerCase() + "&phraseSearch=true") 
    .then(resp => {
        setSearchResults(resp.data);
        if(resp.data.length>0){
            navigate('/searchresults?q='+newQuery,{ state: {results: resp.data, query: newQuery} });
        }
        else{
            navigate('/searchresults',{ state: {results: resp.data, query: newQuery} });
        }
    }).catch(error => {
        console.log(error);
        setSearchResults([]);
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

// ------------------------------------------------------------------------------------------ //

return (
<div className={classes.div_searchResults}>
    
    <div className={classes.searchDiv}> 
    <img src={SearchLogo} className={classes.logo} onClick={handleLogoClick}></img>
        <div className={classes.div_searchBar}>
          <div className={classes.searchIcon}>
            <SearchIcon style={{ color: 'white', paddingTop: '7px'}}/>
           </div>
     <form onSubmit={handleSearch} className={classes.searchForm}> 
           <input type="text" placeholder="What's on your mind ..." 
                  className={classes.searchBar} 
                  value={searchQuery}
                //   defaultValue={searchQuery}
                  onChange={handleQueryInput}/>
    </form>
            <button className={classes.speechButton} onClick={handleSpeechClick}>  
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
    
    <div className={classes.results}>
    <p className={classes.numResults}>
        Search Results: {(searchResults) ? searchResults.length : ''}
    </p>
    {currentResults.map((currentResult, i) => {
        return(
            <div className={classes.result} key={i}>
            <div>
            <a href={"https://"+currentResult.url}  className={classes.a1}>{currentResult.metadata["og:title"]}</a>
            </div>
            <div className={classes.resultURL}>
            <a href={"https://"+currentResult.url} className={classes.a2}>{currentResult.url}</a>
            </div>
            <p> {currentResult.metadata["og:description"]}  </p>
           </div>
        )
    })}
    </div>

    <nav className={classes.paginationNav}>
        <ul className={classes.pagination}>
    {(currentPage == 1) ? <a className={classes.disabled}> Prev </a> 
       : <a className={classes.prev} onClick={handlePrevClick}> Prev </a>}
    <Pagination resultsPerPage={resultsPerPage} totalResults={searchResults.length} paginate={paginate} currentPage={currentPage} nextClicked={nextClicked} prevClicked={prevClicked}/>
    {(indexOfLastResult >= searchResults.length) ? <a className={classes.disabledNext}> Next </a> 
       : <a className={classes.next} onClick={handleNextClick}> Next </a>}
    </ul>
    </nav>
</div>
)
}

export default SearchResults;