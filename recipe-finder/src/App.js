import React, { useState, useEffect } from 'react';
import './App.css';


function App() {
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };


    document.addEventListener("keydown", handleKeyDown);


    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);


  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);

    const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;

    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${searchTerm}&cuisine=${cuisine}&addRecipeInformation=true&instructionsRequired=true&fillIngredients=true&number=6`
      );

      const data = await response.json();

      if (data.results) {
        const formattedRecipes = data.results.map(recipe => ({
          id: recipe.id,
          title: recipe.title,
          image: recipe.image,
          cookTime: `${recipe.readyInMinutes} mins`,
          ingredients: recipe.extendedIngredients ? recipe.extendedIngredients.map(ing => ing.original) : []
        }));
        setRecipes(formattedRecipes);
      }
    } catch (error) {
      console.error('Error fetching recipes:', error);
    } finally {
      setLoading(false);    //Stop Loading once fetch is complete
    }
  };

  const handleViewRecipe = async (recipeId) => {
    try {
      const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
      );
      const data = await response.json();

      // Make sure the instructions are properly formatted
      setSelectedRecipe({
        title: data.title,
        readyInMinutes: data.readyInMinutes,
        servings: data.servings,
        instructions: data.instructions ? data.instructions.replace(/<\/?[^>]+(>|$)/g, "") : "No instructions available",
        sourceUrl: data.sourceUrl || "",
      });

    } catch (error) {
      console.error('Error fetching recipe details:', error);
    }
  };

  const closeModal = () => {
    setSelectedRecipe(null);
  };

  return (
    <div className="container">
      <div className="App">
        <header className="App-header">
          <h1>Recipe Finder</h1>
          <p className="header-subtitle">Find delicious recipes with ingredients you have</p>
        </header>

        <main>
          {/* Search Form */}
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-controls">
              <label htmlFor="search" className="search-label">Search by Ingredients:</label>
              <input
                id="search"
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="e.g., chicken, rice, garlic"
                className="search-input"
              />

              {/* Clear Button */}
              <button type="button" className="clear-button" onClick={() => setSearchTerm("")}>
                Clear
              </button>

              {/* Cuisine Dropdown */}
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="cuisine-select"
              >
                <option value="any">Any Cuisine</option>
                <option value="italian">Italian</option>
                <option value="american">American</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
                <option value="french">French</option>
                <option value="greek">Greek</option>
                <option value="indian">Indian</option>


              </select>
              <button type="submit" className="search-button">Find Recipes</button>
            </div>
          </form>

          {/* Loading Indecator */}
          {loading && <p className="loading-text">Loading recipes...</p>}

          {/* Recipe Cards */}
          <div className="recipes-container">
            {recipes.map(recipe => (
              <div key={recipe.id} className="recipe-card">
                <img src={recipe.image} alt={recipe.title} className="recipe-image" />
                <div className="recipe-card-content">
                  <h3 className="recipe-title">{recipe.title}</h3>
                  <p className="recipe-time">⏱️ {recipe.cookTime}</p>
                  <p className="recipe-ingredients">🥘 Ingredients:</p>
                  <p className="ingredients-list">
                    {recipe.ingredients.length > 0
                      ? recipe.ingredients.join(', ')
                      : 'No ingredients available'}
                  </p>
                  <button className="view-recipe" onClick={() => handleViewRecipe(recipe.id)}>View Recipe</button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>

      {/* Recipe Modal */}
      {selectedRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRecipe.title}</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div>
              <p><strong>Cooking Time:</strong> {selectedRecipe.readyInMinutes} minutes</p>
              <p><strong>Servings:</strong> {selectedRecipe.servings}</p>
              <h3>Instructions:</h3>
              <p>{selectedRecipe.instructions || "No instructions available"}</p>
              {selectedRecipe.sourceUrl && (
                <p><a href={selectedRecipe.sourceUrl} target="_blank" rel="noopener noreferrer">View Original Recipe</a></p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


export default App;
