document.getElementById("searchBtn").addEventListener("click", searchRecipe);
document.getElementById("search").addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        searchRecipe();
    }
});

function searchRecipe() {
    const query = document.getElementById("search").value.trim();
    if (query === "") {
        alert("Please enter a recipe name!");
        return;
    }

    document.getElementById("results").innerHTML = "<p>Loading recipes...</p>";

    fetch(`https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`)
        .then(response => response.json())
        .then(data => {
            displayResults(data.meals);
        })
        .catch(error => {
            console.error("Error fetching data:", error);
            document.getElementById("results").innerHTML = "<p>Something went wrong. Please try again!</p>";
        });
}

function displayResults(meals) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    if (!meals) {
        resultsDiv.innerHTML = "<p>No recipes found</p>";
        return;
    }

    meals.forEach(meal => {
        const mealCard = document.createElement("div");
        mealCard.classList.add("recipe-card");

        // Check if the meal has a valid source link
        let recipeLink = meal.strSource ? 
            `<a href="${meal.strSource}" class="view-recipe" target="_blank">View Recipe</a>` 
            : `<a href="https://www.google.com/search?q=${meal.strMeal} recipe" class="view-recipe" target="_blank">Search Recipe</a>`;

        mealCard.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p>${meal.strInstructions.substring(0, 100)}...</p>
            ${recipeLink} <!-- Displays "View Recipe" if a link exists, otherwise "Search Recipe" -->
        `;

        resultsDiv.appendChild(mealCard);
    });
}
