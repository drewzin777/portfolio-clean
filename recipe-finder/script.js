const API_URL = "https://www.themealdb.com/api/json/v1/1/search.php?s=";

document.getElementById("searchBtn").addEventListener("click", () => {
    let query = document.getElementById("search").value;
    if (query) {
        fetchRecipes(query);
    }
});

async function fetchRecipes(query) {
    try {
        const response = await fetch(API_URL + query);
        const data = await response.json();
        displayResults(data.meals);
    } catch (error) {
        console.error("Error fetching data:", error);
    }
}

function displayResults(meals) {
    const resultsDiv = document.getElementById("results");
    resultsDiv.innerHTML = ""; // Clear previous results

    if (!meals) {
        resultsDiv.innerHTML = "<p>No recipes found</p>";
        return;
    }

    // Display ALL meals in the response
    meals.forEach(meal => {
        const mealCard = document.createElement("div");
        mealCard.classList.add("recipe-card");
        mealCard.innerHTML = `
            <h2>${meal.strMeal}</h2>
            <img src="${meal.strMealThumb}" alt="${meal.strMeal}" width="250">
            <p><strong>Category:</strong> ${meal.strCategory}</p>
            <p><strong>Instructions:</strong> ${meal.strInstructions.substring(0, 150)}...</p>
        `;
        resultsDiv.appendChild(mealCard);
    });
}
