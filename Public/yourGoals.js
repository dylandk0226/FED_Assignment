let currentFilter = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    await inityourGoals();
});

async function inityourGoals() {
    setupMobileMenu();
    setupModal();
    setupFilters();
    await loadGoalsSummary();
    await loadGoals();
}

function setupMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');

    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.add('-translate-x-full');
        overlay.classList.add('hidden');
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 1024) {
            sidebar.classList.remove('-translate-x-full');
            overlay.classList.add('hidden');
        }
    });
}

function setupModal() {
    const addGoalBtn = document.getElementById('addGoalBtn');
    const addGoalModal = document.getElementById('addGoalModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');

    addGoalBtn.addEventListener('click', () => {
        addGoalModal.classList.add('active');
    });

    closeModal.addEventListener('click', () => {
        addGoalModal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        addGoalModal.classList.remove('active');
    });

    addGoalModal.addEventListener('click', (e) => {
        if (e.target === addGoalModal) {
            addGoalModal.classList.remove('active');
        }
    });
    
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addGoalModal.classList.contains('active')) {
            addGoalModal.classList.remove('active');
            addGoalForm.reset();
        }
    });

    addGoalForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddGoal(e.target);
    });
    
    setupGoalTypeToggle();
    setupEditGoalModal();
    setupAddFundsModal();
    setupDeleteGoalModal();
    setupGoalMenus();
}

async function handleAddGoal(form) {
    const formData = new FormData(form);
    const goalData = {
        name: formData.get('goalName'),
        targetAmount: parseFloat(formData.get('targetAmount')),
        targetDate: formData.get('targetDate'),
        goalType: formData.get('goalType') || 'expense',
    };

    try {
        await API.addGoal(goalData);
        document.getElementById('addGoalModal').classList.remove('active');
        form.reset();
        await loadGoalsSummary();
        await loadGoals();
        alert('Goal created successfully! Your goal name is now available as a category for transactions.');
    } catch (error) {
        console.error('Error adding goal:', error);
        alert('Error creating goal. Please try again.');
    }
}

function setupGoalTypeToggle() {
    const typeBtns = document.querySelectorAll('.goal-type-btn');
    const typeInput = document.getElementById('goalType');

    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => {
                b.classList.remove('active', 'bg-green-50', 'border-green-500', 'text-green-700', 'bg-red-50', 'border-red-500', 'text-red-700');
                b.classList.add('border-gray-300', 'text-gray-700');
            });

            const type = btn.dataset.type;
            typeInput.value = type;

            if (type === 'income') {
                btn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            } else {
                btn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            }
        });
    });
}

function setupEditGoalModal() {
    const modal = document.getElementById('editGoalModal');
    const closeBtn = document.getElementById('closeEditModal');
    const cancelBtn = document.getElementById('cancelEditBtn');
    const form = document.getElementById('editGoalForm');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            form.reset();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            form.reset();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleEditGoal(form);
    });

    setupEditGoalTypeToggle();
}

function setupEditGoalTypeToggle() {
    const typeBtns = document.querySelectorAll('.edit-goal-type-btn');
    const typeInput = document.getElementById('editGoalType');

    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => {
                b.classList.remove('active', 'bg-green-50', 'border-green-500', 'text-green-700', 'bg-red-50', 'border-red-500', 'text-red-700');
                b.classList.add('border-gray-300', 'text-gray-700');
            });

            const type = btn.dataset.type;
            typeInput.value = type;

            if (type === 'income') {
                btn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            } else {
                btn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            }
        });
    });
}

function setupAddFundsModal() {
    const modal = document.getElementById('addFundsModal');
    const closeBtn = document.getElementById('closeAddFundsModal');
    const cancelBtn = document.getElementById('cancelAddFundsBtn');
    const form = document.getElementById('addFundsForm');

    const dateInput = document.getElementById('fundsDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }

    setupFundsTypeToggle();

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
        resetFundsTypeToggle();
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
        form.reset();
        resetFundsTypeToggle();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
            form.reset();
            resetFundsTypeToggle();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
            form.reset();
            resetFundsTypeToggle();
        }
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        await handleAddFunds(form);
    });
}

function setupFundsTypeToggle() {
    const typeBtns = document.querySelectorAll('.funds-type-btn');
    const typeInput = document.getElementById('fundsTransactionType');

    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => {
                b.classList.remove('active', 'bg-green-50', 'border-green-500', 'text-green-700', 'bg-red-50', 'border-red-500', 'text-red-700');
                b.classList.add('border-gray-300', 'text-gray-700');
            });

            const type = btn.dataset.type;
            typeInput.value = type;

            if (type === 'income') {
                btn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            } else {
                btn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            }
        });
    });
}

