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
}

// Populate the dropdown with foods
function populateFoodDropdown() {
    const select = document.getElementById('foodSelect');
    select.innerHTML = '<option value="">Select a food</option>';
    const foods = getFoods();
    foods.forEach((food, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.textContent = food.name;
        select.appendChild(option);
    });
}

// Consume a selected food
function consumeFood() {
    const select = document.getElementById('foodSelect');
    const quantity = parseFloat(document.getElementById('quantity').value);
    const foodIndex = select.value;
    if (!foodIndex || quantity <= 0) {
        alert('Please select a food and enter a valid quantity.');
        return;
    }
    const foods = getFoods();
    const food = foods[foodIndex];
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
    document.getElementById('quantity').value = 1;
    select.value = '';
}

// Display consumed foods in the summary table with delete buttons and calculate macro percentages
function displaySummary() {
    const tbody = document.getElementById('summaryBody');
    tbody.innerHTML = '';
    const consumedFoods = getConsumedFoods();
    
    // Calculate total kcals from fat, protein, and carbs
    let totalFatKcals = 0;
    let totalProteinKcals = 0;
    let totalCarbsKcals = 0;
    let totalKcals = 0;
    
    consumedFoods.forEach(food => {
        const fatKcals = food.fat * 9;    // 9 kcals per gram of fat
        const proteinKcals = food.protein * 4; // 4 kcals per gram of protein
        const carbsKcals = food.carbs * 4;     // 4 kcals per gram of carbs
        totalFatKcals += fatKcals;
        totalProteinKcals += proteinKcals;
        totalCarbsKcals += carbsKcals;
        totalKcals += food.kcals;
    });
    
    // Calculate percentages (avoid division by zero)
    const fatPercentage = totalKcals > 0 ? ((totalFatKcals / totalKcals) * 100).toFixed(1) : 0;
    const proteinPercentage = totalKcals > 0 ? ((totalProteinKcals / totalKcals) * 100).toFixed(1) : 0;
    const carbsPercentage = totalKcals > 0 ? ((totalCarbsKcals / totalKcals) * 100).toFixed(1) : 0;
    
    // Update macro percentages in the HTML
    document.getElementById('fatPercentage').textContent = `${fatPercentage}%`;
    document.getElementById('proteinPercentage').textContent = `${proteinPercentage}%`;
    document.getElementById('carbsPercentage').textContent = `${carbsPercentage}%`;
    
    // Display each food item with a delete button
    consumedFoods.forEach((food, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${food.name} / ${food.quantity} / ${food.servingSize} ${food.servingType}</td>
            <td>${food.fat.toFixed(1)} / ${food.protein.toFixed(1)} / ${food.carbs.toFixed(1)} / ${food.kcals.toFixed(0)}</td>
            <td><button onclick="deleteFood(${index})">X</button></td>
        `;
        tbody.appendChild(row);
    });
}

// Delete a food item from the summary and refresh the display
function deleteFood(index) {
    const consumedFoods = getConsumedFoods();
    consumedFoods.splice(index, 1);  // Remove the food item at the specified index
    saveConsumedFoods(consumedFoods); // Update the stored data
    displaySummary();                 // Refresh the summary table and percentages
}