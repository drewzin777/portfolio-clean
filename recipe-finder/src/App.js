import React, { useState } from 'react';
import './styles/App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [recipes, setRecipes] = useState([]);
  const [selectedRecipe, setSelectedRecipe] = useState(null);



  const handleSearch = async (e) => {
    e.preventDefault();
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
    }
  };


  const handleViewRecipe = async (recipeId) => {
    try {
      const API_KEY = process.env.REACT_APP_SPOONACULAR_API_KEY;
      const response = await fetch(
        `https://api.spoonacular.com/recipes/${recipeId}/information?apiKey=${API_KEY}`
      );
      const data = await response.json();
      setSelectedRecipe(data);
      alert(`
        ${data.title}
        
        Cooking Time: ${data.readyInMinutes} minutes
        Servings: ${data.servings}
        
        Instructions:
        ${data.instructions || 'No instructions available'}
        
        Source: ${data.sourceUrl || 'No source available'}
      `);
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
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-controls">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Enter ingredients (e.g., chicken, rice)"
                className="search-input"
              />
              <select
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value)}
                className="cuisine-select"
              >
                <option value="any">Any Cuisine</option>
                <option value="italian">Italian</option>
                <option value="mexican">Mexican</option>
                <option value="asian">Asian</option>
              </select>
              <button type="submit" className="search-button">Find Recipes</button>
            </div>
          </form>

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

      {selectedRecipe && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedRecipe.title}</h2>
              <button className="close-button" onClick={closeModal}>×</button>
            </div>
            <div>
              <p>Cooking Time: {selectedRecipe.readyInMinutes} minutes</p>
              <p>Servings: {selectedRecipe.servings}</p>
              <h3>Instructions:</h3>
              <p>{selectedRecipe.instructions || 'No instructions available'}</p>
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