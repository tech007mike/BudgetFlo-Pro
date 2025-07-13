// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyCjBjIA4-W4GoPhzZ24vvUkrvg9mwY4Dxw",
  authDomain: "nutrition-tracker-12345.firebaseapp.com",
  projectId: "nutrition-tracker-12345",
  storageBucket: "nutrition-tracker-12345.firebasestorage.app",
  messagingSenderId: "609779502201",
  appId: "1:609779502201:web:65dc770363f48e8ca7d8a8",
  measurementId: "G-B3E5NY9C8R"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const userId = "user1"; // Fixed userId for single user, multi-device access

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

    const loadFoods = async () => {
        try {
            const snapshot = await db.collection('users').doc(userId).collection('foods').get();
            foodsBody.innerHTML = '';
            if (snapshot.empty) {
                foodsBody.innerHTML = '<tr><td colspan="8">No foods added yet. Add one above!</td></tr>';
                return;
            }
            snapshot.forEach(doc => {
                const food = doc.data();
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
                            <button onclick="editFood('${doc.id}')">Edit</button>
                            <button class="delete" onclick="deleteFood('${doc.id}')">Delete</button>
                        </td>
                    </tr>
                `;
            });
        } catch (error) {
            console.error('Error loading foods:', error);
            foodsBody.innerHTML = '<tr><td colspan="8">Error loading foods. Check Firebase config.</td></tr>';
        }
    };

    window.editFood = async (id) => {
        try {
            const doc = await db.collection('users').doc(userId).collection('foods').doc(id).get();
            const food = doc.data();
            foodIdInput.value = doc.id;
            nameInput.value = food.name;
            amountInput.value = food.amount;
            unitTypeInput.value = food.unitType;
            kcalsInput.value = food.kcals;
            proteinInput.value = food.protein;
            carbsInput.value = food.carbs;
            fatInput.value = food.fat;
        } catch (error) {
            console.error('Error editing food:', error);
            alert('Failed to load food for editing.');
        }
    };

    window.deleteFood = async (id) => {
        if (confirm('Are you sure you want to delete this food? This will remove it from all summaries.')) {
            try {
                await db.collection('users').doc(userId).collection('foods').doc(id).delete();
                const snapshot = await db.collection('users').doc(userId).collection('dailySummary').where('foodId', '==', id).get();
                snapshot.forEach(doc => doc.ref.delete());
                loadFoods();
            } catch (error) {
                console.error('Error deleting food:', error);
                alert('Failed to delete food.');
            }
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const amount = parseFloat(amountInput.value);
        const unitType = unitTypeInput.value.trim();
        if (amount <= 0) {
            alert('Amount must be a positive number.');
            return;
        }
        if (unitType.length > 20) {
            alert('Unit Type must be 20 characters or less.');
            return;
        }

        const food = {
            name: nameInput.value,
            amount,
            unitType,
            kcals: parseFloat(kcalsInput.value),
            protein: parseFloat(proteinInput.value),
            carbs: parseFloat(carbsInput.value),
            fat: parseFloat(fatInput.value)
        };

        try {
            if (foodIdInput.value) {
                await db.collection('users').doc(userId).collection('foods').doc(foodIdInput.value).set(food);
                const snapshot = await db.collection('users').doc(userId).collection('dailySummary').where('foodId', '==', foodIdInput.value).get();
                snapshot.forEach(async (doc) => {
                    const item = doc.data();
                    await db.collection('users').doc(userId).collection('dailySummary').doc(doc.id).update({
                        foodName: food.name,
                        amount: food.amount,
                        unitType: food.unitType,
                        kcals: food.kcals * item.quantity,
                        protein: food.protein * item.quantity,
                        carbs: food.carbs * item.quantity,
                        fat: food.fat * item.quantity
                    });
                });
            } else {
                await db.collection('users').doc(userId).collection('foods').add(food);
            }
            form.reset();
            foodIdInput.value = '';
            loadFoods();
        } catch (error) {
            console.error('Error saving food:', error);
            alert('Failed to save food.');
        }
    });

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

    const loadFoodsDropdown = async () => {
        try {
            const snapshot = await db.collection('users').doc(userId).collection('foods').get();
            foodSelect.innerHTML = '<option value="">Select a food</option>';
            if (snapshot.empty) {
                foodSelect.innerHTML += '<option value="" disabled>No foods available</option>';
                return;
            }
            snapshot.forEach(doc => {
                const food = doc.data();
                foodSelect.innerHTML += `<option value="${doc.id}">${food.name} (${food.amount} ${food.unitType})</option>`;
            });
        } catch (error) {
            console.error('Error loading foods dropdown:', error);
            foodSelect.innerHTML = '<option value="" disabled>Error loading foods</option>';
        }
    };

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const foodId = foodSelect.value;
        const quantity = parseFloat(quantityInput.value);
        try {
            const doc = await db.collection('users').doc(userId).collection('foods').doc(foodId).get();
            const food = doc.data();
            if (food) {
                const today = new Date().toISOString().split('T')[0];
                await db.collection('users').doc(userId).collection('dailySummary').add({
                    date: today,
                    foodId: foodId,
                    foodName: food.name,
                    amount: food.amount,
                    unitType: food.unitType,
                    quantity,
                    kcals: food.kcals * quantity,
                    protein: food.protein * quantity,
                    carbs: food.carbs * quantity,
                    fat: food.fat * quantity
                });
                form.reset();
                quantityValue.textContent = '1';
                window.location.href = 'index.html';
            } else {
                alert('Selected food not found.');
            }
        } catch (error) {
            console.error('Error adding food to summary:', error);
            alert('Failed to add food to summary.');
        }
    });

    loadFoodsDropdown();
}

// Summary Page (index.html)
if (document.getElementById('summary-table')) {
    const summaryBody = document.getElementById('summary-body');
    const totalKcals = document.getElementById('total-kcals');
    const totalProtein = document.getElementById('total-protein');
    const totalCarbs = document.getElementById('total-carbs');
    const totalFat = document.getElementById('total-fat');
    const ctx = document.getElementById('macro-chart').getContext('2d');

    const cleanupOldEntries = async () => {
        try {
            const today = new Date().toISOString().split('T')[0];
            const snapshot = await db.collection('users').doc(userId).collection('dailySummary').where('date', '!=', today).get();
            snapshot.forEach(doc => doc.ref.delete());
        } catch (error) {
            console.error('Error cleaning up old entries:', error);
        }
    };

    const loadSummary = async () => {
        try {
            await cleanupOldEntries();
            const today = new Date().toISOString().split('T')[0];
            const foodsSnapshot = await db.collection('users').doc(userId).collection('foods').get();
            const foods = {};
            foodsSnapshot.forEach(doc => {
                foods[doc.id] = doc.data();
            });

            const snapshot = await db.collection('users').doc(userId).collection('dailySummary').where('date', '==', today).get();
            let totals = { kcals: 0, protein: 0, carbs: 0, fat: 0 };
            summaryBody.innerHTML = '';
            if (snapshot.empty) {
                summaryBody.innerHTML = '<tr><td colspan="7">No entries for today. Add a food to get started!</td></tr>';
            } else {
                snapshot.forEach(doc => {
                    const item = doc.data();
                    summaryBody.innerHTML += `
                        <tr>
                            <td>${item.foodName}</td>
                            <td>${item.amount} ${item.unitType}</td>
                            <td>${item.kcals.toFixed(1)}</td>
                            <td>${item.protein.toFixed(1)}</td>
                            <td>${item.carbs.toFixed(1)}</td>
                            <td>${item.fat.toFixed(1)}</td>
                            <td class="actions-cell">
                                <button class="actions-btn" onclick="toggleActionsMenu('${doc.id}')">⋯</button>
                                <div id="actions-menu-${doc.id}" class="actions-menu">
                                    <button class="edit" onclick="showEditForm('${doc.id}')">Edit</button>
                                    <button class="delete" onclick="deleteEntry('${doc.id}')">Delete</button>
                                </div>
                            </td>
                        </tr>
                        <tr id="edit-form-${doc.id}" class="edit-form">
                            <td colspan="7">
                                <form id="edit-summary-form-${doc.id}">
                                    <label for="edit-food-${doc.id}">Food:</label>
                                    <select id="edit-food-${doc.id}" required aria-label="Select a food">
                                        <option value="">Select a food</option>
                                        ${Object.keys(foods).map(id => `<option value="${id}" ${id === item.foodId ? 'selected' : ''}>${foods[id].name} (${foods[id].amount} ${foods[id].unitType})</option>`).join('')}
                                    </select>
                                    <label for="edit-quantity-${doc.id}">Quantity: <span id="edit-quantity-value-${doc.id}">${item.quantity}</span></label>
                                    <input type="range" id="edit-quantity-${doc.id}" min="0.25" max="20" step="0.25" value="${item.quantity}" required aria-label="Quantity slider">
                                    <button type="submit">Save</button>
                                    <button type="button" onclick="hideEditForm('${doc.id}')">Cancel</button>
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

            try {
                new Chart(ctx, {
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
                console.error('Error rendering chart:', error);
                document.getElementById('macro-chart').style.display = 'none';
            }

            snapshot.forEach(doc => {
                const form = document.getElementById(`edit-summary-form-${doc.id}`);
                const quantityInput = document.getElementById(`edit-quantity-${doc.id}`);
                const quantityValue = document.getElementById(`edit-quantity-value-${doc.id}`);
                if (form && quantityInput && quantityValue) {
                    quantityInput.addEventListener('input', () => {
                        quantityValue.textContent = quantityInput.value;
                    });
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        const foodId = document.getElementById(`edit-food-${doc.id}`).value;
                        const quantity = parseFloat(quantityInput.value);
                        try {
                            const foodDoc = await db.collection('users').doc(userId).collection('foods').doc(foodId).get();
                            const food = foodDoc.data();
                            if (food) {
                                await db.collection('users').doc(userId).collection('dailySummary').doc(doc.id).update({
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
                                loadSummary();
                            } else {
                                alert('Selected food not found.');
                            }
                        } catch (error) {
                            console.error('Error updating entry:', error);
                            alert('Failed to update entry.');
                        }
                    });
                } else {
                    console.error('Edit form elements not found for doc:', doc.id);
                }
            });
        } catch (error) {
            console.error('Error loading summary:', error);
            summaryBody.innerHTML = '<tr><td colspan="7">Error loading summary. Check Firebase config.</td></tr>';
        }
    };

    window.toggleActionsMenu = (docId) => {
        const menu = document.getElementById(`actions-menu-${docId}`);
        if (menu) {
            console.log('Toggling actions menu for ID:', docId);
            menu.classList.toggle('active');
        } else {
            console.error('Actions menu not found for ID:', docId);
        }
    };

    window.showEditForm = (docId) => {
        const editForm = document.getElementById(`edit-form-${docId}`);
        if (editForm) {
            editForm.classList.add('active');
            document.getElementById(`actions-menu-${docId}`).classList.remove('active');
        } else {
            console.error('Edit form not found for ID:', docId);
        }
    };

    window.hideEditForm = (docId) => {
        const editForm = document.getElementById(`edit-form-${docId}`);
        if (editForm) {
            editForm.classList.remove('active');
        } else {
            console.error('Edit form not found for ID:', docId);
        }
    };

    window.deleteEntry = async (docId) => {
        if (confirm('Are you sure you want to delete this entry?')) {
            try {
                await db.collection('users').doc(userId).collection('dailySummary').doc(docId).delete();
                loadSummary();
            } catch (error) {
                console.error('Error deleting entry:', error);
                alert('Failed to delete entry.');
            }
        }
    };

    loadSummary();
}