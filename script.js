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

// Display consumed foods in the summary table with two rows per item
function displaySummary() {
    const tbody = document.getElementById('summaryBody');
    tbody.innerHTML = '';
    const consumedFoods = getConsumedFoods();
    consumedFoods.forEach(food => {
        // Row 1: Food Name / Qty / Serving Size
        const row1 = document.createElement('tr');
        row1.innerHTML = `
            <td data-label="Food Name">${food.name}</td>
            <td data-label="Qty">${food.quantity}</td>
            <td data-label="Serving Size">${food.servingSize} ${food.servingType}</td>
            <td colspan="4"></td> <!-- Empty cells to span nutritional info columns -->
        `;

        // Row 2: Fat / Protein / Carbs / Kcals
        const row2 = document.createElement('tr');
        row2.innerHTML = `
            <td colspan="3"></td> <!-- Empty cells to span food details columns -->
            <td data-label="Fat (g)">${food.fat.toFixed(1)}</td>
            <td data-label="Protein (g)">${food.protein.toFixed(1)}</td>
            <td data-label="Carbs (g)">${food.carbs.toFixed(1)}</td>
            <td data-label="Kcals">${food.kcals.toFixed(0)}</td>
        `;

        tbody.appendChild(row1);
        tbody.appendChild(row2);
    });
}