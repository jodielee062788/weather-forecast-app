var apiKey = 'a093efb07c45f5c532564d226c47a457';
var searchForm = document.getElementById('search-form');
var cityInput = document.getElementById('cityInput');
var currentWeatherContainer = document.getElementById('currentWeather');
var forecastContainer = document.getElementById('forecast');
var historyList = document.getElementById('historyList');
var clearHistoryBtn = document.getElementById('clearHistoryBtn');

// Event listeners
searchForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var cityName = cityInput.value.trim();

    if (cityName) {
        getWeatherData(cityName);
    }
});

historyList.addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
        var cityName = event.target.textContent;
        getWeatherData(cityName);
    }
});

clearHistoryBtn.addEventListener('click', function() {
    clearSearchHistory();
});

// Fetch weather data from OpenWeatherMap API
function getWeatherData(cityName) {
    var geocodingApiUrl = 'https://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=' + apiKey;

    fetch(geocodingApiUrl)
        .then(response => response.json())
        .then(geocodingData => {

            // Check for errors in the geocoding API response
            if (geocodingData.message) {
                console.error('Geocoding API error:', geocodingData.message);
                return Promise.reject(new Error(geocodingData.message));
            }

            // Extract latitude and longitude
            var lat = geocodingData.coord.lat;
            var lon = geocodingData.coord.lon;

            // Construct forecast API URL
            var forecastApiUrl = 'https://api.openweathermap.org/data/2.5/forecast?lat=' + lat + '&lon=' + lon + '&appid=' + apiKey + '&units=metric';

            // Fetch forecast data
            return fetch(forecastApiUrl);
        })
        .then(response => response.json())
        .then(weatherData => {

            // Check for errors in the forecast API response
            if (weatherData.message) {
                console.error('Forecast API error:', weatherData.message);
                return Promise.reject(new Error(weatherData.message));
            }

            // Update current weather and forecast
            updateCurrentWeather(weatherData);
            updateForecastData(weatherData);
            addToSearchHistory(cityName);
        })
        .catch(error => {
            // Log errors during data fetching
            console.error('Error fetching data:', error);
        });
}

// Update the current weather display
function updateCurrentWeather(data) {

    // Check if the expected properties are present in the data
    if (data && data.list && data.list.length > 0) {
        var currentWeather = data.list[0];

        // Check if essential properties are present in currentWeather
        if (currentWeather.main && currentWeather.main.temp && currentWeather.wind && currentWeather.weather && currentWeather.weather[0]) {
            var name = data.city.name;
            var main = currentWeather.main;
            var weather = currentWeather.weather[0];
            var wind = currentWeather.wind;

            // Get the weather icon URL
            var weatherIcon = 'https://openweathermap.org/img/w/' + weather.icon + '.png';

            // Update the HTML of current weather container
            var html = '<h2>' + name + '</h2>' +
                '<p>Date: ' + new Date(currentWeather.dt * 1000).toLocaleDateString() + '</p>' +
                '<img src="' + weatherIcon + '" alt="Weather Icon">' +
                '<p>Temperature: ' + main.temp + ' °C</p>' +
                '<p>Humidity: ' + main.humidity + '%</p>' +
                '<p>Wind Speed: ' + wind.speed + ' m/s</p>' +
                '<p>Weather Conditions: ' + weather.description + '</p>';

            currentWeatherContainer.innerHTML = html;
            // Make the current weather container visible
            currentWeatherContainer.classList.remove('hidden');
        } else {
            console.error('Error: Invalid data format for current weather');
        }
    } else {
        console.error('Error: Invalid data format for current weather');
    }
}

// update the forecast container
function updateForecastData(data) {

    // Check if the expected properties are present in the data
    if (data && data.list && data.list.length > 0) {
        var forecastHtml = data.list.filter(item => item.dt_txt.includes('00:00:00')).map(item => {
            var forecastDate = new Date(item.dt * 1000 + data.city.timezone * 1000); // Adjust for timezone
            var formattedDate = forecastDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
            var weatherIcon = 'https://openweathermap.org/img/w/' + item.weather[0].icon + '.png';

            return generateForecastCard(item, formattedDate, weatherIcon);
        }).join('');

        // Update the HTML of forecast container
        forecastContainer.innerHTML = forecastHtml;
        // Make the forecast container visible
        forecastContainer.classList.remove('hidden');

    } else {
        console.error('Error: Invalid data format for forecast');
    }
}

// Generate HTML for a forecast card
function generateForecastCard(item, formattedDate, weatherIcon) {
    return '<div class="card">' +
        '<div class="card-body">' +
        '<h5 class="card-title">' + formattedDate + '</h5>' +
        '<img src="' + weatherIcon + '" alt="Weather Icon">' +
        '<p class="card-text">Current Temperature: ' + item.main.temp + ' °C</p>' +
        '<p class="card-text">Humidity: ' + item.main.humidity + '%</p>' +
        '<p class="card-text">Wind Speed: ' + item.wind.speed + ' m/s</p>' +
        '<p class="card-text">Weather Conditions: ' + item.weather[0].description + '</p>' +
        '</div>' +
        '</div>';
}

// Update search history in the UI
function updateSearchHistory(cityName) {
    var listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.textContent = cityName;
    historyList.appendChild(listItem);
}

// Add a city to the search history
function addToSearchHistory(cityName) {
    var history = loadSearchHistory();
    if (!history.includes(cityName)) {
        history.push(cityName);
        saveSearchHistory(history);
        updateSearchHistory(cityName);
    }
}

// Load search history from local storage
function loadSearchHistory() {
    var history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    historyList.innerHTML = '';
    
    // Check if there are items in the search history
    if (history.length > 0) {
        history.forEach(city => updateSearchHistory(city));
        clearHistoryBtn.style.display = 'block'; // Show the "Clear History" button
    } else {
        clearHistoryBtn.style.display = 'none'; // Hide the "Clear History" button
    }
    
    return history;
}

// Save search history to local storage
function saveSearchHistory(history) {
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

// Clear search history
function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    historyList.innerHTML = '';
}

// Load search history on page load
loadSearchHistory();
