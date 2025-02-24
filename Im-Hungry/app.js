 //initialize map
 let map; 
 let service;  
 let infowindow; 
 
 
 function initMap() {
     // Get place_Id from the URL
     const urlParams = new URLSearchParams(window.location.search);
     const place_Id = urlParams.get('place_id');
 
     if (place_Id) {
         console.log('initializeDetailsPage');
         // If a place_id exists, we're on the details page 
         initializeDetailsPage(place_Id);
     } else {
         // If no place_id, we're on the main page
         initializeMainPage();
     }
 }
 
 // Main page (index.html): search for nearby restaurants
 function initializeMainPage() {
    const defaultLocation = { lat: 47.6062, lng: -122.3321 }; // Seattle
 
     // Initialize map
     map = new google.maps.Map(document.getElementById('map'), {
         center: defaultLocation,
         zoom: 15,
     });
 
     // Event listener for the "Use My Location" button
     document.getElementById('useLocation').addEventListener('click', () => {
         getUserLocation();
     });
      
     // Event listener for the "Find Restaurants" button
     document.getElementById('findRestaurants').addEventListener('click', () => {
         const locationInput = document.getElementById('location').value;
 
         if (locationInput) {
             const geocoder = new google.maps.Geocoder();
             geocoder.geocode({ address: locationInput }, (results, status) => {
                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng(); 
                    const location = new google.maps.LatLng(lat, lng);
                    searchNearbyRestaurants(location);
                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    alert('No results found for the specified location. Please check the input and try again.');
                } else {
                    alert('Geocoding failed: ' + status);
                }
            });
        }
    });  
 }     
 
 // Get user's location using the browser's API
 function getUserLocation() {
     try {
         if (navigator.geolocation) {
             navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
         } else {
             alert('Geolocation is not supported by this browser.'); 
         }
     } catch (error) {
         console.error('Error occurred while getting user location:', error);
     }
 }
 
 // Success callback for geolocation
 function successCallback(position) {
     const lat = position.coords.latitude; 
     const lng = position.coords.longitude;
     console.log('User location: ', lat, lng); 
     const location = { lat: lat, lng: lng };
 
     // Center the map on user's location
     map.setCenter(location); 
     searchNearbyRestaurants(location); 
 }
     
 // Error callback for geolocation
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
 
 // Function to search nearby restaurants based on location
 function searchNearbyRestaurants(location) {
    if (typeof google === "undefined" || !google.maps || !google.maps.places) {
        console.error("Google Places API not available yet.");
        setTimeout(() => searchNearbyRestaurants(location), 500);
        return;
    }

    console.log("Searching nearby restaurants at:", location);

    const request = {
        location: location,
        radius: 1500,  // meters
        type: ['restaurant'],
    };

    try {
        service = new google.maps.places.PlacesService(map);
        service.nearbySearch(request, (results, status) => {
            console.log("Google Places API Response Status:", status);

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                console.log("Restaurants found:", results);
                handleResults(results, status);
            } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
                console.warn("⚠️ No restaurants found for this location.");
                alert("No nearby restaurants found. Try searching a different location.");
            } else {
                console.error("Google Places API Error:", status);
                alert(`Error fetching nearby restaurants: ${status}`);
            }
        });
    } catch (error) {
        console.error("Failed to fetch places:", error);
        alert("An error occurred while searching for nearby restaurants. Check console for details.");
    }
}
 
 // Details page (restaurant-detail.html): show details for a single restaurant 
 function initializeDetailsPage(place_Id) {
     // Initialize map with a default location
     map = new google.maps.Map(document.getElementById('map'), {
         center: { lat: 47.6062, lng: -122.3321 }, // Default location Seattle
         zoom: 15,
     });
 
     const request = {
         placeId: place_Id,
         fields: ['name', 'formatted_address', 'geometry', 'rating', 'formatted_phone_number', 'photos', 'opening_hours', 'website'],
     };
 
     service = new google.maps.places.PlacesService(map);
     service.getDetails(request, handlePlaceDetails);
 }
 
 // Handle search for multiple restaurants (for index.html)
 function handleResults(results, status) {
     if (status === google.maps.places.PlacesServiceStatus.OK) {
         document.getElementById('results').innerHTML = ''; // clear previous results
         
         results.forEach((place) => {
             const li = document.createElement('li');
             li.textContent = place.name;
 
             li.addEventListener('click', () => {
                 window.location.href = `restaurant-detail.html?place_id=${place.place_id}`;
             });
 
             document.getElementById('results').appendChild(li);
 
             // Add marker to map
             const markerElement = new google.maps.Marker({
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
 
 // Handle single restaurant details (for restaurant-detail.html)
 function handlePlaceDetails(place, status) {
     if (status == google.maps.places.PlacesServiceStatus.OK) {
         // Update details on page
         document.getElementById('restaurant-name').textContent = place.name;
         document.getElementById('restaurant-address').textContent = place.formatted_address;
         document.getElementById('restaurant-rating').textContent = `Rating: ${place.rating || 'N/A'}`;
 
         // Display phone number if available
         if (place.formatted_phone_number) {
             document.getElementById('restaurant-phone').textContent = `Phone: ${place.formatted_phone_number}`;
         }   
 
         // Display website if available
         if (place.website) {
             const websiteElement = document.getElementById('restaurant-url').firstElementChild;
             websiteElement.href = place.website; 
             websiteElement.textContent = 'Visit Website';
         } else {
             document.getElementById('restaurant-url').textContent = 'Website not available';
         }
    
         console.log(place.photos);
 
         // Display photos (up to 3) if available  
         if (place.photos && place.photos.length > 0) {
             // First photo
             const photoUrl1 = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 }); 
             document.getElementById('restaurant-photo1').src = photoUrl1;
 
             // Second photo
             if (place.photos.length > 1) {
                 const photoUrl2 = place.photos[1].getUrl({ maxWidth: 400, maxHeight: 400 }); 
                 document.getElementById('restaurant-photo2').src = photoUrl2;
             } else {
                 document.getElementById('restaurant-photo2').style.display = 'none';
             }
 
             // Third photo
             if (place.photos.length > 2) {
                 const photoUrl3 = place.photos[2].getUrl({ maxWidth: 400, maxHeight: 400 });
                 document.getElementById('restaurant-photo3').src = photoUrl3;
             } else {
                 document.getElementById('restaurant-photo3').style.display = 'none';
             }
         } else {
             document.getElementById('restaurant-photo1').style.display = 'none'; 
             document.getElementById('restaurant-photo2').style.display = 'none';
             document.getElementById('restaurant-photo3').style.display = 'none';
         }       
 
         // Display hours of operation
         if (place.opening_hours) {
             const hoursElement = document.getElementById('restaurant-hours');
             hoursElement.innerHTML = ''; // clear previous hours
             place.opening_hours.weekday_text.forEach(day => {
                 const dayElement = document.createElement('p');
                 dayElement.textContent = day;
                 hoursElement.appendChild(dayElement);
             });
         } else {
             document.getElementById('restaurant-hours').textContent = 'Hours not available';
         }
 
         // Center map on the restaurant's location and add a marker
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
 
 // New function to dynamically load the Google Maps API
 function loadGoogleMapsAPI() {
     const script = document.createElement("script");
     // Replace YOUR_API_KEY with your actual API key (ensure it is restricted in the Google Console)
     script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBWJBYBSWIoDNaP2Se9Rs-rmGTiOfH2iEI&callback=initMap&libraries=places";
     script.async = true;
     script.defer = true;
     script.onerror = function () {
         console.error("Failed to load Google Maps API. Check your API key and network connection.");
     };
     document.head.appendChild(script);
 }
 
 // Use the dynamic loader on window load
 window.onload = loadGoogleMapsAPI;
 

