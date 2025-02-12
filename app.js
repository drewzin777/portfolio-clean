
let map;
let service;
let infowindow;

// Fetch the API key securely from Netlify
fetch('/.netlify/functions/getApiKey')
    .then(response => response.json())
    .then(data => {
        const apiKey = data.apiKey;
        console.log("Fetched API Key:", apiKey);

        if (!apiKey || apiKey.length < 30) {
            console.error("Invalid API Key received:", apiKey);
            alert("The API key is missing or incorrect. Please check your Netlify environment variables.");
            return;
        }

        // Dynamically load Google Maps API script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
        script.async = true;
        script.defer = true;

        script.onload = () => {
            console.log("Google Maps API script loaded.");
            initMap();
        };

        document.body.appendChild(script);
        console.log("Google Maps API script added.");
    })
    .catch(error => {
        console.error("Error fetching API Key:", error);
        alert("Failed to load the Google Maps API. Please try again.");
    });

// Define global initMap function
window.initMap = function () {
    const urlParams = new URLSearchParams(window.location.search);
    const place_Id = urlParams.get('place_id');

    if (place_Id) {
        console.log('Initializing Details Page...');
        initializeDetailsPage(place_Id);
    } else {
        console.log('Initializing Main Page...');
        initializeMainPage();
    }
};

// Initialize Main Page
function initializeMainPage() {
    const defaultLocation = { lat: 40.730610, lng: -73.935242 };

    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 15,
    });

    document.getElementById('useLocation').addEventListener('click', getUserLocation);
    document.getElementById('findRestaurants').addEventListener('click', () => {
        const locationInput = document.getElementById('location').value;

        if (locationInput) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: locationInput }, (results, status) => {
                console.log("Geocoder status:", status);
                console.log("Geocoder results:", results);

                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng();
                    const location = { lat, lng };

                    console.log("Geocoded location:", location);
                    searchNearbyRestaurants(location);
                } else {
                    alert('Geocoding failed: ' + status);
                }
            });
        } else {
            alert('Please enter a city.');
        }
    });
}

// Search Nearby Restaurants (Fixed)
function searchNearbyRestaurants(location) {
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
        console.error("Invalid location:", location);
        return;
    }

    const latLng = new google.maps.LatLng(location.lat, location.lng);
    map.setCenter(latLng);

    const request = {
        location: latLng,
        radius: 5000,
        type: ["restaurant"]
    };

    if (!service) {
        service = new google.maps.places.PlacesService(map);
    }

    console.log("Sending Places API Request:", request);

    service.nearbySearch(request, (results, status) => {
        console.log("Nearby Search Status:", status);
        console.log("Nearby Search Results:", results);

        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayRestaurants(results);
        } else {
            console.error("Places API Error:", status);
            alert(`Google Places API Error: ${status}`);
        }
    });
}

// Display Restaurants
function displayRestaurants(restaurants) {
    console.log("Received Restaurants:", restaurants);

    const restaurantList = document.getElementById("results");
    restaurantList.innerHTML = "";

    if (!restaurants || restaurants.length === 0) {
        restaurantList.innerHTML = "<li>No restaurants found.</li>";
        return;
    }

    restaurants.forEach((restaurant) => {
        console.log("Processing Restaurant:", restaurant.name);

        const li = document.createElement("li");
        li.textContent = restaurant.name;

        if (restaurant.vicinity) {
            const address = document.createElement("p");
            address.textContent = `Address: ${restaurant.vicinity}`;
            li.appendChild(address);
        }

        li.addEventListener("click", () => {
            window.location.href = `restaurant-detail.html?place_id=${restaurant.place_id}`;
        });

        restaurantList.appendChild(li);

        new google.maps.Marker({
            position: restaurant.geometry.location,
            map: map,
            title: restaurant.name,
        });
    });
}

// Get User Location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        alert('Geolocation is not supported by this browser.');
    }
}

// Success Callback for Geolocation
function successCallback(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    console.log('User location: ', lat, lng);
    const location = { lat, lng };

    map.setCenter(location);
    searchNearbyRestaurants(location);
}

// Error Callback for Geolocation
function errorCallback(error) {
    alert(`Geolocation Error: ${error.message}`);
}

// Initialize Details Page
function initializeDetailsPage(place_Id) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.730610, lng: -73.935242 },
        zoom: 15,
    });

    const request = {
        placeId: place_Id,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'formatted_phone_number', 'photos', 'opening_hours', 'website'],
    };

    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, handlePlaceDetails);
}

// Handle Place Details
function handlePlaceDetails(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        document.getElementById('restaurant-name').textContent = place.name;
        document.getElementById('restaurant-address').textContent = place.formatted_address;
        document.getElementById('restaurant-rating').textContent = `Rating: ${place.rating || 'N/A'}`;

        if (place.formatted_phone_number) {
            document.getElementById('restaurant-phone').textContent = `Phone: ${place.formatted_phone_number}`;
        }

        if (place.website) {
            const websiteElement = document.getElementById('restaurant-url').firstElementChild;
            websiteElement.href = place.website;
            websiteElement.textContent = 'Visit Website';
        }

        map.setCenter(place.geometry.location);

        new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
        });
    } else {
        console.error('Failed to get place details ', status);
    }
}





