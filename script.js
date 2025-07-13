// Helper functions for localStorage
const getFoods = () => {
    try {
        const foods = JSON.parse(localStorage.getItem('nutritionTrackerFoods')) || [];
        console.log('Loaded foods:', foods);
        return foods;
    } catch (error) {
        console.error('Error parsing foods from localStorage:', error);
        return [];
    }
};

const saveFoods = (foods) => {
    try {
        localStorage.setItem('nutritionTrackerFoods', JSON.stringify(foods));
        console.log('Saved foods:', foods);
        window.dispatchEvent(new CustomEvent('foodsUpdated'));
        window.dispatchEvent(new Event('storage')); // For cross-tab updates
    } catch (error) {
        console.error('Error saving foods to localStorage:', error);
        alert('Failed to save foods. Please try again.');
    }
};

const getDailySummary = () => {
    try {
        const summary = JSON.parse(localStorage.getItem('nutritionTrackerDailySummary')) || [];
        console.log('Loaded daily summary:', summary);
        return summary;
    } catch (error) {
        console.error('Error parsing daily summary from localStorage:', error);
        return [];
    }
};

const saveDailySummary = (summary) => {
    try {
        localStorage.setItem('nutritionTrackerDailySummary', JSON.stringify(summary));
        console.log('Saved daily summary:', summary);
        window.dispatchEvent(new CustomEvent('summaryUpdated'));
        window.dispatchEvent(new Event('storage')); // For cross-tab updates
    } catch (error) {
        console.error('Error saving daily summary to localStorage:', error);
        alert('Failed to save daily summary. Please try again.');
    }
};

// Nutrition Facts Page
if (document.getElementById('nutrition-form')) {
    const form = document.getElementById('nutrition-form');
    const foodsBody = document.getElementById('foods-body');
    const foodIdInput = document.getElementById('food-id');
    const nameInput = document.getElementById('name');
    const amountInput = document.getElementById('amount');
    const unitTypeInput = document.getElementById('unit-type');
    const kcalsInput = document.getElementById('kcals');
    const proteinInput = document.getElementById('protein');
    const carbsInput = document.getElementById('carbs');
    const fatInput = document.getElementById('fat');

    const loadFoods = () => {
        const foods = getFoods();
        foodsBody.innerHTML = '';
        if (foods.length === 0) {
            foodsBody.innerHTML = '<tr><td colspan="8">No foods added yet. Add one above!</td></tr>';
            return;
        }
        foods.forEach(food => {
            foodsBody.innerHTML += `
                <tr>
                    <td>${food.name}</td>
                    <td>${food.amount}</td>
                    <td>${food.unitType}</td>
                    <td>${food.kcals}</td>
                    <td>${food.protein}</td>
                    <td>${food.carbs}</td>
                    <td>${food.fat}</td>
                    <td>
                        <button onclick="editFood('${food.id}')">Edit</button>
                        <button class="delete" onclick="deleteFood('${food.id}')">Delete</button>
                    </td>
                </tr>
            `;
        });
    };

    window.editFood = (id) => {
        const foods = getFoods();
        const food = foods.find(f => f.id === id);
        if (!food) {
            alert('Food not found.');
            return;
        }
        foodIdInput.value = food.id;
        nameInput.value = food.name;
        amountInput.value = food.amount;
        unitTypeInput.value = food.unitType;
        kcalsInput.value = food.kcals;
        proteinInput.value = food.protein;
        carbsInput.value = food.carbs;
        fatInput.value = food.fat;
        form.scrollIntoView({ behavior: 'smooth' });
    };

    window.deleteFood = (id) => {
        if (confirm('Are you sure you want to delete this food? This will remove it from all summaries.')) {
            let foods = getFoods();
            foods = foods.filter(f => f.id !== id);
            saveFoods(foods);
            let summary = getDailySummary();
            summary = summary.filter(s => s.foodId !== id);
            saveDailySummary(summary);
            loadFoods();
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = nameInput.value.trim();
        const amount = parseFloat(amountInput.value);
        const unitType = unitTypeInput.value.trim();
        if (name.length === 0) {
            alert('Item Name is required.');
            return;
        }
        if (isNaN(amount) || amount <= 0) {
            alert('Amount must be a positive number.');
            return;
        }
        if (unitType.length === 0 || unitType.length > 20) {
            alert('Unit Type must be 1-20 characters.');
            return;
        }
        if (parseFloat(kcalsInput.value) < 0 || parseFloat(proteinInput.value) < 0 || 
            parseFloat(carbsInput.value) < 0 || parseFloat(fatInput.value) < 0) {
            alert('Nutrition values cannot be negative.');
            return;
        }

        const food = {
            id: foodIdInput.value || Date.now().toString(),
            name,
            amount,
            unitType,
            kcals: parseFloat(kcalsInput.value) || 0,
            protein: parseFloat(proteinInput.value) || 0,
            carbs: parseFloat(carbsInput.value) || 0,
            fat: parseFloat(fatInput.value) || 0
        };

        let foods = getFoods();
        if (foodIdInput.value) {
            foods = foods.map(f => f.id === foodIdInput.value ? food : f);
            let summary = getDailySummary();
            summary = summary.map(s => {
                if (s.foodId === food.id) {
                    return {
                        ...s,
                        foodName: food.name,
                        amount: food.amount,
                        unitType: food.unitType,
                        kcals: food.kcals * s.quantity,
                        protein: food.protein * s.quantity,
                        carbs: food.carbs * s.quantity,
                        fat: food.fat * s.quantity
                    };
                }
                return s;
            });
            saveDailySummary(summary);
        } else {
            foods.push(food);
        }
        saveFoods(foods);
        form.reset();
        foodIdInput.value = '';
        loadFoods();
    });

    // Listen for updates
    window.addEventListener('foodsUpdated', loadFoods);
    window.addEventListener('storage', loadFoods);
    loadFoods();
}

