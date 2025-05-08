let map;

document
  .getElementById("weatherForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = document.getElementById("cityInput").value.trim();
    fetchWeatherByCity(city);
  });

document
  .getElementById("locationButton")
  .addEventListener("click", async () => {
    const resultsDiv = document.getElementById("weatherResults");
    const loadingDiv = document.getElementById("loading");
    resultsDiv.innerHTML = "";
    loadingDiv.classList.remove("hidden");

    if (!navigator.geolocation) {
      resultsDiv.innerHTML =
        '<p id="error">Geolocation is not supported by your browser.</p>';
      loadingDiv.classList.add("hidden");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fetchWeatherByCoordinates(latitude, longitude);
        loadingDiv.classList.add("hidden");
      },
      () => {
        resultsDiv.innerHTML =
          '<p id="error">Unable to retrieve your location.</p>';
        loadingDiv.classList.add("hidden");
      }
    );
  });

async function fetchWeatherByCity(city) {
  const resultsDiv = document.getElementById("weatherResults");
  const loadingDiv = document.getElementById("loading");
  resultsDiv.innerHTML = "";
  loadingDiv.classList.remove("hidden");

  if (!city) {
    resultsDiv.innerHTML = '<p id="error">Please enter a valid city name.</p>';
    loadingDiv.classList.add("hidden");
    return;
  }

  try {
    const response = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city }),
    });

    const data = await response.json();

    if (response.ok) {
      displayWeather(data.weather);
    } else {
      resultsDiv.innerHTML = `<p id="error">${data.error}</p>`;
    }
  } catch (error) {
    resultsDiv.innerHTML =
      '<p id="error">An error occurred while fetching weather data. Please try again later.</p>';
  } finally {
    loadingDiv.classList.add("hidden");
  }
}

async function fetchWeatherByCoordinates(latitude, longitude) {
  const resultsDiv = document.getElementById("weatherResults");
  const loadingDiv = document.getElementById("loading");
  resultsDiv.innerHTML = "";

  try {
    const response = await fetch("/api/weather", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: latitude, lon: longitude }),
    });

    const data = await response.json();

    if (response.ok) {
      displayWeather(data.weather);
    } else {
      resultsDiv.innerHTML = `<p id="error">${data.error}</p>`;
    }
  } catch (error) {
    resultsDiv.innerHTML =
      '<p id="error">An error occurred while fetching weather data. Please try again later.</p>';
  } finally {
    loadingDiv.classList.add("hidden");
  }
}

function displayWeather(weather) {
  const resultsDiv = document.getElementById("weatherResults");

  resultsDiv.innerHTML = `
    <div class="results-container">
      <div class="weather-info">
        <h2 class="city-name">${weather.city}</h2>
        <img src="https://openweathermap.org/img/wn/${weather.icon}@2x.png" alt="${weather.description}" class="weather-icon" />
        <div class="weather-data">
          <div class="weather-stat">
            <span class="stat-label">Temperature</span>
            <span class="stat-value">${weather.temperature} °C</span>
          </div>
          <div class="weather-stat">
            <span class="stat-label">Feels Like</span>
            <span class="stat-value">${weather.feels_like} °C</span>
          </div>
          <div class="weather-stat">
            <span class="stat-label">Condition</span>
            <span class="stat-value">${weather.description}</span>
          </div>
          <div class="weather-stat">
            <span class="stat-label">Wind Speed</span>
            <span class="stat-value">${weather.wind_speed} m/s</span>
          </div>
          <div class="weather-stat">
            <span class="stat-label">Humidity</span>
            <span class="stat-value">${weather.humidity}%</span>
          </div>
        </div>
      </div>
      <div class="map-container">
        <div id="map"></div>
      </div>
    </div>
  `;

  //map delay timeout
  setTimeout(() => {
    initMap(weather.lat, weather.lon, weather.city);
  }, 100);
}

function initMap(lat, lon, city) {
  if (map) {
    map.remove();
  }

  map = L.map("map").setView([lat, lon], 10);

  L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  //Marker
  L.marker([lat, lon]).addTo(map).bindPopup(`<b>${city}</b>`).openPopup();

  setTimeout(() => {
    map.invalidateSize();
  }, 100);
}
