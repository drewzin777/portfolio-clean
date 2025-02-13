
// 1️⃣ Initialize global variables
let map;
let service;
let infowindow;

// Fetch API Key from Netlify Functions
fetch('/.netlify/functions/getApiKey')
    .then(response => response.json())
    .then(data => {
        if (data.apiKey) {
            const script = document.createElement('script');
            script.src = `https://maps.googleapis.com/maps/api/js?key=${data.apiKey}&libraries=places`;
            script.async = true;
            script.defer = true;

            script.onload = () => {
                console.log("✅ Google Maps API script loaded.");
                initMap();
            };

            document.body.appendChild(script);
            console.log("✅ Google Maps API script added successfully.");
        } else {
            console.error("❌ API key not found. Check Netlify environment variables.");
        }
    })
    .catch(error => console.error("❌ Error fetching API key:", error));

// 3️⃣ Initialize the map
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

// 4️⃣ Function to initialize the main page
function initializeMainPage() {
    const defaultLocation = { lat: 47.6062, lng: -122.3321 }; // Seattle, WA
    
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
                console.log("📌 Geocoder status:", status);
                console.log("📊 Geocoder results:", results);

                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const location = {
                        lat: results[0].geometry.location.lat(),
                        lng: results[0].geometry.location.lng(),
                    };

                    console.log("📍 Geocoded location:", location);
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

// 5️⃣ Function to search nearby restaurants (runs before display)
function searchNearbyRestaurants(location) {
    if (!location || typeof location.lat !== "number" || typeof location.lng !== "number") {
        console.error("❌ Invalid location:", location);
        return;
    }

    console.log("📡 Search Request Received - Location:", location);

    const latLng = new google.maps.LatLng(location.lat, location.lng);
    map.setCenter(latLng);

    if (!service) {
        console.log("ℹ️ Initializing PlacesService...");
        service = new google.maps.places.PlacesService(map);
    }

    const request = {
        location: latLng,
        radius: 1500,
        type: ["restaurant"]
    };

    console.log("📡 Sending Places API Request:", request);

    try {
        service.nearbySearch(request, (results, status) => {
            console.log("🔍 Nearby Search Fired!");
            console.log("🔍 Nearby Search Status:", status);

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log("✅ Restaurants Found:", results);
                displayRestaurants(results);
            } else {
                console.error(`❌ Google Places API Error: ${status}`);
                console.error("🔴 Full API Response:", JSON.stringify(results, null, 2));
                alert(`Google Places API Error: ${status}`);
            }
        });
    } catch (error) {
        console.error("⚠️ Caught Error in Places API request:", error);
        alert(`Google Places API Error: ${error.message}`);
    }
}




// 6️⃣ Function to display restaurants (runs AFTER search)
function displayRestaurants(restaurants) {
    console.log("📃 Received Restaurants:", restaurants);

    const restaurantList = document.getElementById("results"); // Ensure this ID exists
    restaurantList.innerHTML = ""; // Clear previous results

    if (!restaurants || restaurants.length === 0) {
        console.log("⚠️ No restaurants found.");
        restaurantList.innerHTML = "<li>No restaurants found.</li>";
        return;
    }

    restaurants.forEach((restaurant, index) => {
        console.log(`📌 Processing Restaurant #${index + 1}:`, restaurant.name);

        const li = document.createElement("li");

        const link = document.createElement("a");
        link.href = `restaurant-detail.html?place_id=${restaurant.place_id}`;
        link.textContent = restaurant.name;
        link.style.display = "block";
        link.style.padding = "10px";
        link.style.textDecoration = "none";
        link.style.color = "#007BFF"; // Bootstrap blue
        link.style.fontWeight = "bold";

        li.appendChild(link);

        if (restaurant.vicinity) {
            const address = document.createElement("p");
            address.textContent = `📍 Address: ${restaurant.vicinity}`;
            li.appendChild(address);
        }

        restaurantList.appendChild(li);
    });
}

// 7️⃣ Function to get the user's location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        alert('❌ Geolocation is not supported by this browser.');
    }
}

// 8️⃣ Success callback for geolocation
function successCallback(position) {
    const location = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
    };
    console.log("📍 User location:", location);

    map.setCenter(location);
    searchNearbyRestaurants(location);
}

// 9️⃣ Error callback for geolocation
function errorCallback(error) {
    alert(`❌ Geolocation Error: ${error.message}`);
}

// 🔟 Function to initialize the restaurant details page
function initializeDetailsPage(placeId) {
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.730610, lng: -73.935242 },
        zoom: 15,
    });

    const request = {
        placeId: placeId,
        fields: ["name", "formatted_address", "geometry", "rating", "formatted_phone_number", "photos", "opening_hours", "website"],
    };

    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, handlePlaceDetails);
}

// Function to handle restaurant details
function handlePlaceDetails(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        document.getElementById("restaurant-name").textContent = place.name;
        document.getElementById("restaurant-address").textContent = place.formatted_address;
        document.getElementById("restaurant-rating").textContent = `⭐ Rating: ${place.rating || "N/A"}`;

        if (place.formatted_phone_number) {
            document.getElementById("restaurant-phone").textContent = `📞 Phone: ${place.formatted_phone_number}`;
        }

        if (place.website) {
            const websiteElement = document.getElementById("restaurant-url").firstElementChild;
            websiteElement.href = place.website;
            websiteElement.textContent = "🌍 Visit Website";
        }

        map.setCenter(place.geometry.location);

        new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
        });
    } else {
        console.error("❌ Failed to fetch place details:", status);
    }
}

// Ensure `initializeDetailsPage` runs only on the details page
window.onload = function () {
    if (window.location.pathname.includes("restaurant-detail.html")) {
        initializeDetailsPage();
    }
};