function resetFundsTypeToggle() {
    const typeBtns = document.querySelectorAll('.funds-type-btn');
    const typeInput = document.getElementById('fundsTransactionType');

    typeBtns.forEach(btn => {
        btn.classList.remove('active', 'bg-green-50', 'border-green-500', 'text-green-700', 'bg-red-50', 'border-red-500', 'text-red-700');
        btn.classList.add('border-gray-300', 'text-gray-700');

        if (btn.dataset.type === 'income') {
            btn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
            btn.classList.remove('border-gray-300', 'text-gray-700');
        }
    });

    if (typeInput) {
        typeInput.value = 'income';
    }
}

function setupDeleteGoalModal() {
    const modal = document.getElementById('deleteGoalModal');
    const closeBtn = document.getElementById('closeDeleteModal');
    const cancelBtn = document.getElementById('cancelDeleteBtn');
    const confirmBtn = document.getElementById('confirmDeleteBtn');

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        modal.classList.remove('active');
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });

    confirmBtn.addEventListener('click', async () => {
        await handleDeleteGoal();
    });
}

async function handleAddFunds(form) {
    const formData = new FormData(form);
    const transactionType = formData.get('transactionType') || 'income';
    const amount = parseFloat(formData.get('amount'));
    const finalAmount = transactionType === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const transactionData = {
        description: formData.get('description'),
        amount: finalAmount,
        category: formData.get('goalCategory'),
        date: formData.get('date'),
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit'}),
        notes: formData.get('notes'),
        type: transactionType,
    };

    try {
        await API.addTransaction(transactionData);
        document.getElementById('addFundsModal').classList.remove('active');
        form.reset();
        resetFundsTypeToggle();
        await loadGoalsSummary();
        await loadGoals();

        const typeText = transactionType === 'income' ? 'added to' : 'deducted from';
        alert(`Transaction added successfully! $${Math.abs(finalAmount)} ${typeText} ${transactionData.category}`);
    } catch (error) {
        console.error('Error adding transaction:', error);
        alert('Error adding transaction. Please try again.');
    }
}