// Add Food Page
if (document.getElementById('add-food-form')) {
    const form = document.getElementById('add-food-form');
    const foodSelect = document.getElementById('food-select');
    const quantityInput = document.getElementById('quantity');
    const quantityValue = document.getElementById('quantity-value');

    quantityInput.addEventListener('input', () => {
        quantityValue.textContent = quantityInput.value;
    });

    const loadFoodsDropdown = () => {
        const foods = getFoods();
        foodSelect.innerHTML = '<option value="">Select a food</option>';
        if (foods.length === 0) {
            foodSelect.innerHTML += '<option value="" disabled>No foods available</option>';
        } else {
            foods.forEach(food => {
                foodSelect.innerHTML += `<option value="${food.id}">${food.name} (${food.amount} ${food.unitType})</option>`;
            });
        }
    };

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const foodId = foodSelect.value;
        const quantity = parseFloat(quantityInput.value);
        if (!foodId) {
            alert('Please select a food.');
            return;
        }
        if (isNaN(quantity) || quantity <= 0) {
            alert('Quantity must be a positive number.');
            return;
        }
        const foods = getFoods();
        const food = foods.find(f => f.id === foodId);
        if (!food) {
            alert('Selected food not found.');
            return;
        }
        const today = new Date().toISOString().split('T')[0];
        const summary = getDailySummary();
        summary.push({
            id: Date.now().toString(),
            date: today,
            foodId,
            foodName: food.name,
            amount: food.amount,
            unitType: food.unitType,
            quantity,
            kcals: food.kcals * quantity,
            protein: food.protein * quantity,
            carbs: food.carbs * quantity,
            fat: food.fat * quantity
        });
        saveDailySummary(summary);
        form.reset();
        quantityValue.textContent = '1';
        window.location.href = 'index.html';
    });

    // Listen for updates
    window.addEventListener('foodsUpdated', loadFoodsDropdown);
    window.addEventListener('storage', loadFoodsDropdown);
    loadFoodsDropdown();
}

