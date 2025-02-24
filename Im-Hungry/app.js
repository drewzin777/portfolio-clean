 //initialize map
 // Initialize global variables
let map;
let service;
let infowindow;

function initMap() {
    if (typeof google === "undefined" || !google.maps) {
        console.error("❌ Google Maps API not yet available. Retrying...");
        setTimeout(initMap, 500);
        return;
    }

    console.log("✅ Google Maps API loaded successfully.");
    initializeMainPage();
}

function initializeMainPage() {
    const defaultLocation = { lat: 47.6062, lng: -122.3321 }; // Seattle

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
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng();
                    const location = new google.maps.LatLng(lat, lng);
    
                    map.setCenter(location);
                    map.setZoom(15);
    
                    setTimeout(() => {
                        searchNearbyRestaurants(location);
                    }, 500);
                } else {
                    alert('Location not found. Please try again.');
                }
            });
        } else {
            alert('Please enter a city.');
        }
    });
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

function successCallback(position) {
    const lat = position.coords.latitude;
    const lng = position.coords.longitude;
    const location = new google.maps.LatLng(lat, lng);
    
    map.setCenter(location);
    searchNearbyRestaurants(location);
}

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

function searchNearbyRestaurants(location) {
    if (!map || !google.maps.places) {
        console.error("Maps or Places API not loaded");
        return;
    }

    if (!service) {
        service = new google.maps.places.PlacesService(map);
    }

    const request = {
        location: location,
        radius: 1500,
        type: ['restaurant']
    };

    try {
        service.nearbySearch(request, (results, status) => {
            if (status === google.maps.places.PlacesServiceStatus.OK) {
                handleResults(results, status);
            } else {
                console.error("Places API Error:", status);
                document.getElementById('results').innerHTML = 
                    '<div>Error finding restaurants. Please try again.</div>';
            }
        });
    } catch (error) {
        console.error("Search error:", error);
    }
}

function handleResults(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        const resultsContainer = document.getElementById('results');
        resultsContainer.innerHTML = '';
        
        results.forEach((place) => {
            const li = document.createElement('li');
            li.className = 'restaurant-item';
            
            li.innerHTML = `
                <h3>${place.name}</h3>
                ${place.vicinity ? `<p>${place.vicinity}</p>` : ''}
                ${place.rating ? `<p>Rating: ${place.rating} ⭐</p>` : ''}
            `;

            li.addEventListener('click', () => {
                getRestaurantDetails(place.place_id);
            });

            resultsContainer.appendChild(li);

            const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name
            });

            marker.addListener('click', () => {
                getRestaurantDetails(place.place_id);
            });
        });
    }
}

function getRestaurantDetails(placeId) {
    const request = {
        placeId: placeId,
        fields: ['name', 'formatted_address', 'rating', 'formatted_phone_number', 'website', 'opening_hours']
    };

    service.getDetails(request, (place, status) => {
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            const details = `
                ${place.name}
                Address: ${place.formatted_address}
                ${place.formatted_phone_number ? `Phone: ${place.formatted_phone_number}` : ''}
                ${place.rating ? `Rating: ${place.rating}` : ''}
                ${place.website ? `Website: ${place.website}` : ''}
            `;
            alert(details);
        }
    });
}

// Initialize the map when the page loads
window.onload = initMap;
