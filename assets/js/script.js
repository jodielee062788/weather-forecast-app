var apiKey = 'a093efb07c45f5c532564d226c47a457';
var searchForm = document.getElementById('search-form');
var cityInput = document.getElementById('cityInput');
var currentWeatherContainer = document.getElementById('currentWeather');
var forecastContainer = document.getElementById('forecast');
var historyList = document.getElementById('historyList');

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

function getWeatherData(cityName) {
    const geocodingApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;

    fetch(geocodingApiUrl)
        .then(response => response.json())
        .then(geocodingData => {
            console.log('Geocoding Data:', geocodingData);

            if (geocodingData.message) {
                console.error('Geocoding API error:', geocodingData.message);
                return Promise.reject(new Error(geocodingData.message));
            }

            const { lat, lon } = geocodingData.coord;
            const forecastApiUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

            return fetch(forecastApiUrl);
        })
        .then(response => response.json())
        .then(weatherData => {
            console.log('Weather Data:', weatherData);

            if (weatherData.message) {
                console.error('Forecast API error:', weatherData.message);
                return Promise.reject(new Error(weatherData.message));
            }

            updateCurrentWeather(weatherData);
            handleForecastData(weatherData);
            addToSearchHistory(cityName);
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}


function updateCurrentWeather(data) {
    console.log('Current Weather Data:', data);

    if (data && data.main && data.weather && data.weather.length > 0) {
        var { name } = data;
        var { main, weather, wind } = data;

        console.log('Name:', name);
        console.log('Main:', main);
        console.log('Weather:', weather);
        console.log('Wind:', wind);

        var weatherIcon = `https://openweathermap.org/img/w/${weather[0].icon}.png`;

        var html = `
            <h2>${name}</h2>
            <p>Date: ${new Date(data.dt * 1000).toLocaleDateString()}</p>
            <img src="${weatherIcon}" alt="Weather Icon">
            <p>Temperature: ${main.temp} °C</p>
            <p>Humidity: ${main.humidity}%</p>
            <p>Wind Speed: ${wind.speed} m/s</p>
            <p>Weather Conditions: ${weather[0].description}</p>
        `;
        currentWeatherContainer.innerHTML = html;
        currentWeatherContainer.classList.remove('hidden');
    } else {
        console.error('Error: Invalid data format for current weather');
    }
}


function handleForecastData(data) {
    console.log('Forecast Data:', data);

    if (data && data.list && data.list.length > 0) {
        const forecastHtml = data.list.filter(item => item.dt_txt.includes('00:00:00')).map(item => {
            const forecastDate = new Date(item.dt * 1000 + data.city.timezone * 1000); // Adjust for timezone
            const formattedDate = forecastDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
            const weatherIcon = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;

            return generateForecastCard(item, formattedDate, weatherIcon);
        }).join('');

        forecastContainer.innerHTML = forecastHtml;
        forecastContainer.classList.remove('hidden');

        console.log('Forecast container updated and made visible.');
        console.log('forecastContainer:', forecastContainer);
    } else {
        console.error('Error: Invalid data format for forecast');
    }
}


function generateForecastCard(item, formattedDate, weatherIcon) {
    return `
        <div class="card">
            <div class="card-body">
                <h5 class="card-title">${formattedDate}</h5>
                <img src="${weatherIcon}" alt="Weather Icon">
                <p class="card-text">Current Temperature: ${item.main.temp} °C</p>
                <p class="card-text">Humidity: ${item.main.humidity}%</p>
                <p class="card-text">Wind Speed: ${item.wind.speed} m/s</p>
                <p class="card-text">Weather Conditions: ${item.weather[0].description}</p>
            </div>
        </div>
    `;
}


function updateSearchHistory(cityName) {
    var listItem = document.createElement('li');
    listItem.classList.add('list-group-item');
    listItem.textContent = cityName;
    historyList.appendChild(listItem);
}

function addToSearchHistory(cityName) {
    var history = loadSearchHistory();
    if (!history.includes(cityName)) {
        history.push(cityName);
        saveSearchHistory(history);
        updateSearchHistory(cityName);
    }
}

function loadSearchHistory() {
    var history = JSON.parse(localStorage.getItem('searchHistory')) || [];
    historyList.innerHTML = '';
    history.forEach(city => updateSearchHistory(city));
    return history;
}

function saveSearchHistory(history) {
    localStorage.setItem('searchHistory', JSON.stringify(history));
}

function clearSearchHistory() {
    localStorage.removeItem('searchHistory');
    historyList.innerHTML = '';
}

loadSearchHistory();
