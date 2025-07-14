// Load foods and consumed foods from localStorage
function getFoods() {
    return JSON.parse(localStorage.getItem('foods')) || [];
}

function getConsumedFoods() {
    return JSON.parse(localStorage.getItem('consumedFoods')) || [];
}

// Save foods and consumed foods to localStorage
function saveFoods(foods) {
    localStorage.setItem('foods', JSON.stringify(foods));
}

function saveConsumedFoods(consumedFoods) {
    localStorage.setItem('consumedFoods', JSON.stringify(consumedFoods));
}

// Add a new food to the database
function addFood(event) {
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
    foods.push(food);
    saveFoods(foods);
    alert('Food added successfully!');
    document.getElementById('foodForm').reset();
    populateFoodDropdown(); // Refresh dropdown on both pages
}

// Populate the dropdown with foods
function populateFoodDropdown() {
    let selects = document.getElementsByName('foodSelect');
    if (selects.length === 0) {
        const selectById = document.getElementById('foodSelect');
        selects = selectById ? [selectById] : [];
    }
    console.log('Found selects:', selects);
    for (let select of selects) {
        if (select) {
            select.innerHTML = '<option value="">Select a food</option>';
            const foods = getFoods();
            console.log('Available foods:', foods);
            foods.forEach((food, index) => {
                const option = document.createElement('option');
                option.value = index;
                option.textContent = food.name;
                select.appendChild(option);
            });
        }
    }
}

// Consume a selected food
function consumeFood() {
    const select = document.getElementById('foodSelect');
    const quantityInput = document.getElementById('quantity');
    
    if (!select || !quantityInput) {
        console.error('Form elements not found');
        return;
    }

    const foodIndex = select.value;
    const quantity = parseFloat(quantityInput.value);

    if (foodIndex === "" || isNaN(quantity) || quantity <= 0) {
        alert('Please select a food and enter a valid quantity.');
        return;
    }

    const foods = getFoods();
    const food = foods[foodIndex];
    if (!food) {
        console.error('Selected food not found');
        return;
    }

    const consumed = {
        ...food,
        quantity,
        fat: food.fat * quantity,
        protein: food.protein * quantity,
        carbs: food.carbs * quantity,
        kcals: food.kcals * quantity
    };

    const consumedFoods = getConsumedFoods();
    consumedFoods.push(consumed);
    saveConsumedFoods(consumedFoods);

    alert('Food logged successfully!');
    quantityInput.value = 1;
    select.value = '';
    window.location.href = 'index.html'; // Navigate to summary page to show update
}

// Variable to track the selected food for editing
let selectedFoodIndex = null;

// Handle food selection from the dropdown on manage page
function handleFoodSelection() {
    const select = document.getElementById('foodSelect');
    const index = select.value;
    const deleteBtn = document.getElementById('deleteFoodBtn');
    if (index === "") {
        document.getElementById('foodForm').reset();
        document.querySelector('#foodForm button').textContent = 'Add Food';
        selectedFoodIndex = null;
        deleteBtn.style.display = 'none'; // Hide delete button
    } else {
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
        deleteBtn.style.display = 'inline-block'; // Show delete button
    }
}

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
        foods.push(food);
        alert('Food added successfully!');
    } else {
        foods[selectedFoodIndex] = food;
        alert('Food updated successfully!');
    }
    saveFoods(foods);
    populateFoodDropdown();
    document.getElementById('foodForm').reset();
    document.querySelector('#foodForm button').textContent = 'Add Food';
    selectedFoodIndex = null;
    document.getElementById('deleteFoodBtn').style.display = 'none'; // Hide delete button after save
}

// Delete a food item from the database
function deleteFoodFromDatabase() {
    if (selectedFoodIndex === null) {
        alert('No food selected to delete.');
        return;
    }
    if (confirm('Are you sure you want to delete this food?')) {
        const foods = getFoods();
        foods.splice(selectedFoodIndex, 1);
        saveFoods(foods);
        alert('Food deleted successfully!');
        populateFoodDropdown();
        document.getElementById('foodForm').reset();
        document.querySelector('#foodForm button').textContent = 'Add Food';
        selectedFoodIndex = null;
        document.getElementById('deleteFoodBtn').style.display = 'none'; // Hide delete button
    }
}

// Display consumed foods in the summary table and calculate macro percentages
function displaySummary() {
    const tbody = document.getElementById('summaryBody');
    if (!tbody) {
        console.error('Summary table body not found');
        return;
    }
    tbody.innerHTML = '';
    const consumedFoods = getConsumedFoods();
    
    let totalFatKcals = 0;
    let totalProteinKcals = 0;
    let totalCarbsKcals = 0;
    let totalKcals = 0;
    
    consumedFoods.forEach(food => {
        const fatKcals = food.fat * 9;
        const proteinKcals = food.protein * 4;
        const carbsKcals = food.carbs * 4;
        totalFatKcals += fatKcals;
        totalProteinKcals += proteinKcals;
        totalCarbsKcals += carbsKcals;
        totalKcals += food.kcals;
    });
    
    const fatPercentage = totalKcals > 0 ? ((totalFatKcals / totalKcals) * 100).toFixed(1) : 0;
    const proteinPercentage = totalKcals > 0 ? ((totalProteinKcals / totalKcals) * 100).toFixed(1) : 0;
    const carbsPercentage = totalKcals > 0 ? ((totalCarbsKcals / totalKcals) * 100).toFixed(1) : 0;
    
    document.getElementById('fatPercentage').textContent = `${fatPercentage}%`;
    document.getElementById('proteinPercentage').textContent = `${proteinPercentage}%`;
    document.getElementById('carbsPercentage').textContent = `${carbsPercentage}%`;
    
    consumedFoods.forEach((food, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${food.name}</td>
            <td>${food.quantity}</td>
            <td>${food.servingSize} ${food.servingType}</td>
            <td>${food.fat.toFixed(1)}</td>
            <td>${food.protein.toFixed(1)}</td>
            <td>${food.carbs.toFixed(1)}</td>
            <td>${food.kcals.toFixed(0)}</td>
            <td><button onclick="deleteFood(${index})">X</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Delete a food item from the summary
function deleteFood(index) {
    const consumedFoods = getConsumedFoods();
    consumedFoods.splice(index, 1);
    saveConsumedFoods(consumedFoods);
    displaySummary();
}

// Initialize the database management page
function initDatabasePage() {
    populateFoodDropdown();
    document.getElementById('foodSelect').addEventListener('change', handleFoodSelection);
    document.getElementById('foodForm').addEventListener('submit', saveFood);
}