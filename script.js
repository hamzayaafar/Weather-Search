
/** Google Apps Script Web App used to extract information from OpenWeather API */
const GAS_URL = 'https://script.google.com/macros/s/AKfycbyi2wEWRruFsSEzFr4gxNiaF_k_aWkL6cxiFAMN0XeVPRCC8pSqCj3a20er4--ZSUMw/exec';

/**
 * Creates a map object connected to index.html
 * @type {L.Map}
 */
let map = L.map('map').setView([33.7756222, -84.398479], 13);

/**
 * The main function that sets an event listener on the submit button and displays the previous searches. It also sets the tilelayer and adds it to the map. 
 */
function main() {
L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
  }).addTo(map);
  document.getElementById('submit').addEventListener('click', search);
  showSearches();
}

try {
  main();
} catch (e) {
  console.error(e);
}

/**
 * Assigns the inputted location to a variable
 * Calls functions to get weather data and to store location in local storage
 */
function search() {
  const location = document.getElementById('areaInput').value;
  getWeatherDataFromGAS(location, GAS_URL);
  storeSearch(location);
}

/**
 * Fetches weather data from the Google Apps Script Web App.
 * After data is fetched, updateMap is called to insert data and change location.
 * @async
 * @function
 * @param {string} location - location to retrieve weather data for.
 * @param {string} url - Endpoint URL of the GAS Web App.
 * @throws Will throw an error if the fetch fails.
 */
async function getWeatherDataFromGAS(location, url) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      body: JSON.stringify({ location })
    });
    const data = await response.json();
    updateMap(data);
  } catch (error) {
    console.error('Fetch error:', error);
    showAlert('Error: ' + error.message);
  }
}

/**
 * Stores the locatiomn in local storage.
 * It also updates the display of previous searches.
 *
 * @function
 * @param {string} location - Location that was searched for.
 */
function storeSearch(location) {
  const searches = JSON.parse(localStorage.getItem('searches')) || [];
  searches.push(location);
  localStorage.setItem('searches', JSON.stringify(searches));
  showSearches();
}

/**
 * Displays locations stored in local storage.
 */
function showSearches() {
  const container = document.getElementById('previousSearches');
  const searches = JSON.parse(localStorage.getItem('searches')) || [];
  container.innerHTML = searches.join(', ');
}

/**
 * Displays an alert message on the webpage.
 *
 * @function
 * @param {string} message - The message to be displayed in the alert.
 */
function showAlert(message) {
  document.getElementById('alert').innerText = message;
}

/**
 * Updates the view of the map to the location selected.
 * Adds a marker with popup data to the map, without deleting previous markers.
 * Information being added includes icon, temperature, windspeed, description, and the name of the location.
 *
 * @function
 * @param {Object} data - The weather data received from the API.
 */
function updateMap(data) {
    if (data.status === 'Error') {
      showAlert('Location not found');
    } else {
      map.setView([data.lat, data.long], 10);
      let marker = L.marker([data.lat, data.long]).addTo(map);
      let popup = `
          <div>
            <h4> ${data.name} </h4>
            <img src="https://openweathermap.org/img/wn/${data.icon}@2x.png">
              <p>Temperature: ${data.temp}°F</p>
              <p>Wind Speed: ${data.windspd} mph</p>
              <p>Description: ${data.description}</p>
          </div>
      `;
      marker.bindPopup(popup).openPopup();
    }
}


