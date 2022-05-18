import React, { useState, useEffect } from 'react' ;
import './Pagination.css';


const Pagination = ({resultsPerPage, totalResults, paginate, currentPage, nextClicked, prevClicked}) => {

    const pageNumbers = [] ;
    for(let i=1; i<=Math.ceil(totalResults / resultsPerPage); i++){
        pageNumbers.push(i);
    }

    const [arrOfCurrentButtons, setArrOfCurrentButtons] = useState([]);
    const [currentButton, setCurrentButton] = useState(currentPage);

    useEffect(() => {
        setArrOfCurrentButtons(pageNumbers.slice(0,5));
      }, [totalResults]);

    useEffect(() => {
        let tempNumberOfPages = [...pageNumbers] ;
        if((currentPage-1)%5==0 && nextClicked){
            tempNumberOfPages = tempNumberOfPages.slice(currentPage-1,currentPage+4);
            setArrOfCurrentButtons(tempNumberOfPages);
        }
        else if(currentPage%5==0 && prevClicked){
            tempNumberOfPages = tempNumberOfPages.slice(currentPage-5,currentPage);
            setArrOfCurrentButtons(tempNumberOfPages);
        }
      }, [currentPage]);
    
    return (
        <nav className="paginationNav">
            <ul className="pagination">
                {arrOfCurrentButtons.map(pageNumber => (
                    <li key={pageNumber} className="pageItem">
                        <a onClick={() => paginate(pageNumber)} 
                                className={currentPage===pageNumber && 'active'}>
                            {pageNumber}
                        </a>
                    </li>
                ))}
            </ul>
        </nav>
    )
}

export default Pagination;