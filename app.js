
let map; 
let service;  
let infowindow; 


 //Fetch the API key securely from the Netlify function
 fetch('/.netlify/functions/getApiKey')
       .then(response => response.json())
       .then(data => {
       const apiKey = data.apiKey;           // Retrieved securely from Netlify
       console.log("Fetched API Key:", apiKey);

       if (!apiKey || apiKey.length < 30) {
        console.error("Invalid API Key received:", apiKey);
        alert("The API key is missing or incorrect. Please check your Netlify environment variables.");
        return;
    }

       // Dynamically load Google Maps API script
       const script = document.createElement('script');
       script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&callback=initMap&libraries=places`;
       script.async = true;
       script.defer = true;

       document.body.appendChild(script);

       console.log("Google Maps API script added.");
   })
    .catch(error => {  
        console.error("Error fetching API Key:", error);
        alert("Failed to load the Google Maps API. Please try again.");
    });
 
//Define the global initMap function
window.initMap = function() {
    //get place_Id from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const place_Id = urlParams.get('place_id');

    if (place_Id) {
        console.log('initialzeDetailsPage');
        //if a place_id exists were on details page 
        initializeDetailsPage(place_Id);
    } else {
        console.log('Initializing main page...');
        initializeMainPage();
    }
};
   
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
                console.log("Geocoder status:", status); // Debugging
                console.log("Geocoder results:", results); // Debugging

                if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
                    const lat = results[0].geometry.location.lat();
                    const lng = results[0].geometry.location.lng(); 
                    const location = { lat: lat, lng: lng };

                    console.log("Geocoded location:", location); // Debugging
                    searchNearbyRestaurants(location);
                } else if (status === google.maps.GeocoderStatus.ZERO_RESULTS) {
                    alert('No results found for the specified location. Please check the input and try again.');
                } else {
                    alert('Geocoding failed: ' + status);
                }
                });
            } else {
            alert('Please enter a city.');
            }
        });
    

    //display Restaurants function
    function displayRestaurants(restaurants) {
        const restaurantList = document.getElementById("results");
        restaurantList.innerHTML = "";  // Clear any previous results
    
        // If no restaurants were found
        if (restaurants.length === 0) {
            restaurantList.innerHTML = "<li>No restaurants found.</li>";
            return;
        }
    
        // Loop through the returned restaurants and create a list item for each
        restaurants.forEach((restaurant) => {
            const li = document.createElement("li");
            
            // Display restaurant name
            li.textContent = restaurant.name;
    
            // Optionally: Display address if available
            if (restaurant.vicinity) {
                const address = document.createElement("p");
                address.textContent = `Address: ${restaurant.vicinity}`;
                li.appendChild(address);
            }
    
            // Add a click listener to redirect to the restaurant details page
            li.addEventListener("click", () => {
                window.location.href = `restaurant-detail.html?place_id=${restaurant.place_id}`;
            });
    
            // Append the list item to the results section
            restaurantList.appendChild(li);
    
            // Add a marker on the map for each restaurant
            new google.maps.Marker({
                position: restaurant.geometry.location,
                map: map,
                title: restaurant.name,
            });
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
            radius: '5000',
            type: ['restaurant'],
    };

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch(request, (results, status) => {
        console.log("Nearby Search Status:", status);  // Debugging
        console.log("Nearby Search Results:", results);  // Debugging
        
        if (status === google.maps.places.PlacesServiceStatus.OK) {
            displayRestaurants(results);
        } else {
            console.error("Nearby Search Error:", status);
        }
    });
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
function handleResults(results, status) {
    if (status === google.maps.places.PlacesServiceStatus.OK) {
        document.getElementById('results').innerHTML = ''; //clear previous status
        
        results.forEach((place) => {
            const li = document.createElement('li');
            li.textContent = place.name;

            li.addEventListener('click', () => {
                window.location.href = `restaurant-detail.html?place_id=${place.place_id}`;
            });

            document.getElementById('results').appendChild(li);

            //add marker to map
            const markerElement = new google.maps.Marker({
                position: place.geometry.location,
                map: map,
                title: place.name,
            });
        });
    } else if (status === google.maps.places.PlacesServiceStatus.ZERO_RESULTS) {
        alert ('No nearby restaurants found. Try searching a different location');
    } else {
        alert('Error fetching nearby restaurants. Please check your network connection and try again.');
    }
}

//Handle single restaurant details for (restaurant-detail.html)
function handlePlaceDetails(place, status) {
    
    if (status == google.maps.places.PlacesServiceStatus.OK) {
        //update details on page
        document.getElementById('restaurant-name').textContent = place.name;
        document.getElementById('restaurant-address').textContent = place.formatted_address;
        document.getElementById('restaurant-rating').textContent = `Rating: ${place.rating || 'N/A'}`;

        //display phone number if available
        if (place.formatted_phone_number) {
            document.getElementById('restaurant-phone').textContent = `Phone: ${place.formatted_phone_number}`;
        }   

        //display website if available
        if (place.website) {
            const websiteElement = document.getElementById('restaurant-url').firstElementChild;
            websiteElement.href = place.website; 
            websiteElement.textContent = 'Visit Website';
        } else {
            document.getElementById('restaurant-url').textContent = 'Website not available';
        }
   
        console.log(place.photos);

        //display photos(3) if available  
        if (place.photos && place.photos.length > 0) {
            //display first photo
            const photoUrl1 = place.photos[0].getUrl({ maxWidth: 400, maxHeight: 400 }); 
            document.getElementById('restaurant-photo1').src = photoUrl1;

            //display second photo
        if (place.photos.length > 1) {
            const photoUrl2 = place.photos[1].getUrl({ maxWidth: 400, maxHeight: 400 }); 
            document.getElementById('restaurant-photo2').src = photoUrl2;
        } else {
            document.getElementById('restaurant-photo2').style.display = 'none';
        }

        //third photo if available
        if (place.photos.length > 2) {
            const photoUrl3 = place.photos[2].getUrl({ maxWidth: 400, maxHeight: 400 });
            document.getElementById('restaurant-photo3').src = photoUrl3;
        } else {
            document.getElementById('restaurant-photo3').style.display = 'none';
        }
    } else {
            //hide images if photos not available
            document.getElementById('restaurant-photo1').style.display = 'none'; 
            document.getElementById('restaurant-photo2').style.display = 'none';
            document.getElementById('restaurant-photo3').style.display = 'none';
    }       

        //display hours of operation
        if (place.opening_hours) {
            const hoursElement = document.getElementById('restaurant-hours');
            hoursElement.innerHTML = ''; //clear previous hours
            place.opening_hours.weekday_text.forEach(day => {
                const dayElement = document.createElement('p');
                dayElement.textContent = day;
                hoursElement.appendChild(dayElement);
           });
        } else {
            document.getElementById('restaurant-hours').textContent = 'Hours not available';
        }

        //center map on the restaurants location
        map.setCenter(place.geometry.location);

        //add a marker for the restaurant
        new google.maps.Marker({
            position: place.geometry.location,
            map: map,
            title: place.name,
        });
    } else {
        console.error('Failed to get place details ', status);
    }
}










