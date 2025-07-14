// Functions to get and save foods to localStorage
function getFoods() {
    return JSON.parse(localStorage.getItem('foods')) || [];
}

function saveFoods(foods) {
    localStorage.setItem('foods', JSON.stringify(foods));
}

// Variable to track the selected food for editing
let selectedFoodIndex = null;

// Populate the dropdown with saved foods
function populateFoodDropdown() {
    const select = document.getElementById('foodSelect');
    select.innerHTML = '<option value="">Select Food to Edit</option>'; // Reset to default option
    const foods = getFoods();
    foods.forEach((food, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = food.name;
        select.appendChild(option);
    });
}

// Handle food selection from the dropdown
function handleFoodSelection() {
    const select = document.getElementById('foodSelect');
    const index = select.value;
    if (index === "") {
        // Reset form to "Add" mode
        document.getElementById('foodForm').reset();
        document.querySelector('#foodForm button').textContent = 'Add Food';
        selectedFoodIndex = null;
    } else {
        // Populate form with selected food's details and switch to "Update" mode
        const foods = getFoods();
        const food = foods[index];
        document.getElementById('foodName').value = food.name;
        document.getElementById('servingSize').value = food.servingSize;
        document.getElementById('servingType').value = food.servingType;
        document.getElementById('fat').value = food.fat;
        document.getElementById('protein').value = food.protein;
        document.getElementById('carbs').value = food.carbs;
        document.getElementById('kcals').value = food.kcals;
        document.querySelector('#foodForm button').textContent = 'Update Food';
        selectedFoodIndex = index;
    }
}

// Handle form submission to add or update a food item
function saveFood(event) {
    event.preventDefault();
    const food = {
        name: document.getElementById('foodName').value,
        servingSize: parseFloat(document.getElementById('servingSize').value),
        servingType: document.getElementById('servingType').value,
        fat: parseFloat(document.getElementById('fat').value),
        protein: parseFloat(document.getElementById('protein').value),
        carbs: parseFloat(document.getElementById('carbs').value),
        kcals: parseFloat(document.getElementById('kcals').value)
    };
    const foods = getFoods();
    if (selectedFoodIndex === null) {
        // Add a new food item
        foods.push(food);
        alert('Food added successfully!');
    } else {
        // Update the selected food item
        foods[selectedFoodIndex] = food;
        alert('Food updated successfully!');
    }
    saveFoods(foods);
    // Refresh the dropdown and reset the form
    populateFoodDropdown();
    document.getElementById('foodForm').reset();
    document.querySelector('#foodForm button').textContent = 'Add Food';
    selectedFoodIndex = null;
}

// Initialize the page
function initDatabasePage() {
    populateFoodDropdown();
    document.getElementById('foodSelect').addEventListener('change', handleFoodSelection);
    document.getElementById('foodForm').addEventListener('submit', saveFood);
}