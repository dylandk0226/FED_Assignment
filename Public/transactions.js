const currentFilters = {
    month: new Date().getMonth(),
    year: new Date().getFullYear(),
    category: 'all',
    type: 'all',
    search: '',
    period: 'all'
};

let displayedTransactionsCount = 10;
const transactions_per_load = 10;

document.addEventListener('DOMContentLoaded', async () => {
    await initTransactions();
});

async function initTransactions() {
    setupMobileMenu();
    setupModal();

    const now = new Date();
    currentFilters.month = now.getMonth();
    currentFilters.year = now.getFullYear();

    setupMonthYearFilters();
    await loadCategories();
    setupFilters();
    setupLoadMore();
    await loadTransactionsSummary();
    await loadTransactions();

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
    const addTransactionBtn = document.getElementById('addTransactionBtn');
    const addTransactionModal = document.getElementById('addTransactionModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const addTransactionForm = document.getElementById('addTransactionForm');

    addTransactionBtn.addEventListener('click', () => {

    addTransactionForm.reset();

    addTransactionModal.querySelector('h2').textContent = 'Add Transaction';
    document.getElementById('submitTransactionBtn').textContent = 'Add Transaction';
    
    // Clear editing mode
    window.editingTransactionId = null;

    const typeBtns = addTransactionModal.querySelectorAll('.type-btn');
    typeBtns.forEach(btn => {
        btn.classList.remove('active', 'bg-red-50', 'border-red-500', 'text-red-700', 'bg-green-50', 'border-green-500', 'text-green-700');
        btn.classList.add('border-gray-300', 'text-gray-700');
    });
    
    const expenseBtn = addTransactionModal.querySelector('.expense-btn');
    expenseBtn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
    expenseBtn.classList.remove('border-gray-300', 'text-gray-700');
    
    // Reset category dropdown to default
    const modalCategory = document.getElementById('modalCategory');
    if (modalCategory && modalCategory.options.length > 0) {
        modalCategory.selectedIndex = 0;
    }

    setDefaultDate();

    addTransactionModal.classList.add('active');
});


    closeModal.addEventListener('click', () => {
        addTransactionModal.classList.remove('active');
    });

    cancelBtn.addEventListener('click', () => {
        addTransactionModal.classList.remove('active');
    });

    addTransactionModal.addEventListener('click', (e) => {
        if (e.target === addTransactionModal) {
            addTransactionModal.classList.remove('active');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && addTransactionModal.classList.contains('active')) {
            addTransactionModal.classList.remove('active');
            addTransactionForm.reset();
        }
    });

    addTransactionForm.addEventListener('submit', async(e) => {
        e.preventDefault();
        await handleAddTransaction(e.target);
    });

    setupTransactionTypeToggle();

}

async function handleAddTransaction(form) {
    const formData = new FormData(form);
    const typeBtn = document.querySelector('.type-btn.active');
    const type = typeBtn.dataset.type;
    const amount = parseFloat(formData.get('amount'));

    const transactionData = {
        description: formData.get('description'),
        amount: type === 'expense' ? -amount : amount,
        category: formData.get('category'),
        date: formData.get('date'),
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
        paymentMethod: formData.get('paymentMethod'),
        type: type,
        notes: formData.get('notes')
    };

    try {
        if (window.editingTransactionId) {
            transactionData.id = window.editingTransactionId;
            await API.updateTransaction(window.editingTransactionId, transactionData);
            alert('Transaction updated successfully!');

            window.editingTransactionId = null;

            document.getElementById('addTransactionModal').querySelector('h2').textContent = 'Add Transaction';
            document.getElementById('submitTransactionBtn').textContent = 'Add Transaction';
        } else {
            await API.addTransaction(transactionData);
            alert('Transaction added successfully!');
        }

        form.reset();
        document.getElementById('addTransactionModal').classList.remove('active');
        
        await loadTransactions();
        await loadTransactionsSummary();
        
    } catch (error) {
        console.error('Error saving transaction:', error);
        alert('Failed to save transaction');
    }
}

function resetEditMode() {
    window.editingTransactionId = null;
    const modal = document.getElementById('addTransactionModal');
    if (modal) {
        modal.querySelector('h2').textContent = 'Add Transaction';
    }
}

document.getElementById('cancelBtn')?.addEventListener('click', resetEditMode);
document.getElementById('closeModal')?.addEventListener('click', resetEditMode);

function setDefaultDate() {
    const dateInput = document.querySelector('#addTransactionForm input[type="date"]');

    if (dateInput) {
        const today = new Date().toISOString().split('T')[0];
        dateInput.value = today;
    }
}

function setupTransactionTypeToggle() {
    const typeBtns = document.querySelectorAll('.type-btn');
    const modalCategory = document.getElementById('modalCategory');

    typeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            typeBtns.forEach(b => {
                b.classList.remove('active', 'bg-red-50', 'border-red-500', 'text-red-700', 'bg-green-50', 'border-green-500', 'text-green-700');
                b.classList.add('border-gray-300', 'text-gray-700');
            });

            const type = btn.dataset.type;
            if (type === 'expense') {
                btn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            } else {
                btn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
                btn.classList.remove('border-gray-300', 'text-gray-700');
            }

            if (window.availableCategories && modalCategory) {
                modalCategory.innerHTML = '<option value="">Select a category</option>' + window.availableCategories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
            }
        });
    });
}

