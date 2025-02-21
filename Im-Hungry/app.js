 //initialize map
let map; 
let service;  
let infowindow; 

function initMap() {
    console.log("Google Maps API loaded successfully.");
    //get place_Id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const place_Id = urlParams.get('place_id');

    if (place_Id) {
        console.log('initialzeDetailsPage');
        //if a place_id exists were on details page 
        initializeDetailsPage(place_Id);
    } else {
        //if no place_id were on the index(main)page
        console.log('Initializing Main Page...');
        initializeMainPage();
    }
}
   
    //main page (index.html): search for nearby restaurants
    function initializeMainPage() {
        const defaultLocation = { lat: 40.730610, lng: -73.935242 }; //default location
    
    //initializze map
    map = new google.maps.Map(document.getElementById('map'), {
        center: defaultLocation,
        zoom: 15,
    });

    //event listener for the "Use My Location" button
    document.getElementById('useLocation').addEventListener('click', () => {
        getUserLocation();
    })
     
    //event listener for the "find restaurants" button
    document.getElementById('findRestaurants').addEventListener('click', () => {
        const locationInput = document.getElementById('location').value;

        if (locationInput) {
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ address: locationInput }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng(); 
                    const location = { lat: lat, lng: lng };
                    searchNearbyRestaurants(location);
                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    alert('No results found for the specified location. Please check the input and try again.');
                } else {
                    alert('Geocoding failed: ' + status);
                }
                });
            } else {
            alert('Plese enter a city.');
            }
        });
    }

    //get user's location using the browser's API
    function getUserLocation() {
    try{
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
        } else {
            alert('Geolocation is not supported by this browser.'); 
        }
    } catch (error) {
        console.error('Error occured while getting user location:', error);
        }
    }

    //success callback for geolocation
    function successCallback(position) {
        const lat = position.coords.latitude; 
        const lng = position.coords.longitude;
        console.log('User location: ', lat, lng); 
        const location = { lat: lat, lng: lng };

        //center the map on user's location
        map.setCenter(location); 
        searchNearbyRestaurants(location); 
    }
    
    //error callback for geolocation
    function errorCallback(error) {
        switch (error.code) {
            case error.PERMISSION_DENIED:
                alert('User denied the request for Geolocation. Please enable location and try again.'); 
                break; 
            case error.POSITION_UNAVAILABLE:
                alert('Location information is unavailable');
                break;
            case error.TIMEOUT: 
                alert('The request is to get user location timed out');
                break; 
            case error.UNKNOWN_ERROR:
                alert('An unknown error occured.');
                break;
        }
    }

    //function to search nearby restaurants based on location
    function searchNearbyRestaurants(location) {
        map.setCenter(location);
    
        const request = {
            location: location,
            radius: '1500',
            type: ['restaurant'],
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, handleResults);
}

//details page (restaurant-details.html): show details for a single restaurant 
function initializeDetailsPage(place_Id) {
    //initialize map with a default location
    map = new google.maps.Map(document.getElementById('map'), {
        center: { lat: 40.730610, lng: -73.935242 }, // Default location (NYC)
        zoom: 15,
    });

    const request = {
        placeId: place_Id,
        fields: ['name', 'formatted_address', 'geometry', 'rating', 'formatted_phone_number', 'photos', 'opening_hours', 'website'],
    };

    service = new google.maps.places.PlacesService(map);
    service.getDetails(request, handlePlaceDetails);
}

//handle search for multiple restaurants(for index.html)
// ... existing code remains the same until handleResults function ...

function handleResults(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        document.getElementById('results').innerHTML = ''; 
        
        results.forEach((place) => {
            const li = document.createElement('li');
            li.className = 'restaurant-item';
            
            // Enhanced restaurant information display
            li.innerHTML = `
                <h3>${place.name}</h3>
                ${place.vicinity ? `<p>${place.vicinity}</p>` : ''}
                ${place.rating ? `<p>Rating: ${place.rating} ⭐</p>` : ''}
            `;

            li.addEventListener('click', () => {
                window.location.href = `restaurant-detail.html?place_id=${place.place_id}`;
            });

            document.getElementById('results').appendChild(li);

            const marker = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
            });

            // Add click listener to marker
            marker.addListener('click', () => {
                window.location.href = `restaurant-detail.html?place_id=${place.place_id}`;
            });
        });
    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        document.getElementById('results').innerHTML = '<li>No nearby restaurants found. Try searching a different location</li>';
    } else {
        document.getElementById('results').innerHTML = '<li>Error fetching nearby restaurants. Please check your network connection and try again.</li>';
    }
}

// Add the missing handlePlaceDetails function
function handlePlaceDetails(place, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        // Center map on restaurant location
        map.setCenter(place.geometry.location);
        
        // Create marker for the restaurant
        new google.maps.Marker({
            map: map,
            position: place.geometry.location
        });
        
        // Update page content with restaurant details
        document.getElementById('restaurant-name').textContent = place.name;
        document.getElementById('restaurant-address').textContent = place.formatted_address;
        document.getElementById('restaurant-phone').textContent = place.formatted_phone_number || 'Not available';
        document.getElementById('restaurant-rating').textContent = place.rating ? `${place.rating} ⭐` : 'Not rated';
        
        if (place.website) {
            const websiteLink = document.getElementById('restaurant-website');
            websiteLink.href = place.website;
            websiteLink.textContent = place.website;
        }
        
        if (place.photos && place.photos.length > 0) {
            const img = document.getElementById('restaurant-photo');
            img.src = place.photos[0].getUrl();
            img.alt = place.name;
        }
    } else {
        console.error('Error fetching restaurant details:', status);
        alert('Error fetching restaurant details. Please try again later.');
    }
}

//window.onload = initMap;


