document.getElementById('btnSave').addEventListener('click', saveCard);

let cards = []; // Initialize an empty array to store cards

// Load existing cards from localForage when the page loads
document.addEventListener('DOMContentLoaded', () => {
    localforage.getItem('flashcards').then(storedCards => {
        if (storedCards) {
            cards = storedCards; // Load saved cards into the array
            updateCardCount(); // Update the number of cards displayed
        } else {
            cards = []; // Initialize an empty array if no cards are stored
        }
    }).catch(err => {
        console.error("Error loading cards:", err);
    });
});

function saveCard() {
    const frontContent = document.getElementById('frontCard').value.trim();
    const backContent = document.getElementById('backCard').value.trim();

    if (!frontContent || !backContent) {
        alert("Both sides of the card must be filled out.");
        return;
    }

    const card = { front: frontContent, back: backContent };
    cards.push(card); // Add the new card to the array

    localforage.setItem('flashcards', cards).then(() => {
        console.log("Card saved successfully!");
        clearUI();
        updateCardCount();
    }).catch(err => {
        console.error("Error saving card:", err);
    });
}

function updateCardCount() {
    document.getElementById('numCards').textContent = cards.length;
}

function clearUI() {
    document.getElementById('frontCard').value = "";
    document.getElementById('backCard').value = "";
}

