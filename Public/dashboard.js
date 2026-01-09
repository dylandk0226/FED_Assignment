document.addEventListener('DOMContentLoaded', async () => {
    await initDashboard();
});

async function initDashboard() {
    setupMobileMenu();
    await loadDashboardStats();
    await loadRecentGoals();
    await loadRecentTransactions();
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

async function loadDashboardStats() {
    try {
        const summary = await API.getGoalsSummary();
        const monthlyIncome = await API.calculateMonthlyIncome();
        const monthlyExpenses = await API.calculateMonthlyExpenses();
        const availableToSave = monthlyIncome - monthlyExpenses;

        document.getElementById('totalSavings').textContent = `$${summary.totalSaved.toLocaleString()}`;
        document.getElementById('monthlyIncome').textContent = `$${monthlyIncome.toLocaleString()}`;
        document.getElementById('monthlyExpenses').textContent = `$${monthlyExpenses.toLocaleString()}`;
        document.getElementById('availableToSave').textContent = `$${availableToSave.toLocaleString()}`;
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

async function loadRecentGoals() {
    try {
        const activeGoals = await API.getActiveGoals();
        const recentGoals = activeGoals.slice(0, 3);
        const goalsContainer = document.getElementById('goalsContainer');

        if (!goalsContainer) return;
        goalsContainer.innerHTML = '';

        if (recentGoals.length === 0) {
            goalsContainer.innerHTML = `
                <div class="col-span-3 text-center py-8 text-gray-500">
                    <p>No active goals yet. Create your first goal!</p>
                </div>
            `;
            return;
        }

        recentGoals.forEach(goal => {
            const goalCard = createGoalCard(goal);
            goalsContainer.innerHTML += goalCard;
        });
    } catch (error) {
        console.error('Error loading recent goals:', error);
    }
}

function createGoalCard(goal) {
    const isExpenseGoal = (goal.goalType === 'expense');
    const isCompleted = goal.status === 'completed';
    const displayAmount = isCompleted ? goal.currentAmount : (isExpenseGoal ? Math.abs(goal.categorySpending || 0) : goal.currentAmount);
    const progress = API.calculateGoalProgress(displayAmount, goal.targetAmount);
    const progressBarWidth = Math.min(progress, 100);

    let status, statusText, statusClass, progressColor;

    if (isCompleted) {
        status = 'completed';
        statusText = 'Completed';
        statusClass = 'bg-green-100 text-green-700';
        progressColor = 'bg-green-500';
    } else if (isExpenseGoal && progress > 100) {
        status = 'over-budget';
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
        status = 'on-track';
        statusText = 'On Track';
        statusClass = 'bg-green-100 text-green-700';
        progressColor = 'bg-primary';
    }

    const amountLabel = isExpenseGoal ? 'Spent' : 'Saved';

    return `
        <div class="bg-white rounded-xl shadow-md p-6 border border-gray-200 hover:shadow-lg transition">
            <div class="flex items-start justify-between mb-4">
                <div class="flex items-center space-x-3">
                    <div>
                        <h3 class="text-lg font-semibold text-gray-900">${goal.name}</h3>
                        <p class="text-sm text-gray-600">$${displayAmount.toLocaleString()} / $${goal.targetAmount.toLocaleString()}</p>
                    </div>
                </div>
                <span class="${statusClass} px-3 py-1 rounded-full text-xs font-medium">${statusText}</span>
            </div>
            <div class="space-y-1">
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-600">Progress</span>
                    <span class="font-semibold text-primary">${progress}%</span>
                </div>
                <div class="w-full bg-gray-200 rounded-full h-2">
                    <div class="${progressColor} h-2 rounded-full transition-all" style="width: ${progressBarWidth}%"></div>
                </div>
            </div>
        </div>
    `;
}

async function loadRecentTransactions() {
    try {
        const transactions = await API.getTransactions();
        const recentTransactions = transactions.slice(0, 5);
        const transactionsContainer = document.getElementById('recentTransactions');

        if (!transactionsContainer) return;
        transactionsContainer.innerHTML = '';

        if (recentTransactions.length === 0) {
            transactionsContainer.innerHTML = `
                <div class="text-center py-8 text-gray-500">
                    <p>No transactions yet.</p>
                </div>
            `;
            return;
        }

        recentTransactions.forEach(transaction => {
            const transactionItem = createTransactionItem(transaction);
            transactionsContainer.innerHTML += transactionItem;
        });
    } catch (error) {
        console.error('Error loading recent transactions:', error);
    }
}

function createTransactionItem(transaction) {
    const isIncome = transaction.type === 'income';
    const iconBg = isIncome ? 'bg-green-100' : 'bg-red-100';
    const iconColor = isIncome ? 'text-green-600' : 'text-red-600';
    const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
    const amountSign = isIncome ? '+' : '-';

    const date = new Date(transaction.date);
    const formattedDate = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });

    const arrow = isIncome ? '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 15l7-7 7 7"></path>' : '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>';

    return `
        <div class="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
            <div class="flex items-center space-x-3">
                <div class="${iconBg} p-2 rounded-lg">
                    <svg class="w-5 h-5 ${iconColor}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        ${arrow}
                    </svg>
                </div>
                <div>
                    <p class="font-medium text-gray-900">${transaction.description}</p>
                    <div class="flex items-center gap-2 text-sm text-gray-500">
                        <span>${transaction.category || 'Uncategorized'}</span>
                        <span>•</span>
                        <span>${formattedDate}</span>
                    </div>
                </div>
            </div>
            <p class="font-semibold ${amountColor}">${amountSign}$${Math.abs(transaction.amount).toFixed(2)}</p>
        </div>
    `;
}