function setupMonthYearFilters() {
    const monthFilter = document.getElementById('monthFilter');
    const yearFilter = document.getElementById('yearFilter');
    const applyBtn = document.getElementById('applyFiltersBtn');
    const resetBtn = document.getElementById('resetFiltersBtn');

    const now = new Date();
    if (monthFilter) {
        monthFilter.value = now.getMonth();
    }
    if (yearFilter) {
        yearFilter.value = now.getFullYear();
    }
    if (applyBtn) {
        applyBtn.addEventListener('click', async () => {
            const monthValue = monthFilter.value;
            const selectedYear = parseInt(yearFilter.value);

            currentFilters.month = monthValue === 'all' ? 'all' : parseInt(monthValue);
            currentFilters.year = selectedYear;
            currentFilters.period = 'all';

            displayedTransactionsCount = 10;
            await loadTransactionsSummary();
            await loadTransactions();
            updatePeriodText();
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', async () => {
            const now = new Date();
            monthFilter.value = now.getMonth();
            yearFilter.value = now.getFullYear();

            currentFilters.month = now.getMonth();
            currentFilters.year = now.getFullYear();

            displayedTransactionsCount = 10;
            await loadTransactionsSummary();
            await loadTransactions();
            updatePeriodText();
        });
    }
}

async function loadTransactionsSummary() {
    try {
        const summary = await API.getTransactionsSummary(currentFilters.month, currentFilters.year);

        document.getElementById('totalIncome').textContent = `$${summary.totalIncome.toFixed(2)}`;
        document.getElementById('totalExpenses').textContent = `$${summary.totalExpenses.toFixed(2)}`;
        document.getElementById('netSavings').textContent = `$${summary.netSavings.toFixed(2)}`;
        document.getElementById('transactionCount').textContent = summary.transactionCount;

        updatePeriodText();
    } catch (error) {
        console.error('Error loading summary', error);
    }
}

function updatePeriodText() {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    let periodText = 'This month';

    if (currentFilters.month !== undefined && currentFilters.year !== undefined) {
        if (currentFilters.month === 'all') {
            periodText = `Year ${currentFilters.year}`;
        } else {
            periodText = `${monthNames[currentFilters.month]} ${currentFilters.year}`;
        }
    }

    document.querySelectorAll('.period-text').forEach(el => {
        el.textContent = periodText;
    });
}

async function loadCategories() {
    try {
        const goals = await API.getGoals();
        const categories = [...new Set(goals.map(g => g.category))];

        window.availableCategories = categories;

        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.innerHTML = '<option value="all">All Categories</option>';
            categories.forEach(cat => {
                const option = document.createElement('option');
                option.value = cat;
                option.textContent = cat;
                categoryFilter.appendChild(option);
                
            });
        }

        if (modalCategory && categories.length > 0) {
            modalCategory.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
        
        if (modalCategory && categories.length > 0) {
            modalCategory.innerHTML = '<option value="">Select a category</option>' + categories.map(cat => `<option value="${cat}">${cat}</option>`).join('');
        }
    } catch (error) {
        console.error('Error loading categories', error);
    }
}

function setupFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => {
                b.classList.remove('active', 'bg-primary', 'text-white');
                b.classList.add('text-gray-700');
            });

            btn.classList.add('active', 'bg-primary', 'text-white');
            btn.classList.remove('text-gray-700');

            currentFilters.period = btn.dataset.period;
            if (currentFilters.period !== 'all') {
                const now = new Date();
                currentFilters.month = now.getMonth();
                currentFilters.year = now.getFullYear();
            }

            displayedTransactionsCount = 10;
            loadTransactions();
        });
    });

    document.querySelector('.filter-btn.active')?.classList.add('bg-primary', 'text-white');

    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            currentFilters.search = e.target.value.toLowerCase();
            displayedTransactionsCount = 10;
            loadTransactions();
        });
    }

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentFilters.category = e.target.value;
            displayedTransactionsCount = 10;
            loadTransactions();
        });
    }

    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', (e) => {
            currentFilters.type = e.target.value;
            displayedTransactionsCount = 10;
            loadTransactions();
        });
    }
}

async function loadTransactions() {
    try {
        let transactions = await API.getTransactions();

        transactions = filterTransactions(transactions);

        const totalTransactions = transactions.length;
        const displayedTransactions = transactions.slice(0, displayedTransactionsCount);
        const groupedTransactions = groupTransactionsByDate(displayedTransactions);

        renderTransactions(groupedTransactions);

        updateLoadMoreButton(displayedTransactionsCount, totalTransactions);
    } catch (error) {
        console.error('Error loading Transactions', error);
    }
}

function filterTransactions(transactions) {
    return transactions.filter(t => {
        if (!matchesDateFilter(t)) return false;

        if (currentFilters.search && !t.description.toLowerCase().includes(currentFilters.search)) {
            return false;
        }

        if (currentFilters.category !== 'all' && t.category !== currentFilters.category) {
            return false;
        }

        if (currentFilters.type !== 'all' && t.type !== currentFilters.type) {
            return false;
        }

        if (!matchesPeriodFilter(t)) {
            return false;
        }

        return true;
    });
}

function matchesDateFilter(transaction) {
    if (currentFilters.month === 'all') {
        const tDate = new Date(transaction.date);
        return tDate.getFullYear() === currentFilters.year;
    }

    const tDate = new Date(transaction.date);
    return tDate.getMonth() === currentFilters.month && tDate.getFullYear() === currentFilters.year;
}

function matchesPeriodFilter(transaction) {
    const dateRange = getDateRange(currentFilters.period);
    if (!dateRange)
        return true;

    const tDate = new Date(transaction.date);
    tDate.setHours(0, 0, 0, 0);

    return tDate >= dateRange.start && tDate < dateRange.end;
}

function getDateRange(period) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    switch(period) {
        case 'today':
            return { start: today, end: tomorrow};

        case 'week':
            const weekStart = new Date(today);
            const dayOfWeek = today.getDay();
            const diff = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
            weekStart.setDate(today.getDate() - diff);
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 7);
            return { start: weekStart, end: weekEnd};

        case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() +1, 1);
            return { start: monthStart, end: monthEnd};

        default:
            return null;
    }
}

function groupTransactionsByDate(transactions) {
    const groups = {};

    transactions.forEach(t => {
        if (!groups[t.date]) {
            groups[t.date] = [];
        }
        groups[t.date].push(t);
    });
    
    return groups;
}

function renderTransactions(groupedTransactions) {
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';

    const sortedDates = Object.keys(groupedTransactions).sort((a, b) => new Date(b) - new Date(a));

    if (sortedDates.length === 0) {
        transactionsList.innerHTML = '<div class="p-6 text-center text-gray-500">No transactions found</div>';
        return;
    }

    sortedDates.forEach(date => {
        const dateHeader = createDateHeader(date);
        const dateGroup = document.createElement('div');
        dateGroup.className = 'transaction-group';
        dateGroup.innerHTML = dateHeader;
        transactionsList.appendChild(dateGroup);

        groupedTransactions[date].forEach(transaction => {
            const transactionsItem = createTransactionItem(transaction);
            const itemElement = document.createElement('div');
            itemElement.innerHTML = transactionsItem;
            transactionsList.appendChild(itemElement.firstElementChild);
        });
    });
}