async function loadGoalsSummary() {
    try {
        const summary = await API.getGoalsSummary();

        document.getElementById('totalGoals').textContent = summary.totalGoals;
        document.getElementById('activeGoalsCount').textContent = summary.activeGoals;
        document.getElementById('completedGoalsCount').textContent = summary.completedGoals;
        document.getElementById('totalSavedAmount').textContent = `$${summary.totalSaved.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading goals summary:', error);
    }
}

async function loadGoals() {
    try {
        let goals;

        if (currentFilter === 'all') {
            goals = await API.getGoals();
        } else if (currentFilter === 'active') {
            goals = await API.getActiveGoals();
        } else if (currentFilter === 'completed') {
            goals = await API.getCompletedGoals();
        }

        const goalsContainer = document.getElementById('goalsContainer');
        goalsContainer.innerHTML = '';

        goals.forEach(goal => {
            const goalCard = createGoalCard(goal);
            goalsContainer.innerHTML += goalCard;
        });
    } catch (error) {
        console.error('Error loading goals:', error);
    }
}

function createGoalCard(goal) {
    const isExpenseGoal = goal.goalType === 'expense';
    const isCompleted = goal.status === 'completed';
    const displayAmount = isCompleted ? goal.currentAmount : (isExpenseGoal ? Math.abs(goal.categorySpending || 0) : goal.currentAmount);
    const progress = API.calculateGoalProgress(displayAmount, goal.targetAmount);
    const progressBarWidth = Math.min(progress, 100);

    let status, statusText, statusClass, progressColor;

    if (isCompleted) {
        status = 'Completed';
        statusText = 'Completed';
        statusClass = 'bg-green-100 text-green-700';
        progressColor = 'bg-green-500';
    } else if (isExpenseGoal && progress > 100) {
        status = 'Over Budget';
        statusText = 'Over Budget';
        statusClass = 'bg-red-100 text-red-700';
        progressColor = 'bg-red-500';
    } else if (isExpenseGoal && progress > 90) {
        status = 'behind';
        statusText = 'Behind';
        statusClass = 'bg-yellow-100 text-yellow-700';
        progressColor = 'bg-yellow-500';
    } else if (!isExpenseGoal && progress < 50) {
        status = 'behind';
        statusText = 'Behind';
        statusClass = 'bg-yellow-100 text-yellow-700';
        progressColor = 'bg-yellow-500';
    } else {
        status = 'on track';
        statusText = 'On Track';
        statusClass = 'bg-green-100 text-green-700';
        progressColor = 'bg-primary';
    }

    const borderClass = isCompleted ? 'border-green-200' : status === 'Over Budget' ? 'border-red-200' : 'border-gray-200';
    const amountLable = isExpenseGoal ? 'Spent' : 'Saved';
    const targetLable = isExpenseGoal ? 'Budget' : 'Target';

    if (isCompleted) {
        return `
            <div class="bg-white rounded-xl shadow-md p-6 border ${borderClass} hover:shadow-lg transition" data-status="${goal.status}">
                <div class="flex items-start justify-between mb-4">
                    <div>
                        <h3 class="text-xl font-bold text-gray-900">${goal.name}</h3>
                        <p class="text-sm text-gray-500">Completed: ${formatDate(goal.completedDate)}</p>
                    </div>
                    <span class="bg-green-500 text-white p-2 rounded-full">
                        ✓
                    </span>
                </div>
                
                <div class="mb-4">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-2xl font-bold text-green-600">$${displayAmount}</span>
                        <span class="text-lg text-gray-600">/ $${goal.targetAmount}</span>
                    </div>
                    <div class="w-full bg-gray-200 rounded-full h-3">
                        <div class="${progressColor} h-3 rounded-full transition-all duration-500" style="width: 100%"></div>
                    </div>
                    <div class="flex items-center justify-between mt-2">
                        <span class="text-sm text-green-600 font-medium">Goal Completed! 🎉</span>
                        <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">${statusText}</span>
                    </div>
                </div>

                <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div class="text-sm">
                        <p class="text-gray-500">Achievement date</p>
                        <p class="font-semibold text-gray-900">${formatDate(goal.completedDate)}</p>
                    </div>
                    <button class="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition">
                        View Details
                    </button>
                </div>
            </div>
        `;
    }

    return `
        <div class="bg-white rounded-xl shadow-md p-6 border ${borderClass} hover:shadow-lg transition" data-status="${goal.status}" data-goal-id="${goal.id}">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-xl font-bold text-gray-900">${goal.name}</h3>
                    <p class="text-sm text-gray-500">Target: ${formatDate(goal.targetDate)}</p>
                </div>
                <div class="relative">
                    <button class="goal-menu-btn text-gray-400 hover:text-gray-600 text-xl" data-goal-id="${goal.id}">
                        ⋮
                    </button>
                    <div class="goal-menu hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                        <button class="edit-goal-btn w-full text-left px-4 py-2 hover:bg-gray-50 text-gray-700 flex items-center space-x-2" 
                                data-goal-id="${goal.id}"
                                data-goal-name="${goal.name}"
                                data-goal-target="${goal.targetAmount}"
                                data-goal-date="${goal.targetDate}"
                                data-goal-type="${goal.goalType || 'expense'}">
                            <span>Edit Goal</span>
                        </button>
                        <button class="delete-goal-btn w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center space-x-2"
                                data-goal-id="${goal.id}"
                                data-goal-name="${goal.name}">
                            <span>Delete Goal</span>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                    <span class="text-2xl font-bold text-gray-900">$${displayAmount}</span>
                    <span class="text-lg text-gray-600">/ $${goal.targetAmount}</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-3">
                    <div class="${progressColor} h-3 rounded-full transition-all duration-500" style="width: ${progressBarWidth}%"></div>
                </div>
                <div class="flex items-center justify-between mt-2">
                    <span class="text-sm text-gray-600">${progress}% ${isExpenseGoal ? 'of budget spent' : 'Complete'}</span>
                    <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">${statusText}</span>
                </div>
            </div>

            <div class="flex items-center justify-between pt-4 border-t border-gray-100">
                <button class="add-funds-btn bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition"
                        data-goal-id="${goal.id}"
                        data-goal-name="${goal.name}"
                        data-goal-category="${goal.category || goal.name}"
                        data-goal-type="${goal.goalType || 'expense'}">
                    Add Transaction
                </button>
            </div>
        </div>
    `;
}

function formatDate(dateString) {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
}

function setupGoalMenus() {
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('goal-menu-btn')) {
            e.stopPropagation();
            const menu = e.target.nextElementSibling;
            
            document.querySelectorAll('.goal-menu').forEach(m => {
                if (m !== menu) m.classList.add('hidden');
            });

            menu.classList.toggle('hidden');
        } else if (e.target.closest('.edit-goal-btn')) {
            const btn = e.target.closest('.edit-goal-btn');
            openEditGoalModal(btn.dataset);
            btn.closest('.goal-menu').classList.add('hidden');
        } else if (e.target.closest('.delete-goal-btn')) {
            const btn = e.target.closest('.delete-goal-btn');
            openDeleteGoalModal(btn.dataset);
            btn.closest('.goal-menu').classList.add('hidden');
        } else if (e.target.closest('.add-funds-btn')) {
            const btn = e.target.closest('.add-funds-btn');
            openAddFundsModal(btn.dataset);
        } else {
            document.querySelectorAll('.goal-menu').forEach(m => m.classList.add('hidden'));
        }
    });
}

function openAddFundsModal(data) {
    const modal = document.getElementById('addFundsModal');
    document.getElementById('fundsGoalId').value = data.goalId;
    document.getElementById('fundsGoalCategory').value = data.goalCategory;
    document.getElementById('fundsGoalCategoryDisplay').value = data.goalCategory;
    document.getElementById('fundsDescription').value = data.goalName;

    const goalType = data.goalType || 'expense';
    const defaulTransactionType = goalType;
    document.getElementById('fundsTransactionType').value = defaulTransactionType;

    const typeBtns = document.querySelectorAll('.funds-type-btn');
    typeBtns.forEach(btn => {
        btn.classList.remove('active', 'bg-green-50', 'border-green-500', 'text-green-700', 'bg-red-50', 'border-red-500', 'text-red-700');
        btn.classList.add('border-gray-300', 'text-gray-700');

        if (btn.dataset.type === defaulTransactionType) {
            if (defaulTransactionType === 'income') {
                btn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            } else {
                btn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            }
        }
    });

    modal.classList.add('active');
}

function openEditGoalModal(data) {
    const modal = document.getElementById('editGoalModal');
    document.getElementById('editGoalId').value = data.goalId;
    document.getElementById('editGoalName').value = data.goalName;
    document.getElementById('editTargetAmount').value = data.goalTarget;
    document.getElementById('editTargetDate').value = data.goalDate;

    const goalType = data.goalType || 'expense';
    document.getElementById('editGoalType').value = goalType;

    const typeBtns = document.querySelectorAll('.edit-goal-type-btn');
    typeBtns.forEach(btn => {
        btn.classList.remove('active', 'bg-green-50', 'border-green-500', 'text-green-700', 'bg-red-50', 'border-red-500', 'text-red-700');
        btn.classList.add('border-gray-300', 'text-gray-700');

        if (btn.dataset.type === goalType) {
            if (goalType === 'income') {
                btn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            } else {
                btn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            }
        }
    });

    modal.classList.add('active');
}

function openDeleteGoalModal(data) {
    const modal = document.getElementById('deleteGoalModal');
    document.getElementById('deleteGoalId').value = data.goalId;
    document.getElementById('deleteGoalName').textContent = data.goalName;
    modal.classList.add('active');
}

async function handleDeleteGoal(form) {
    const formData = new FormData(form);
    const goalId = formData.get('goalId');
    const goalData = {
        name: formData.get('goalName'),
        targetAmount: parseFloat(formData.get('targetAmount')),
        targetDate: formData.get('targetDate'),
        goalType: formData.get('goalType') || 'expense',
    };

    try {
        await API.updateGoal(goalId, goalData);
        document.getElementById('editGoalModal').classList.remove('active');
        form.reset();
        await loadGoalsSummary();
        await loadGoals();
        alert('Goal updated successfully!');
    } catch (error) {
        console.error('Error updating goal:', error);
        alert('Error updating goal. Please try again.');
    }
}

async function handleDeleteGoal() {
    const goalId = document.getElementById('deleteGoalId').value;

    try {
        await API.deleteGoal(goalId);
        document.getElementById('deleteGoalModal').classList.remove('active');
        await loadGoalsSummary();
        await loadGoals();
        alert('Goal deleted successfully!');
    } catch (error) {
        console.error('Error deleting goal:', error);
        alert('Error deleting goal. Please try again.');
    }
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            filterBtns.forEach(b => {
                b.classList.remove('bg-primary', 'text-white');
                b.classList.add('text-gray-700');
            });

            btn.classList.add('active', 'bg-primary', 'text-white');
            btn.classList.remove('text-gray-700');

            currentFilter = btn.dataset.filter;
            await loadGoals();
        });
    });

    document.querySelector('.filter-btn.active').classList.add('bg-primary', 'text-white');
}