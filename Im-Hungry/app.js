// Initialize global variables
let map; 
let service;  
let infowindow; 

function initMap() {
    if (typeof google === "undefined" || !google.maps) {
        console.error("❌ Google Maps API not yet available. Retrying...");
        setTimeout(initMap, 500); // Retry after 500ms
        return;
    }

    console.log("✅ Google Maps API loaded successfully.");

    const urlParams = new URLSearchParams(window.location.search);
    const place_Id = urlParams.get('place_id');

    if (place_Id) {
        console.log('🔍 Initializing Details Page...');
        initializeDetailsPage(place_Id);
    } else {
        console.log('📍 Initializing Main Page...');
        initializeMainPage();
    }
}


function getUserLocation() {
    try {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        } else {
            alert('❌ Geolocation is not supported by this browser.');
        }
    } catch (error) {
        console.error('❌ Error occurred while getting user location:', error);
    }
}


function initializeMainPage() {
    const defaultLocation = { lat: 40.730610, lng: -73.935242 };

    // Initialize map
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 15,
    });

    // Event listener for "Use My Location" button
    document.getElementById('useLocation').addEventListener('click', getUserLocation);

    // Event listener for "Find Restaurants" button
    document.getElementById('findRestaurants').addEventListener('click', () => {
        const locationInput = document.getElementById('location').value;
    
        if (locationInput) {
            const geocoder = new google.maps.Geocoder();
    
            geocoder.geocode({ address: locationInput }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const location = results[0].geometry.location;
    
                    console.log("📌 Geocoded Location:", location.lat(), location.lng());

                    // ✅ Center the map on the searched location
                    map.setCenter(location);
                    map.setZoom(15); 

                    // ✅ Now search for restaurants
                    searchNearbyRestaurants(location);
                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    console.warn("⚠️ No results found for location:", locationInput);
                    alert('No results found for the specified location. Please check the input and try again.');
                } else {
                    console.error("❌ Geocoding failed:", status);
                    alert('Geocoding failed: ' + status);
                }
            });
        } else {
            alert('❌ Please enter a city.');
        }
    });
}

// ✅ Corrected successCallback() function
function successCallback(position) {
    const lat = position.coords.latitude; 
    const lng = position.coords.longitude;
    console.log('📍 User location:', lat, lng); 

    const location = new google.maps.LatLng(lat, lng);  

    map.setCenter(location);  
    searchNearbyRestaurants(location);  
}


// 
function errorCallback(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert('User denied the request for Geolocation. Please enable location and try again.'); 
            break; 
        case error.POSITION_UNAVAILABLE:
            alert('Location information is unavailable');
            break;
        case error.TIMEOUT: 
            alert('The request to get user location timed out');
            break; 
        case error.UNKNOWN_ERROR:
            alert('An unknown error occurred.');
            break;
    }
}

// 
function searchNearbyRestaurants(location) {
    if (typeof google === "undefined" || !google.maps || !google.maps.places) {
        console.error("❌ Google Places API is not available yet.");
        setTimeout(() => searchNearbyRestaurants(location), 500);
        return;
    }

    console.log("🔍 Searching nearby restaurants at:", location);

    const request = {
        location: location,
        radius: 1500,  
        type: ['restaurant'],
    };

    try {
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            console.log("📌 Google Places API Response Status:", status);

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log("✅ Restaurants found:", results);
                handleResults(results, status);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.warn("⚠️ No restaurants found for this location.");
                alert("No nearby restaurants found. Try searching a different location.");
            } else {
                console.error("❌ Google Places API Error:", status);
                alert(`Error fetching nearby restaurants: ${status}`);
            }
        });
    } catch (error) {
        console.error("❌ Failed to fetch places:", error);
        alert("An error occurred while searching for nearby restaurants. Check console for details.");
    }
}

// 
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

// 
function handleResults(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        document.getElementById('results').innerHTML = ''; 
        
        results.forEach((place) => {
            const li = document.createElement('li');
            li.textContent = place.name;

            li.addEventListener('click', () => {
                window.location.href = `restaurant-detail.html?place_id=${place.place_id}`;
            });

            document.getElementById('results').appendChild(li);

            new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
            });
        });
    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert('No nearby restaurants found. Try searching a different location');
    } else {
        alert('Error fetching nearby restaurants. Please check your network connection and try again.');
    }
}


window.onload = initMap;
