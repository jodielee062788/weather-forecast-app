document.addEventListener("DOMContentLoaded", function () {
    const apiKey = 'a093efb07c45f5c532564d226c47a457';
    const searchForm = document.getElementById('search-form');
    const cityInput = document.getElementById('cityInput');
    const currentWeatherContainer = document.getElementById('currentWeather');
    const forecastContainer = document.getElementById('forecast');
    const historyList = document.getElementById('historyList');

    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();
        const cityName = cityInput.value.trim();

        if (cityName) {
            getWeatherData(cityName);
        }
    });

    historyList.addEventListener('click', function(event) {
        if (event.target.tagName === 'LI') {
            const cityName = event.target.textContent;
            getWeatherData(cityName);
        }
    });
    
    function getWeatherData(cityName) {
        const apiUrl = 'https://api.openweathermap.org/data/2.5/forecast';
        const units = 'metric';
        const geocodingApiUrl = `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${apiKey}`;
    
        fetch(geocodingApiUrl)
            .then(response => response.json())
            .then(geocodingData => {
                console.log('Geocoding Data:', geocodingData);
    
                if (geocodingData.message) {
                    // Handle errors from the geocoding API
                    console.error('Geocoding API error:', geocodingData.message);
                    return Promise.reject(new Error(geocodingData.message));
                }
    
                const { lat, lon } = geocodingData.coord;
                const forecastApiUrl = `${apiUrl}?lat=${lat}&lon=${lon}&appid=${apiKey}&units=${units}`;
                return fetch(forecastApiUrl);
            })
            .then(response => response.json())
            .then(weatherData => {
                console.log('Weather Data:', weatherData);
    
                if (weatherData.message) {
                    // Handle errors from the forecast API
                    console.error('Forecast API error:', weatherData.message);
                    return Promise.reject(new Error(weatherData.message));
                }
    
                updateCurrentWeather(weatherData);
                updateForecast(weatherData);
                addToSearchHistory(cityName);
            })
            .catch(error => {
                console.error('Error fetching data:', error);
            });
    }
    
    function updateCurrentWeather(data) {
        console.log('Updating Current Weather:', data);
    
        // Check if the expected properties are present in the data
        if (data && data.list && data.list.length > 0) {
            const currentWeather = data.list[0];
    
            if (currentWeather.main && currentWeather.main.temp && currentWeather.wind && currentWeather.weather && currentWeather.weather[0]) {
                const { name } = data.city;
                const { main, weather, wind } = currentWeather;
    
                // Get the weather icon URL
                const weatherIcon = `https://openweathermap.org/img/w/${weather[0].icon}.png`;
    
                const html = `
                    <h2>${name}</h2>
                    <p>Date: ${new Date(currentWeather.dt * 1000).toLocaleDateString()}</p>
                    <img src="${weatherIcon}" alt="Weather Icon">
                    <p>Temperature: ${main.temp} °C</p>
                    <p>Humidity: ${main.humidity}%</p>
                    <p>Wind Speed: ${wind.speed} m/s</p>
                    <p>Weather Conditions: ${weather[0].description}</p>
                `;
                currentWeatherContainer.innerHTML = html;
            } else {
                console.error('Error: Invalid data format for current weather');
            }
        } else {
            console.error('Error: Invalid data format for current weather');
        }
    }
    
    function updateForecast(data) {
        console.log('Updating Forecast:', data);
    
        // Check if the expected properties are present in the data
        if (data && data.list && data.list.length > 0) {
            const forecastHtml = data.list.filter(item => item.dt_txt.includes('12:00:00')).map(item => {
                const forecastDate = new Date(item.dt * 1000 + data.city.timezone * 1000); // Adjust for timezone
                const formattedDate = forecastDate.toLocaleDateString('en-US', { timeZone: 'UTC' });
                const weatherIcon = `https://openweathermap.org/img/w/${item.weather[0].icon}.png`;
    
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
            }).join('');
    
            forecastContainer.innerHTML = forecastHtml;
        } else {
            console.error('Error: Invalid data format for forecast');
        }
    }
    
    
    function updateSearchHistory(cityName) {
        // Implement the logic to update the search history HTML
        const listItem = document.createElement('li');
        listItem.classList.add('list-group-item');
        listItem.textContent = cityName;
        historyList.appendChild(listItem);
    }

    function addToSearchHistory(cityName) {
        // Implement the logic to add a city to the search history
        const history = loadSearchHistory();
        if (!history.includes(cityName)) {
            history.push(cityName);
            saveSearchHistory(history);
            updateSearchHistory(cityName);
        }
    }

    function loadSearchHistory() {
        // Implement the logic to load and display the search history from localStorage
        const history = JSON.parse(localStorage.getItem('searchHistory')) || [];
        historyList.innerHTML = ''; // Clear the current list
        history.forEach(city => updateSearchHistory(city));
        return history;
    }

    function saveSearchHistory(history) {
        // Implement the logic to save the search history to localStorage
        localStorage.setItem('searchHistory', JSON.stringify(history));
    }

    function clearSearchHistory() {
        // Implement the logic to clear the search history from localStorage
        localStorage.removeItem('searchHistory');
        historyList.innerHTML = ''; // Clear the current list
    }

    // Load search history on page load
    loadSearchHistory();
});
