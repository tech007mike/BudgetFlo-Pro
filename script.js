// Assuming previous functions like getFoods(), saveFoods(), etc., exist from prior code
// Example of existing functions (adjust as per your original code):
function getFoods() {
    return JSON.parse(localStorage.getItem('foods')) || [];
}
function saveFoods(foods) {
    localStorage.setItem('foods', JSON.stringify(foods));
}

// Variable to track the selected food for editing
let selectedFoodIndex = null;

// Populate the dropdown with food items
function populateFoodDropdown() {
    const select = document.getElementById('foodSelect');
    select.innerHTML = '<option value="">Add New Food</option>';
    const foods = getFoods();
    foods.forEach((food, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = food.name;
        select.appendChild(option);
    });
}

// Handle food selection from dropdown
function handleFoodSelection() {
    const select = document.getElementById('foodSelect');
    const index = select.value;
    if (index === "") {
        // Clear form and set to "Add" mode
        document.getElementById('foodForm').reset();
        document.querySelector('#foodForm button').textContent = 'Add Food';
        selectedFoodIndex = null;
    } else {
        // Fill form with selected food's data and set to "Update" mode
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

// Save food (add or update based on selectedFoodIndex)
function saveFood(event) {
    event.preventDefault();
    const food = {
        name: document.getElementById('foodName').value,
        servingSize: parseFloat(document.getElementById('servingSize').value),
        servingType: document.getElementBy ක

```javascript
// Save food (add or update based on selectedFoodIndex)
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
        // Add new food
        foods.push(food);
        alert('Food added successfully!');
    } else {
        // Update existing food
        foods[selectedFoodIndex] = food;
        alert('Food updated successfully!');
    }
    saveFoods(foods);
    // Refresh dropdown and reset form to "Add" mode
    populateFoodDropdown();
    document.getElementById('foodForm').reset();
    document.querySelector('#foodForm button').textContent = 'Add Food';
    selectedFoodIndex = null;
}

// Initialize the database management page
function initDatabasePage() {
    populateFoodDropdown();
    document.getElementById('foodSelect').addEventListener('change', handleFoodSelection);
    document.getElementById('foodForm').addEventListener('submit', saveFood);
}

// [Other existing functions like displaySummary, deleteFood, etc., remain unchanged]