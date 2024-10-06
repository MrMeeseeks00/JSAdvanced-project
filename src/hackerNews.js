import axios from "axios";

const _ = require('lodash');

const newsContainer = document.getElementById('news-container');
const loadMoreButton = document.getElementById('load-more');
const errorMessage = document.getElementById('error-message');
const loadingMessage = document.getElementById('loading');
const searchInput = document.getElementById('search-input');
let newsIDs = [];
let currentIndex = 0;
const newsPerPagina = 10;
let allNews = [];

async function fetchNewStoriesIDs() { //prendo tutte le news
    setLoading(true);
    try {
        const risposta = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json');
        if (risposta.status !== 200) {
            throw new Error(`Error fetching news IDs: ${risposta.statusText}`);
        }
        if (newsIDs.length !== 0 && allNews.length !== 0 && currentIndex !== 0) {
            clearNews();
        }
        newsIDs = risposta.data;
        loadNews();
    } catch (error) {
        displayError(error.message);
    } finally {
        setLoading(false);
    }
}

/* beststories */
async function fetchBestStoriesIDs() { //prendo tutte le news
    setLoading(true);
    try {
        const risposta = await axios.get('https://hacker-news.firebaseio.com/v0/beststories.json');
        if (risposta.status !== 200) {
            throw new Error(`Error fetching news IDs: ${risposta.statusText}`);
        }
        if (newsIDs.length !== 0 && allNews.length !== 0 && currentIndex !== 0) {
            clearNews();
        }
        //console.log("clicked");
        newsIDs = risposta.data;
        //console.log(newsIDs);
        loadNews();
    } catch (error) {
        displayError(error.message);
    } finally {
        setLoading(false);
    }
}

async function loadNews() {
    setLoading(true);
    const nextNewsIDs = _.slice(newsIDs, currentIndex, currentIndex + newsPerPagina); //prendo i primi 10 news
    const newsDetailsPromises = _.map(nextNewsIDs, fetchNewsDetails);//per ogni news prendo i dettagli 
    const newsDetails = await Promise.all(newsDetailsPromises);
    _.forEach(newsDetails, news => {//ogni news la mostro sul display
        if (news) {
            allNews.push(news);
            displayNews(news);
        }
    });
    currentIndex += newsPerPagina; //aggiorno l'index per poter caricare poi i successivi 10 
    if (currentIndex >= newsIDs.length) {
        loadMoreButton.style.display = 'none';
    }
    setLoading(false);
}

async function fetchNewsDetails(id) { //prendo la news tramite id e restituisco i dettagli
    try {
        const risposta = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (risposta.status !== 200) {
            throw new Error(`Error fetching news details for ID ${id}: ${risposta.statusText}`);
        }
        //console.log(risposta);
        //console.log(risposta.data);
        return risposta.data;
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

function clearNews() {
    newsContainer.innerHTML = '';
}

function displayNews(news) {
    const newsElement = document.createElement('div');
    newsElement.classList.add('news-item');
    newsElement.dataset.title = news.title || '';

    const title = news.title || 'No title';
    const url = news.url || '#';
    const date = new Date(news.time * 1000).toLocaleString();
    const type = news.type || '';
    const by = news.by || '';


    newsElement.innerHTML = `
                <h3><a href="${url}" target="_blank">${title}</a></h3>
                <p>by ${by}, ${type}, ${date}</p>
            `; //optato per .innerHTML per risparmiare righe di codice

    newsContainer.appendChild(newsElement);
}

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function setLoading(isLoading) {
    loadingMessage.style.display = isLoading ? 'block' : 'none';
}

/* function searchNews() {
    const ricerca = searchInput.value.toLowerCase();
    const newsItems = document.querySelectorAll('.news-item');
    _.forEach(newsItems, item => {
        const title = item.dataset.title.toLowerCase();
        if (_.includes(title, ricerca)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
} */

    function searchNews() {
        const ricerca = searchInput.value.toLowerCase();
        
        // Clear the news container
        clearNews();
        
        // Filter the `allNews` array to find matching news based on the title
        const filteredNews = _.filter(allNews, news => {
            const title = (news.title || '').toLowerCase();
            return _.includes(title, ricerca);
        });
        
        // Display the filtered news
        if (filteredNews.length > 0) {
            _.forEach(filteredNews, news => displayNews(news));
        } else {
            // Optionally, show a message if no news matches the search term
            newsContainer.innerHTML = '<p>No news found</p>';
        }
    }

searchInput.addEventListener('input', searchNews);
loadMoreButton.addEventListener('click', loadNews);
const newstories = document.getElementById('new');
const beststories = document.getElementById('best');
newstories.addEventListener('click', fetchNewStoriesIDs);
beststories.addEventListener('click', fetchBestStoriesIDs);

export default {
    fetchNewStoriesIDs,
    fetchBestStoriesIDs
}