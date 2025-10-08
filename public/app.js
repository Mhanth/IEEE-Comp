const API_KEY = '2cebc3f5';
const API_URL = 'https://www.omdbapi.com/';

const searchInput = document.getElementById('q');
const typeSelect = document.getElementById('type');
const searchBtn = document.getElementById('searchBtn');
const resultsDiv = document.getElementById('results');
const favsDiv = document.getElementById('favs');
const modal = document.getElementById('modal');
const modalDetails = document.getElementById('details');
const closeModalBtn = document.getElementById('closeModal');

let favorites = JSON.parse(localStorage.getItem('movieFavorites') || '[]');

searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') performSearch();
});
closeModalBtn.addEventListener('click', () => modal.classList.add('hidden'));

async function performSearch() {
  const query = searchInput.value.trim();
  if (!query) return;

  const type = typeSelect.value;
  const url = `${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(query)}${type ? '&type=' + type : ''}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.Response === 'True') {
      displayResults(data.Search);
    } else {
      resultsDiv.innerHTML = `<p style="grid-column: 1/-1; text-align: center; color: #666;">${data.Error}</p>`;
    }
  } catch (error) {
    resultsDiv.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #e53e3e;">Error fetching results</p>';
  }
}

function displayResults(movies) {
  resultsDiv.innerHTML = movies.map(movie => {
    const isFavorite = favorites.some(fav => fav.imdbID === movie.imdbID);
    return `
      <div class="card">
        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/220x300?text=No+Image'}" alt="${movie.Title}" onclick="showDetails('${movie.imdbID}')">
        <h3>${movie.Title}</h3>
        <div class="meta">
          <div>${movie.Year}</div>
          <div>${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</div>
        </div>
        <button onclick="toggleFavorite('${movie.imdbID}')" class="${isFavorite ? 'fav-btn' : ''}">
          ${isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
        </button>
      </div>
    `;
  }).join('');
}

async function showDetails(imdbID) {
  const url = `${API_URL}?apikey=${API_KEY}&i=${imdbID}&plot=full`;

  try {
    const response = await fetch(url);
    const movie = await response.json();

    if (movie.Response === 'True') {
      modalDetails.innerHTML = `
        <div style="display: grid; grid-template-columns: 300px 1fr; gap: 20px;">
          <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/300x450?text=No+Image'}" alt="${movie.Title}" style="width: 100%; border-radius: 8px;">
          <div>
            <h2 style="margin-top: 0;">${movie.Title} (${movie.Year})</h2>
            <div style="margin-bottom: 12px;">
              <strong>Rating:</strong> ${movie.imdbRating}/10 (${movie.imdbVotes} votes)
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Genre:</strong> ${movie.Genre}
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Released:</strong> ${movie.Released}
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Runtime:</strong> ${movie.Runtime}
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Director:</strong> ${movie.Director}
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Actors:</strong> ${movie.Actors}
            </div>
            <div style="margin-bottom: 12px;">
              <strong>Plot:</strong> ${movie.Plot}
            </div>
            ${movie.Awards !== 'N/A' ? `<div style="margin-bottom: 12px;"><strong>Awards:</strong> ${movie.Awards}</div>` : ''}
          </div>
        </div>
      `;
      modal.classList.remove('hidden');
    }
  } catch (error) {
    modalDetails.innerHTML = '<p style="color: #e53e3e;">Error loading details</p>';
    modal.classList.remove('hidden');
  }
}

async function toggleFavorite(imdbID) {
  const index = favorites.findIndex(fav => fav.imdbID === imdbID);

  if (index > -1) {
    favorites.splice(index, 1);
  } else {
    const url = `${API_URL}?apikey=${API_KEY}&i=${imdbID}`;
    try {
      const response = await fetch(url);
      const movie = await response.json();
      if (movie.Response === 'True') {
        favorites.push({
          imdbID: movie.imdbID,
          Title: movie.Title,
          Year: movie.Year,
          Type: movie.Type,
          Poster: movie.Poster
        });
      }
    } catch (error) {
      alert('Error adding to favorites');
      return;
    }
  }

  localStorage.setItem('movieFavorites', JSON.stringify(favorites));
  displayFavorites();

  if (resultsDiv.children.length > 0) {
    const query = searchInput.value.trim();
    if (query) performSearch();
  }
}

function displayFavorites() {
  if (favorites.length === 0) {
    favsDiv.innerHTML = '<p style="color: #666; text-align: center;">No favorites yet</p>';
    return;
  }

  favsDiv.innerHTML = `
    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;">
      ${favorites.map(movie => `
        <div class="card">
          <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/220x300?text=No+Image'}" alt="${movie.Title}" onclick="showDetails('${movie.imdbID}')">
          <h3>${movie.Title}</h3>
          <div class="meta">
            <div>${movie.Year}</div>
            <div>${movie.Type.charAt(0).toUpperCase() + movie.Type.slice(1)}</div>
          </div>
          <button onclick="toggleFavorite('${movie.imdbID}')" class="fav-btn">
            Remove from Favorites
          </button>
        </div>
      `).join('')}
    </div>
  `;
}

displayFavorites();
