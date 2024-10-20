import axios, { all } from "axios";

const _ = require('lodash');

const newsContainer = document.getElementById('news-container');
const loadMoreButton = document.getElementById('load-more');
const errorMessage = document.getElementById('error-message');
const loadingMessage = document.getElementById('loading');
const searchInput = document.getElementById('search-input');

let newsIDs = []; //array di tutti i news
let currentIndex = 0;
const newsPerPagina = 10;
let allNews = [];



//funzione per prendere tutte le New Stories
async function fetchNewStoriesIDs() {
    setLoading(true);
    try {
        const risposta = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json');
        if (risposta.status !== 200) {
            throw new Error(`Error fetching news IDs: ${risposta.statusText}`);
        }
        if (newsIDs.length !== 0 && allNews.length !== 0 && currentIndex !== 0) {
            clearNews();
            newsIDs = [];
            allNews = [];
            currentIndex = 0;
        }
        newsIDs = risposta.data;
        loadNews();
    } catch (error) {
        displayError(error.message);
    } finally {
        setLoading(false);
    }
}

/* funzione per prendere tutte le beststories */
async function fetchBestStoriesIDs() { //prendo tutte le news
    setLoading(true);
    try {
        const risposta = await axios.get('https://hacker-news.firebaseio.com/v0/beststories.json');
        if (risposta.status !== 200) {
            throw new Error(`Error fetching news IDs: ${risposta.statusText}`);
        }
        if (newsIDs.length !== 0 && allNews.length !== 0 && currentIndex !== 0) {
            clearNews();
            newsIDs = [];
            allNews = [];
            currentIndex = 0;
        }
        newsIDs = risposta.data;
        loadNews();
    } catch (error) {
        displayError(error.message);
    } finally {
        setLoading(false);
    }
}

/* funzione per display 10 news*/
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

/* funzione per prendere i dettagli di una news tramite id*/
async function fetchNewsDetails(id) {
    try {
        const risposta = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (risposta.status !== 200) {
            throw new Error(`Error fetching news details for ID ${id}: ${risposta.statusText}`);
        }
        return risposta.data;
    } catch (error) {
        displayError(error.message);
        return null;
    }
}

/* funzione per pulire il display delle news*/
function clearNews() {
    newsContainer.innerHTML = '';
}

/* funzione per mostrare le news */
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
            `; //ho optato per .innerHTML per risparmiare righe di codice

    newsContainer.appendChild(newsElement);
}

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function setLoading(isLoading) {
    loadingMessage.style.display = isLoading ? 'block' : 'none';
}

function searchNews() {
    const ricerca = searchInput.value.toLowerCase();
    clearNews();

    const filteredNews = _.filter(allNews, news => {
        const title = (news.title || '').toLowerCase();
        return _.includes(title, ricerca);
    });

    if (filteredNews.length > 0) {
        _.forEach(filteredNews, news => displayNews(news));
    } else {
        newsContainer.innerHTML = '<div class="news-item"><p style="text-align: center; margin-top: 20px; font-size: 15px;">No news found</p></div>';
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
