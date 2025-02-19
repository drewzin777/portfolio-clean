// Initialize global variables
let map;
let service;
let infowindow;

// Initialize the map
function initMap() {
    const urlParams = new URLSearchParams(window.location.search);
    const placeId = urlParams.get("place_id");

    if (placeId) {
        console.log('Initializing Details Page...');
        initializeDetailsPage(placeId);
    } else {
        console.log('Initializing Main Page...');
        initializeMainPage();
    }
}

// Initialize the main page
function initializeMainPage() {
    const defaultLocation = { lat: 47.6062, lng: -122.3321 }; // Seattle, WA

    // Create Map with default location
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 15,
    });

    console.log("Map initialized at default location:", defaultLocation);

    // Use current location button
    document.getElementById('useLocation').addEventListener('click', getUserLocation);

    // Find Restaurants button click event
    document.getElementById('findRestaurants').addEventListener('click', () => {
        const locationInput = document.getElementById('location').value.trim();
        console.log("🔍 Searching restaurants for:", locationInput);

        if (locationInput) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: locationInput }, (results, status) => {
                console.log("📌 Geocoder status:", status);
                console.log("📊 Geocoder results:", results);

                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const geoLocation = results[0].geometry.location;
                    console.log("📍 Geocoded location (Before Fix):", geoLocation);

                    // ✅ Convert to proper Google Maps LatLng object
                    const latLng = new google.maps.LatLng(geoLocation.lat(), geoLocation.lng());

                    console.log("✅ Corrected LatLng Object:", latLng);

                    // ✅ Move map to new location
                    map.setCenter(latLng);
                    console.log("🗺️ Map recentered at:", latLng);

                    // ✅ Now search for restaurants in this new location
                    searchNearby(latLng);
                } else {
                    alert('❌ Geocoding failed: ' + status);
                }
            });
        } else {
            alert('⚠️ Please enter a city.');
        }
    });
}

// Initialize the details page
function initializeDetailsPage(placeId) {
    console.log(`🔍 Fetching details for Place ID: ${placeId}`);

    if (!google || !google.maps || !google.maps.places) {
        console.error("❌ Google Maps API is not loaded.");
        return;
    }

    // Initialize Google Map for the details page
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
    });

    // Create a PlacesService instance
    service = new google.maps.places.PlacesService(map);

    // Define request parameters
    const request = {
        placeId: placeId,
        fields: ["name", "formatted_address", "geometry", "rating", "photos", "website", "formatted_phone_number"],
    };

    // Fetch place details from Google Places API
    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("✅ Place details fetched:", place);

            if (place.geometry && place.geometry.location) {
                map.setCenter(place.geometry.location);
            }

            // Display restaurant details
            displayRestaurantDetails(place);
        } else {
            console.error("❌ Place details request failed. Status:", status);
        }
    });
}

// Display restaurant details on the page
function displayRestaurantDetails(place) {
    const detailsContainer = document.getElementById('details');
    if (!detailsContainer) {
        console.error("❌ 'details' container not found in HTML.");
        return;
    }

    let detailsHTML = `<h2>${place.name}</h2>`;
    detailsHTML += `<p><strong>Address:</strong> ${place.formatted_address}</p>`;
    detailsHTML += place.formatted_phone_number
        ? `<p><strong>Phone:</strong> ${place.formatted_phone_number}</p>`
        : `<p><strong>Phone:</strong> Not available</p>`;
    detailsHTML += place.website
        ? `<p><strong>Website:</strong> <a href="${place.website}" target="_blank">${place.website}</a></p>`
        : `<p><strong>Website:</strong> Not available</p>`;
    detailsHTML += place.rating
        ? `<p><strong>Rating:</strong> ${place.rating} ⭐</p>`
        : `<p><strong>Rating:</strong> Not available</p>`;

    // Display restaurant images if available
    if (place.photos && place.photos.length > 0) {
        detailsHTML += `<h3>Photos</h3>`;
        place.photos.slice(0, 3).forEach(photo => {
            detailsHTML += `<img src="${photo.getUrl()}" width="250" alt="Restaurant Image">`;
        });
    }

    detailsContainer.innerHTML = detailsHTML;
}

// Search nearby restaurants
function searchNearby(latLng) {
    console.log("📡 Preparing to send Places API request...");

    if (!latLng || !(latLng instanceof google.maps.LatLng)) {
        console.warn("⚠️ latLng is not a google.maps.LatLng object. Converting...");
        latLng = new google.maps.LatLng(latLng.lat(), latLng.lng());
    }

    if (!latLng || !(latLng instanceof google.maps.LatLng)) {
        console.error("❌ Invalid latLng object after conversion:", latLng);
        return;
    }

    console.log("✅ Final LatLng Object for Places API:", latLng);

    const request = {
        location: latLng,
        radius: 1500,
        type: ['restaurant']
    };

    console.log("✅ Final Places API Request:", request);

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        console.log("📡 Places API Response Status:", status);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            console.log("✅ Places API Response:", results);
            displayRestaurants(results);
        } else {
            console.error("❌ Nearby Search Failed. Status:", status);
        }
    });
}

// Display restaurants
function displayRestaurants(results) {
    const resultsList = document.getElementById('results');
    resultsList.innerHTML = '';

    if (!results || results.length === 0) {
        resultsList.innerHTML = `<li>No restaurants found.</li>`;
        return;
    }

    results.forEach((place) => {
        const listItem = document.createElement('li');
        listItem.textContent = place.name;
        listItem.onclick = () => alert(`You clicked on ${place.name}`);
        resultsList.appendChild(listItem);
    });
}

// Geolocation functions
function getUserLocation() {
    navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
}

function successCallback(position) {
    const location = { lat: position.coords.latitude, lng: position.coords.longitude };
    map.setCenter(location);
    searchNearby(location);
}

function errorCallback(error) {
    alert(`❌ Geolocation Error: ${error.message}`);
}
