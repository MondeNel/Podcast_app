import React, { useState, useEffect } from 'react';
import styles from './Search.module.css'; // Import the CSS module
import Fuse from 'fuse.js';

const API_URL = 'https://podcast-api.netlify.app/shows';

const Search = () => {
    const [input, setInput] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedShow, setSelectedShow] = useState(null);
    const [fuse, setFuse] = useState(null);

    useEffect(() => {
        const fetchAndSetFuseData = async () => {
            const response = await fetch(API_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setFuse(new Fuse(data, { keys: ['title'], includeScore: true }));
        };

        fetchAndSetFuseData();
    }, []);

    useEffect(() => {
        const handleDocumentClick = (event) => {
            if (!document.querySelector(`.${styles.input__wrapper}`).contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('click', handleDocumentClick);
        return () => {
            document.removeEventListener('click', handleDocumentClick);
        };
    }, [styles.input__wrapper]);

    const openResultsDialog = (show) => {
        setSelectedShow(show);
        setShowResults(false);
    };

    const fetchData = (value) => {
        const result = fuse.search(value);
        const filteredShows = result.map((show) => show.item);
        setFilteredData(filteredShows);
        setShowResults(true);
    };

    let searchTimeout;

    const handleChange = (value) => {
        setInput(value);

        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
            if (value.trim() !== '') {
                fetchData(value);
            } else {
                setFilteredData([]);
                setShowResults(false);
            }
        }, 100);
    };

    return (
        <div className={styles.input__wrapper}> {/* Use the CSS class from the module */}
            <input
                type="text"
                className={styles.input} 
                placeholder="Type to search..."
                value={input}
                onChange={(e) => handleChange(e.target.value)}
            />
            <div className={`${styles.result__box} ${showResults ? styles.show : ''}`}> {/* Use the CSS classes from the module */}
                <ul className={styles.result__list}> {/* Use the CSS class from the module */}
                    {filteredData.map((show) => (
                        <li key={show.id} className={styles.result} onClick={() => openResultsDialog(show)}>
                            {show.title}
                        </li>
                    ))}
                </ul>
            </div>

            {selectedShow && (
                <SearchResultsDialog show={selectedShow} onClose={() => setSelectedShow(null)} />
            )}
        </div>
    );
};

export default Search;
