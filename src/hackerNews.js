import axios from "axios";

const _ = require('lodash');

const newsContainer = document.getElementById('news-container');
const loadMoreButton = document.getElementById('load-more');
const errorMessage = document.getElementById('error-message');
const loadingMessage = document.getElementById('loading');
const filterInput = document.getElementById('filter-input');
let newsIDs = [];
let currentIndex = 0;
const newsPerPage = 10;
let allNews = [];

async function fetchNewsIDs() {
    setLoading(true);
    try {
        const response = await axios.get('https://hacker-news.firebaseio.com/v0/newstories.json');
        if (response.status !== 200) {
            throw new Error(`Error fetching news IDs: ${response.statusText}`);
        }
        newsIDs = response.data;
        loadMoreNews();
    } catch (error) {
        displayError(error.message);
    } finally {
        setLoading(false);
    }
}

async function fetchNewsDetails(id) {
    try {
        const response = await axios.get(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
        if (response.status !== 200) {
            throw new Error(`Error fetching news details for ID ${id}: ${response.statusText}`);
        }
        return response.data;
    } catch (error) {
        displayError(error.message);
        return null;  // Return null in case of error to handle it gracefully
    }
}

async function loadMoreNews() {
    setLoading(true);
    const nextNewsIDs = _.slice(newsIDs, currentIndex, currentIndex + newsPerPage);
    const newsDetailsPromises = _.map(nextNewsIDs, fetchNewsDetails);
    const newsDetails = await Promise.all(newsDetailsPromises);
    _.forEach(newsDetails, news => {
        if (news) {  // Check if news is not null
            allNews.push(news);
            displayNews(news);
        }
    });
    currentIndex += newsPerPage;
    if (currentIndex >= newsIDs.length) {
        loadMoreButton.style.display = 'none';
    }
    setLoading(false);
}

function displayNews(news) {
    const newsElement = document.createElement('div');
    newsElement.classList.add('news-item');
    newsElement.dataset.title = news.title || '';

    const title = news.title || 'No title';
    const url = news.url || '#';
    const date = new Date(news.time * 1000).toLocaleString();

    newsElement.innerHTML = `
                <h3><a href="${url}" target="_blank">${title}</a></h3>
                <p>${date}</p>
            `;

    newsContainer.appendChild(newsElement);
}

function displayError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
}

function setLoading(isLoading) {
    loadingMessage.style.display = isLoading ? 'block' : 'none';
}

function filterNews() {
    const keyword = filterInput.value.toLowerCase();
    const newsItems = document.querySelectorAll('.news-item');
    _.forEach(newsItems, item => {
        const title = item.dataset.title.toLowerCase();
        if (_.includes(title, keyword)) {
            item.style.display = '';
        } else {
            item.style.display = 'none';
        }
    });
}

filterInput.addEventListener('input', filterNews);
loadMoreButton.addEventListener('click', loadMoreNews);
window.onload = fetchNewsIDs;