// Summary Page
if (document.getElementById('summary-table')) {
    const summaryBody = document.getElementById('summary-body');
    const totalKcals = document.getElementById('total-kcals');
    const totalProtein = document.getElementById('total-protein');
    const totalCarbs = document.getElementById('total-carbs');
    const totalFat = document.getElementById('total-fat');
    const loadingMessage = document.getElementById('loading-message');
    const errorMessage = document.getElementById('error-message');
    const clearEntriesButton = document.getElementById('clear-entries');
    let chartInstance = null; // Store chart instance to destroy it

    const cleanupOldEntries = () => {
        const today = new Date().toISOString().split('T')[0];
        let summary = getDailySummary();
        summary = summary.filter(s => s.date === today);
        saveDailySummary(summary);
    };

    const loadSummary = () => {
        if (loadingMessage) loadingMessage.style.display = 'block';
        if (errorMessage) errorMessage.style.display = 'none';
        try {
            cleanupOldEntries();
            const today = new Date().toISOString().split('T')[0];
            const foods = getFoods();
            const summary = getDailySummary().filter(s => s.date === today);
            let totals = { kcals: 0, protein: 0, carbs: 0, fat: 0 };
            summaryBody.innerHTML = '';
            if (summary.length === 0) {
                summaryBody.innerHTML = '<tr><td colspan="7">No entries for today. Add a food to get started!</td></tr>';
            } else {
                summary.forEach(item => {
                    summaryBody.innerHTML += `
                        <tr>
                            <td>${item.foodName}</td>
                            <td>${item.amount} ${item.unitType}</td>
                            <td>${item.kcals.toFixed(1)}</td>
                            <td>${item.protein.toFixed(1)}</td>
                            <td>${item.carbs.toFixed(1)}</td>
                            <td>${item.fat.toFixed(1)}</td>
                            <td class="actions-cell">
                                <button class="actions-btn" onclick="toggleActionsMenu('${item.id}')" aria-label="Actions for ${item.foodName}">⋯</button>
                                <div id="actions-menu-${item.id}" class="actions-menu">
                                    <button class="edit" onclick="showEditForm('${item.id}')">Edit</button>
                                    <button class="delete" onclick="deleteEntry('${item.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                        <tr id="edit-form-${item.id}" class="edit-form">
                            <td colspan="7">
                                <form id="edit-summary-form-${item.id}">
                                    <label for="edit-food-${item.id}">Food:</label>
                                    <select id="edit-food-${item.id}" required aria-label="Select a food">
                                        <option value="">Select a food</option>
                                        ${foods.map(f => `<option value="${f.id}" ${f.id === item.foodId ? 'selected' : ''}>${f.name} (${f.amount} ${f.unitType})</option>`).join('')}
                                    </select>
                                    <label for="edit-quantity-${item.id}">Quantity: <span id="edit-quantity-value-${item.id}">${item.quantity}</span></label>
                                    <input type="range" id="edit-quantity-${item.id}" min="0.25" max="20" step="0.25" value="${item.quantity}" required aria-label="Quantity slider">
                                    <button type="submit">Save</button>
                                    <button type="button" onclick="hideEditForm('${item.id}')">Cancel</button>
                                </form>
                            </td>
                        </tr>
                    `;
                    totals.kcals += item.kcals;
                    totals.protein += item.protein;
                    totals.carbs += item.carbs;
                    totals.fat += item.fat;
                });
            }

            totalKcals.textContent = totals.kcals.toFixed(1);
            totalProtein.textContent = totals.protein.toFixed(1);
            totalCarbs.textContent = totals.carbs.toFixed(1);
            totalFat.textContent = totals.fat.toFixed(1);

            // Destroy existing chart to prevent overlap
            if (chartInstance) {
                chartInstance.destroy();
            }

            const ctx = document.getElementById('macro-chart').getContext('2d');
            chartInstance = new Chart(ctx, {
                type: 'pie',
                data: {
                    labels: ['Protein', 'Carbs', 'Fat'],
                    datasets: [{
                        data: [totals.protein, totals.carbs, totals.fat],
                        backgroundColor: ['#36A2EB', '#FF6384', '#FFCE56'],
                        borderColor: ['#ffffff', '#ffffff', '#ffffff'],
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: { position: 'top', labels: { font: { size: 8 }, color: '#333' } },
                        title: { display: true, text: 'Macros', font: { size: 10 }, color: '#333' }
                    }
                }
            });
        } catch (error) {
            console.error('Error loading summary:', error);
            if (errorMessage) errorMessage.style.display = 'block';
            if (chartInstance) {
                chartInstance.destroy();
                document.getElementById('macro-chart').style.display = 'none';
            }
        } finally {
            if (loadingMessage) loadingMessage.style.display = 'none';
        }

        summary.forEach(item => {
            const form = document.getElementById(`edit-summary-form-${item.id}`);
            const quantityInput = document.getElementById(`edit-quantity-${item.id}`);
            const quantityValue = document.getElementById(`edit-quantity-value-${item.id}`);
            if (form && quantityInput && quantityValue) {
                quantityInput.addEventListener('input', () => {
                    quantityValue.textContent = quantityInput.value;
                });
                form.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const foodId = document.getElementById(`edit-food-${item.id}`).value;
                    const quantity = parseFloat(quantityInput.value);
                    const foods = getFoods();
                    const food = foods.find(f => f.id === foodId);
                    if (!food) {
                        alert('Selected food not found.');
                        return;
                    }
                    let summary = getDailySummary();
                    summary = summary.map(s => {
                        if (s.id === item.id) {
                            return {
                                ...s,
                                foodId,
                                foodName: food.name,
                                amount: food.amount,
                                unitType: food.unitType,
                                quantity,
                                kcals: food.kcals * quantity,
                                protein: food.protein * quantity,
                                carbs: food.carbs * quantity,
                                fat: food.fat * quantity
                            };
                        }
                        return s;
                    });
                    saveDailySummary(summary);
                    loadSummary(); // Re-render after edit
                });
            }
        });
    };

    window.toggleActionsMenu = (id) => {
        const menu = document.getElementById(`actions-menu-${id}`);
        if (menu) {
            menu.classList.toggle('active');
        }
    };

    window.showEditForm = (id) => {
        const editForm = document.getElementById(`edit-form-${id}`);
        if (editForm) {
            editForm.classList.add('active');
            const menu = document.getElementById(`actions-menu-${id}`);
            if (menu) menu.classList.remove('active');
        }
    };

    window.hideEditForm = (id) => {
        const editForm = document.getElementById(`edit-form-${id}`);
        if (editForm) {
            editForm.classList.remove('active');
        }
    };

    window.deleteEntry = (id) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            let summary = getDailySummary();
            summary = summary.filter(s => s.id !== id);
            saveDailySummary(summary);
            loadSummary(); // Re-render after delete
        }
    };

    if (clearEntriesButton) {
        clearEntriesButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear all entries for today?')) {
                const today = new Date().toISOString().split('T')[0];
                let summary = getDailySummary();
                summary = summary.filter(s => s.date !== today);
                saveDailySummary(summary);
                loadSummary(); // Re-render after clear
            }
        });
    }

    // Listen for updates
    window.addEventListener('summaryUpdated', loadSummary);
    window.addEventListener('storage', loadSummary);
    loadSummary();
}