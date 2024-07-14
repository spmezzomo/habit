function getCookie(name) {
    const cookieName = `${name}=`;
    const cookieArray = document.cookie.split(';');
    for (let i = 0; i < cookieArray.length; i++) {
        let cookie = cookieArray[i].trim();
        if (cookie.indexOf(cookieName) === 0) {
            return cookie.substring(cookieName.length, cookie.length);
        }
    }
    return null;
}
const accessToken = getCookie('spotifyAccessToken');

document.addEventListener('DOMContentLoaded', function() {
    if (!accessToken) {
        // Redirecionar para a página de autenticação se não houver token
        window.location.href = 'auth.html';
        return;
    } else {
        fetchUserData();
        loadAppearanceConfig();
    }

    document.getElementById('search-input').addEventListener('input', debounce(searchTracks, 300));
});


function getAccessTokenFromUrl() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

        
function fetchUserData() {
    fetchRecentlyPlayedTracks();
    fetchUserQueue();
    fetchCurrentlyPlayingTrack();
}

async function fetchRecentlyPlayedTracks() {
    const response = await fetch('https://api.spotify.com/v1/me/player/recently-played', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    const tracks = data.items.map(item => item.track);
    displayTracks(tracks, 'track-list-recent');
}

async function fetchUserQueue() {
    const response = await fetch('https://api.spotify.com/v1/me/player/queue', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    displayTracks(data.queue, 'track-list-queue');
}

async function fetchCurrentlyPlayingTrack() {
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    if (data && data.item) {
        displayTracks([data.item], 'track-list-current');
    }
}

function displayTracks(tracks, list) {
    const trackList = document.getElementById(list);
    const fragment = document.createDocumentFragment();
    tracks.forEach(track => {
        const name = track.name || 'Unknown Title';
        const artists = track.artists && track.artists.length ? track.artists.map(artist => artist.name).join(', ') : 'Unknown Artist';
        const externalUrl = track.external_urls.spotify || '#';
        const imageUrl = track.album.images && track.album.images.length > 0 ? track.album.images[0].url : 'placeholder.png';
        const li = document.createElement('li');
        const container = document.createElement('div');
        const link = document.createElement('a');
        const albumImage = document.createElement('img');
        albumImage.src = imageUrl;
        albumImage.alt = `${name} - ${artists}`;
        link.href = externalUrl;
        link.target = '_blank';
        container.innerHTML = `<p><b>${name}</b><br> <span>by ${artists}</span></p>`;

        li.appendChild(link);
        link.appendChild(container);
        container.appendChild(albumImage);
        fragment.appendChild(li);
    });
    trackList.appendChild(fragment);
}

async function searchTracks(event) {
    const query = event.target.value;
    if (query.length < 2) return;
    
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
    });
    const data = await response.json();
    displaySearchResults(data.tracks.items);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    searchResults.innerHTML = '';
    results.forEach(track => {
        const imageUrl = track.album && track.album.images && track.album.images.length > 0 ? track.album.images[0].url : 'placeholder.jpg';
        const name = track.name || 'Unknown Title';
        const artists = track.artists && track.artists.length ? track.artists.map(artist => artist.name).join(', ') : 'Unknown Artist';
        const externalUrl = track.external_urls.spotify || '#';
        const li = document.createElement('li');
        const container = document.createElement('div');
        const link = document.createElement('a');
        const albumImage = document.createElement('img');
        albumImage.src = imageUrl;
        albumImage.alt = `${name} - ${artists}`;
        link.href = externalUrl;
        link.target = '_blank';
        container.innerHTML = `<p><b>${name}</b><br><span>by ${artists}</span></p>`;
        li.appendChild(link);
        link.appendChild(container);
        container.appendChild(albumImage);
        searchResults.appendChild(li);
    });
}

function debounce(fn, delay) {
    let timeoutId;
    return function(...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn.apply(this, args), delay);
    }
}

async function loadAppearanceConfig() {
    const response = await fetch('https://cdn.integrations.habit.io/developers/sample/dynamic_layout.json');
    const config = await response.json();
    document.getElementById('logo').src = config.logoUrl;
    document.documentElement.style.setProperty('--background-color', config.backgroundColor);
    document.documentElement.style.setProperty('--text-color', config.textColor);
}