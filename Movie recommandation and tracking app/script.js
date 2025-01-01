const apiKey = '1006c840';  // **Replace this with your OMDb API key**

const addButton = document.getElementById('add-button');
const movieInput = document.getElementById('movie-input');
const genreInput = document.getElementById('genre-input');
const yearInput = document.getElementById('year-input');
const watchlistInput = document.getElementById('watchlist-input');
const movieList = document.getElementById('movie-list');
const watchedCount = document.getElementById('watched-count');
const filters = document.querySelectorAll('.filters button');
const recommendationsList = document.getElementById('recommendations-list');

// Fetch movie details from OMDb API
async function fetchMovieDetails(title) {
    const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&t=${title}`);
    const data = await response.json();
    return data;
}

// Fetch movie recommendations by genre from OMDb API
async function getRecommendations(genre) {
    const response = await fetch(`http://www.omdbapi.com/?apikey=${apiKey}&s=${genre}`);
    const data = await response.json();
    return data.Search || [];
}

// Add a movie to the list
async function addMovie() {
    const title = movieInput.value.trim();
    const genre = genreInput.value.trim();
    const year = yearInput.value.trim();
    const watchlist = watchlistInput.value;

    if (title === '' || genre === '' || year === '') return;

    // Fetch movie details from OMDb API
    const movieDetails = await fetchMovieDetails(title);
    if (movieDetails.Response === "True") {
        const movies = JSON.parse(localStorage.getItem('movies')) || [];
        const newMovie = {
            title,
            genre,
            year,
            watchlist,
            plot: movieDetails.Plot,
            rating: movieDetails.imdbRating,
            cast: movieDetails.Actors
        };
        movies.push(newMovie);
        localStorage.setItem('movies', JSON.stringify(movies));

        // Fetch movie recommendations based on the genre
        const recommendations = await getRecommendations(genre);
        showRecommendations(recommendations);
    } else {
        alert("Movie not found. Please check the title.");
    }

    // Clear input fields
    movieInput.value = '';
    genreInput.value = '';
    yearInput.value = '';
    watchlistInput.value = 'to-watch';

    loadMovies();
}

// Display movies from localStorage
function loadMovies() {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    movieList.innerHTML = '';
    
    let watchedMovies = 0;

    movies.forEach((movie, index) => {
        const li = document.createElement('li');
        
        // Movie Title and Info
        const title = document.createElement('span');
        title.textContent = movie.title;
        const details = document.createElement('div');
        details.classList.add('movie-info');
        details.textContent = `${movie.genre} | ${movie.year}`;

        // Display plot and rating
        const plot = document.createElement('p');
        plot.textContent = `Plot: ${movie.plot}`;
        
        const rating = document.createElement('p');
        rating.textContent = `IMDb Rating: ${movie.rating}`;
        
        const cast = document.createElement('p');
        cast.textContent = `Cast: ${movie.cast}`;

        // Movie Status (Watched, To Watch)
        const status = document.createElement('span');
        status.textContent = movie.watchlist === 'watched' ? '✔ Watched' : '⏳ To Watch';
        status.style.color = movie.watchlist === 'watched' ? 'green' : 'orange';

        // Remove Button
        const removeButton = document.createElement('span');
        removeButton.textContent = '❌';
        removeButton.classList.add('remove');
        removeButton.addEventListener('click', () => removeMovie(index));

        // Append elements
        li.appendChild(title);
        li.appendChild(details);
        li.appendChild(plot);
        li.appendChild(rating);
        li.appendChild(cast);
        li.appendChild(status);
        li.appendChild(removeButton);
        movieList.appendChild(li);

        // Count watched movies
        if (movie.watchlist === 'watched') watchedMovies++;
    });

    // Update watched count
    watchedCount.textContent = watchedMovies;
}

// Show movie recommendations
function showRecommendations(recommendations) {
    recommendationsList.innerHTML = '';  // Clear previous recommendations
    recommendations.forEach(movie => {
        const li = document.createElement('li');
        li.textContent = movie.Title;
        recommendationsList.appendChild(li);
    });
}

// Remove a movie from the list
function removeMovie(index) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    movies.splice(index, 1);
    localStorage.setItem('movies', JSON.stringify(movies));
    loadMovies();
}

// Filter movies based on selected category
function filterMovies(category) {
    const movies = JSON.parse(localStorage.getItem('movies')) || [];
    const filteredMovies = movies.filter(movie => movie.watchlist === category);
    movieList.innerHTML = '';
    
    filteredMovies.forEach((movie, index) => {
        const li = document.createElement('li');
        const title = document.createElement('span');
        title.textContent = movie.title;
        const details = document.createElement('div');
        details.classList.add('movie-info');
        details.textContent = `${movie.genre} | ${movie.year}`;
        
        const status = document.createElement('span');
        status.textContent = movie.watchlist === 'watched' ? '✔ Watched' : '⏳ To Watch';
        status.style.color = movie.watchlist === 'watched' ? 'green' : 'orange';

        const removeButton = document.createElement('span');
        removeButton.textContent = '❌';
        removeButton.classList.add('remove');
        removeButton.addEventListener('click', () => removeMovie(index));

        li.appendChild(title);
        li.appendChild(details);
        li.appendChild(status);
        li.appendChild(removeButton);
        movieList.appendChild(li);
    });
}

// Add event listeners to filter buttons
filters.forEach(button => {
    button.addEventListener('click', () => {
        const category = button.id.replace('filter-', '');
        if (category === 'all') {
            loadMovies();
        } else {
            filterMovies(category);
        }
    });
});

// Add movie when button is clicked
addButton.addEventListener('click', addMovie);

// Initial load of movies
loadMovies();
