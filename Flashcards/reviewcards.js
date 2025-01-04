let cards = [];

document.addEventListener('DOMContentLoaded', () => {
    

    const flashcardList = document.getElementById('flashcardList');

    let currentCardIndex = 0;
    let showingFront = true;

    const frontCardElement = document.getElementById('frontCard');
    const backCardElement = document.getElementById('backCard');
    const cardNumElement = document.getElementById('cardNum');
    const numCardsElement = document.getElementById('numCards');

    // Load cards from localForage
    localforage.getItem('flashcards').then(storedCards => {
        if (storedCards && storedCards.length > 0) {
            cards = storedCards;
            renderFlashcards();
            numCardsElement.textContent = cards.length;
            displayCard(currentCardIndex);
        } else {
            document.getElementById('card').innerHTML = "<p>No flashcards found. Go create some!</p>";
        }
    }).catch(err => {
        console.error("Error loading flashcards:", err);
    });

    // Display the current card
    function displayCard(index) {
        const card = cards[index];
        frontCardElement.textContent = card.front;
        backCardElement.textContent = card.back;
        backCardElement.style.display = "none"; // Show only the front initially
        frontCardElement.style.display = "block";
        cardNumElement.textContent = index + 1;
    }

    // Flip the card
    document.getElementById('btnFlip').addEventListener('click', () => {
        if (showingFront) {
            frontCardElement.style.display = "none";
            backCardElement.style.display = "block";
        } else {
            backCardElement.style.display = "none";
            frontCardElement.style.display = "block";
        }
        showingFront = !showingFront;
    });

    // Move to the next card
    document.getElementById('card').addEventListener('click', () => {
        currentCardIndex = (currentCardIndex + 1) % cards.length;
        displayCard(currentCardIndex);
        showingFront = true; // Reset to front side
    });
});

function renderFlashcards() {
    console.log("Rendering flashcards:", cards); // Debugging: Check if cards array has data

    const flashcardList = document.getElementById('flashcardList');
    flashcardList.innerHTML = ''; // Clear the existing cards

    cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'col-md-4 mb-3'; // Bootstrap column
        cardElement.innerHTML = `
            <div class="card">
                <div class="card-body">
                    <h5 class="card-title">Front</h5>
                    <p class="card-text">${card.front}</p>
                    <h5 class="card-title">Back</h5>
                    <p class="card-text">${card.back}</p>
                    <button class="btn btn-primary btn-sm edit-btn" data-index="${index}">Edit</button>
                    <button class="btn btn-danger btn-sm delete-btn" data-index="${index}">Delete</button>
                </div>
            </div>
        `;
        flashcardList.appendChild(cardElement);
    });

    // Attach event listeners to the edit and delete buttons
    document.querySelectorAll('.edit-btn').forEach(button =>
        button.addEventListener('click', editCard)
    );
    document.querySelectorAll('.delete-btn').forEach(button =>
        button.addEventListener('click', deleteCard)
    );
}


function editCard(event) {
    const index = event.target.getAttribute('data-index');
    const card = cards[index];

    // Pre-fill the modal form with card data
    document.getElementById('editFrontCard').value = card.front;
    document.getElementById('editBackCard').value = card.back;

    // Show the modal
    const editModal = new bootstrap.Modal(document.getElementById('editModal'));
    editModal.show();

    // Handle save button click
    document.getElementById('saveEditBtn').onclick = () => {
        card.front = document.getElementById('editFrontCard').value.trim();
        card.back = document.getElementById('editBackCard').value.trim();

        if (!card.front || !card.back) {
            alert("Both sides of the card must be filled out.");
            return;
        }

        // Save the updated card and refresh the UI
        localforage.setItem('flashcards', cards).then(() => {
            console.log("Card updated successfully!");
            renderFlashcards();
            updateCardCount();
            editModal.hide();
        }).catch(err => {
            console.error("Error updating card:", err);
        });
    };
}

function deleteCard(event) {
    const index = event.target.getAttribute('data-index');

    // Remove the card from the array
    cards.splice(index, 1);

    // Save the updated array to localForage
    localforage.setItem('flashcards', cards).then(() => {
        console.log("Card deleted successfully!");
        renderFlashcards(); // Re-render the list
        updateCardCount();
    }).catch(err => {
        console.error("Error deleting card:", err);
    });
}