function createDateHeader(date) {
    const formattedDate = formatDateHeader(date);
    return `
        <div class="px-6 py-3 bg-gray-50">
            <h3 class="text-sm font-semibold text-gray-700">${formattedDate}</h3>
        </div>
    `;
}

function formatDateHeader(dateString) {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    today.setHours(0, 0, 0, 0);
    yesterday.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);

    if (date.getTime() === today.getTime()) {
        return `Today - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else if (date.getTime() === yesterday.getTime()) {
        return `Yesterday - ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
}

function createTransactionItem(transaction) {
    const isIncome = transaction.type === 'income';
    const amountColor = isIncome ? 'text-green-600' : 'text-red-600';
    const amountSign = isIncome ? '+' : '-';
    const bgColor = isIncome ? 'bg-green-50' : 'bg-red-50';
    const borderColor = isIncome ? 'border-green-200' : 'border-red-200';

    return `
        <div class="transaction-item px-6 py-4 hover:bg-gray-50 transition border-l-4 ${borderColor} ${bgColor} relative group">
            <div class="flex items-center justify-between">
                <div class="flex-1">
                    <p class="font-semibold text-gray-900">${transaction.description}</p>
                    <div class="flex items-center gap-3 mt-1">
                        <span class="text-sm text-gray-600">${getCategoryLabel(transaction.category)}</span>
                        <span class="text-sm text-gray-400">•</span>
                        <span class="text-sm text-gray-500">${transaction.date}</span>
                        <span class="text-sm text-gray-400">•</span>
                        <span class="text-xs text-gray-500 bg-white px-2 py-1 rounded-full">${getPaymentMethodLabel(transaction.paymentMethod)}</span>
                    </div>
                    ${transaction.notes ? `<p class="text-sm text-gray-500 mt-2 italic">${transaction.notes}</p>` : ''}
                </div>
                <div class="text-right ml-4 flex items-center gap-4">
                    <p class="text-xl font-bold ${amountColor}">${amountSign}$${Math.abs(transaction.amount).toFixed(2)}</p>

                    <div class="relative">
                        <button class="menu-btn text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition opacity-0 group-hover:opacity-100" 
                                data-transaction-id="${transaction.id}"
                                onclick="toggleMenu(event, ${transaction.id})">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"/>
                            </svg>
                        </button>
                        
                        <div id="menu-${transaction.id}" class="menu-dropdown hidden absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <button onclick="editTransaction(${transaction.id})" class="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                                </svg>
                                Edit
                            </button>
                            <button onclick="confirmDelete(${transaction.id})" class="w-full text-left px-4 py-2 hover:bg-red-50 flex items-center gap-2 text-red-600 rounded-b-lg">
                                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                                </svg>
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCategoryLabel(category) {
    return category || 'Other';
}

function getPaymentMethodLabel(method) {
    const paymentMethods = {
        'cash': 'Cash',
        'credit': 'Credit Card',
        'ewallet': 'E-Wallet',
        'bank': 'Bank Transfer'
    };
    
    return paymentMethods[method] || method || 'Cash';
}

function toggleMenu(event, transactionId) {
    event.stopPropagation();
    
    // Close all other menus
    document.querySelectorAll('.menu-dropdown').forEach(menu => {
        if (menu.id !== `menu-${transactionId}`) {
            menu.classList.add('hidden');
        }
    });
    
    // Toggle this menu
    const menu = document.getElementById(`menu-${transactionId}`);
    menu.classList.toggle('hidden');
}

// Close menu when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.menu-btn') && !e.target.closest('.menu-dropdown')) {
        document.querySelectorAll('.menu-dropdown').forEach(menu => {
            menu.classList.add('hidden');
        });
    }
});

// Edit transaction
async function editTransaction(transactionId) {
    try {
        document.getElementById(`menu-${transactionId}`).classList.add('hidden');
        
        const transactions = await API.getTransactions();
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) {
            alert('Transaction not found!');
            return;
        }

        const modal = document.getElementById('addTransactionModal');
        const form = document.getElementById('addTransactionForm');

        modal.querySelector('h2').textContent = 'Edit Transaction';
        document.getElementById('submitTransactionBtn').textContent = 'Update Transaction';

        form.querySelector('[name="description"]').value = transaction.description;
        form.querySelector('[name="amount"]').value = Math.abs(transaction.amount);
        form.querySelector('[name="category"]').value = transaction.category;
        form.querySelector('[name="date"]').value = transaction.date;
        form.querySelector('[name="paymentMethod"]').value = transaction.paymentMethod || '';
        form.querySelector('[name="notes"]').value = transaction.notes || '';

        const typeBtns = modal.querySelectorAll('.type-btn');

        typeBtns.forEach(btn => {
            btn.classList.remove('active', 'bg-red-50', 'border-red-500', 'text-red-700', 'bg-green-50', 'border-green-500', 'text-green-700');
            btn.classList.add('border-gray-300', 'text-gray-700');
        });

        if (transaction.type === 'expense') {
            const expenseBtn = modal.querySelector('.expense-btn');
            expenseBtn.classList.add('active', 'bg-red-50', 'border-red-500', 'text-red-700');
            expenseBtn.classList.remove('border-gray-300', 'text-gray-700');
        } else {
            const incomeBtn = modal.querySelector('.income-btn');
            incomeBtn.classList.add('active', 'bg-green-50', 'border-green-500', 'text-green-700');
            incomeBtn.classList.remove('border-gray-300', 'text-gray-700');
        }

        window.editingTransactionId = transactionId;

        modal.classList.add('active');
        
    } catch (error) {
        console.error('Error editing transaction:', error);
        alert('Failed to load transaction for editing');
    }
}

// Confirm delete
async function confirmDelete(transactionId) {
    try {
        document.getElementById(`menu-${transactionId}`).classList.add('hidden');
        
        const transactions = await API.getTransactions();
        const transaction = transactions.find(t => t.id === transactionId);
        
        if (!transaction) {
            alert('Transaction not found!');
            return;
        }
        
        const deleteModal = document.getElementById('deleteTransactionModal');
        const deleteMessage = deleteModal.querySelector('.delete-message');
        
        if (deleteMessage) {
            deleteMessage.textContent = `Are you sure you want to delete "${transaction.description}" ($${Math.abs(transaction.amount).toFixed(2)})?`;
        }
        
        deleteModal.classList.add('active');
        window.currentDeleteId = transactionId;
        
    } catch (error) {
        console.error('Error confirming delete:', error);
        alert('Failed to delete transaction');
    }
}

// Delete transaction
async function deleteTransaction() {
    try {
        if (!window.currentDeleteId) {
            alert('No transaction selected for deletion');
            return;
        }
        
        await API.deleteTransaction(window.currentDeleteId);
        
        document.getElementById('deleteTransactionModal').classList.remove('active');
        
        await loadTransactions();
        await loadTransactionsSummary();
        
        window.currentDeleteId = null;
        
        alert('Transaction deleted successfully!');
        
    } catch (error) {
        console.error('Error deleting transaction:', error);
        alert('Failed to delete transaction');
    }
}


function updateLoadMoreButton(displayed, total) {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const loadMoreContainer = document.getElementById('loadMoreContainer');
    
    if (!loadMoreBtn || !loadMoreContainer) return;

    if (displayed >= total) {
        loadMoreContainer.style.display = 'none';
    } else {
        loadMoreContainer.style.display = 'block';
        const remaining = total - displayed;
        loadMoreBtn.textContent = `Load More (${remaining} remaining)`;
    }
}

function setupLoadMore() {
    const loadMoreBtn = document.getElementById('loadMoreBtn');

    if (loadMoreBtn) {
        loadMoreBtn.addEventListener('click', () => {
            displayedTransactionsCount += transactions_per_load;
            loadTransactions();
        });
    }
}



