import React, { useState } from 'react';
import './styles/App.css';

function App() {
  const [searchTerm, setSearchTerm] = useState('');
  const [cuisine, setCuisine] = useState('any');
  const [recipes, setRecipes] = useState([]);


  const handleSearch = async (e) => {
    e.preventDefault();
    const API_KEY = 'your_spoonacular_api_key';
    
    try {
      const response = await fetch(
        `https://api.spoonacular.com/recipes/complexSearch?apiKey=${API_KEY}&query=${searchTerm}&cuisine=${cuisine}&addRecipeInformation=true&number=6`
      );
      const data = await response.json();
      
      const formattedRecipes = data.results.map(recipe => ({
        id: recipe.id,
        title: recipe.title,
        image: recipe.image,
        cookTime: `${recipe.readyInMinutes} mins`,
        ingredients: recipe.extendedIngredients.map(ing => ing.name)
      }));
      
      setRecipes(formattedRecipes);
    } catch (error) {
      console.error('Error fetching recipes:', error);
    }
  };


  return (
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
              <img src={recipe.image} alt={recipe.title} className="recipe-image"/>
              <div className="recipe-card-content">
                <h3 className="recipe-title">{recipe.title}</h3>
                <p className="recipe-time">⏱️ {recipe.cookTime}</p>
                <p className="recipe-ingredients">🥘 Ingredients:</p>
                <p className="ingredients-list">{recipe.ingredients.join(', ')}</p>
                <button className="view-recipe">View Recipe</button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}

export default App;