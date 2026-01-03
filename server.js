const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static('Public'));

const DB = require('./data.js');

// Get user profile
app.get('/api/user', (req, res) => {
    const { password, ...userWithoutPassword } = DB.user;
    res.json(userWithoutPassword);
});

// Update profile
app.put('/api/user', (req, res) => {
    DB.user = {
        ...DB.user,
        name: req.body.name || DB.user.name,
        email: req.body.email || DB.user.email,
        phone: req.body.phone || DB.user.phone

    };

    const { password, ...userWithoutPassword } = DB.user;
    res.json(userWithoutPassword);
});

// Update password
app.put('/api/user/password', (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (currentPassword !== DB.user.password) {
        return res.status(401).json({ error: 'Current password is incorrect'});
    }

    DB.user.password = newPassword;

    res.json({ message: 'Password updated successfully'});
});

// Get all categories
function getAllCategories() {

    const goalCategories = DB.goals.map(goal => goal.name);
    // Get categories from transactions
    const transactionCategories = [...new Set(DB.transactions.map(t => t.category))];
    const allCategories = [...new Set([...goalCategories, ...transactionCategories])];
    return allCategories.sort();
}

// Calculate goal current amounts from Transactions
function calculateGoalProgress(goal) {

    if (goal.status === 'completed') {
        return goal.targetAmount;
    }

    const categoryTransactions = DB.transactions.filter(t => t.category && goal.name && t.category.toLowerCase() === goal.name.toLowerCase());

    const currentAmount = categoryTransactions.reduce((sum, t) => {
        return sum + t.amount;
    }, 0);

    return Math.max(0, currentAmount);
}

//Get total spending for a category
function getCategorySpending(categoryName) {
    return DB.transactions
        .filter(t => t.category && categoryName && t.category.toLowerCase() === categoryName.toLowerCase() && t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}

// Get total income for a category
function getCategoryIncome(categoryName) {
    return DB.transactions
        .filter(t => t.category && categoryName && t.category.toLowerCase() === categoryName.toLowerCase() && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
}

function getCategoryContributions(categoryName) {
    return DB.transactions
        .filter(t => t.category && categoryName && t.category.toLowerCase() === categoryName.toLowerCase() && t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
}

// Endpoints

// Get all categories
app.get('/api/categories', (req, res) => {
    const categories = getAllCategories();
    res.json(categories);
});

// Get all goals
app.get('/api/goals', (req, res) => {
    const goalsWithProgress = DB.goals.map(goal => ({
        ...goal,
        currentAmount: calculateGoalProgress(goal),
        categorySpending: getCategorySpending(goal.name),
        categoryContributions: getCategoryIncome(goal.name),
        category: goal.name

    }));

    res.json(goalsWithProgress);
});

// Get goal by ID
app.get('/api/goals/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const goal = DB.goals.find(g => g.id === id);

    if (goal) {
        res.json({
            ...goal,
            currentAmount: calculateGoalProgress(goal),
            categorySpending: getCategorySpending(goal.name),
            categoryContributions: getCategoryIncome(goal.name),
            category: goal.name
        });
    } else {
        res.status(404).json({ error: 'Goal not found' });
    }
});

// Get active goals
app.get('/api/goals/active', (req, res) => {
    const activeGoals = DB.goals.filter(g => g.status === 'active').map(goal => ({
        ...goal,
        currentAmount: calculateGoalProgress(goal),
        categorySpending: getCategorySpending(goal.name),
        categoryContributions: getCategoryIncome(goal.name),
        category: goal.name
    }));

    res.json(activeGoals);
});

// Get completed goals
app.get('/api/goals/completed', (req, res) => {
    const completedGoals = DB.goals.filter(g => g.status === 'completed').map(goal => ({
        ...goal,
        currentAmount: calculateGoalProgress(goal),
        categorySpending: getCategorySpending(goal.name),
        categoryContributions: getCategoryIncome(goal.name),
        category: goal.name
    }));

    res.json(completedGoals);
});

// Create new goal
app.post('/api/goals', (req, res) => {
    const newGoal = {
        id: DB.goals.length > 0 ? Math.max(...DB.goals.map(g => g.id)) + 1 : 1,
        name: req.body.name, // Goal name = category
        targetAmount: req.body.targetAmount,
        targetDate: req.body.targetDate,
        status: 'active',
        goalType: req.body.goalType || 'expenses'
    };

    DB.goals.push(newGoal);

    res.status(201).json({
        ...newGoal,
        currentAmount: calculateGoalProgress(newGoal),
        category: newGoal.name
    });
});

// Update goal
app.put('/api/goals/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = DB.goals.findIndex(g => g.id === id);

    if (index !== -1) {
        DB.goals[index] = {
            ...DB.goals[index],
            ...req.body
        };

        res.json({
            ...DB.goals[index],
            currentAmount: calculateGoalProgress(DB.goals[index]),
            category: DB.goals[index].name
        });
    } else {
        res.status(404).json({ error: 'Goal not found' });
    }

});

// Delete goal
app.delete('/api/goals/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const initialLength = DB.goals.length;
    DB.goals = DB.goals.filter(g => g.id !== id);

    if (DB.goals.length < initialLength) {
        res.json({ message: 'Goal deleted successfully' });
    } else {
        res.status(404).json({ error: 'Goal not found' });
    }
});

//Get category breakdown
app.get('/api/summary/categories-breakdown', (req, res) => {
    const breakdown = DB.goals.map(goal => {
        const categoryTransactions = DB.transactions.filter(t => t.category && goal.name && t.category.toLowerCase() === goal.name.toLowerCase());

        const contributions = getCategoryContributions(goal.name);
        const spending = getCategorySpending(goal.name);
        const currentAmount = calculateGoalProgress(goal);

        return {
            goalId: goal.id,
            goalName: goal.name,
            category: goal.name,
            targetAmount: goal.targetAmount,
            currentAmount: currentAmount,
            contributions: contributions,
            spending: spending,
            transactions: categoryTransactions.length,
            progress: goal.targetAmount > 0 ? Math.round(currentAmount / goal.targetAmount) * 100 : 0
        };
    });

    res.json(breakdown);
});

// Get goals summary
app.get('/api/summary/goals', (req, res) => {
    const activeGoals = DB.goals.filter(g => g.status === 'active');
    const completedGoals = DB.goals.filter(g => g.status === 'completed');

    const totalSaved = DB.goals.reduce((sum, goal) => {
        if (goal.goalType !== 'income'){
            return sum;
        }

        let goalSaved = 0;

        if (goal.status === 'completed'){
            goalSaved = goal.targetAmount;
        }else {
            const incomeTransactions = DB.transactions.filter(t => t.category && goal.name && t.category.toLowerCase() === goal.name.toLowerCase() && t.type === 'income');
            
            goalSaved = incomeTransactions.reduce((incomeSum, t) => {
                return incomeSum + t.amount;
            }, 0);
        }

    return sum + goalSaved;
}, 0);

res.json({
    totalGoals: DB.goals.length,
    activeGoals: activeGoals.length,
    completedGoals: completedGoals.length,
    totalSaved
});
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
    res.json(DB.transactions);
});

// Create new transaction
app.post('/api/transactions', (req, res) => {
    const newTransaction = {
        id: DB.transactions.length > 0 ? Math.max(...DB.transactions.map(t => t.id)) + 1 : 1,
        ...req.body
    };

    DB.transactions.push(newTransaction);
    res.status(201).json(newTransaction);
});

// Update transaction
app.put('/api/transactions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = DB.transactions.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    DB.transactions[index] = {
        ...DB.transactions[index],
        ...req.body
    };

    res.json(DB.transactions[index]);
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = DB.transactions.findIndex(t => t.id === id);

    if (index === -1) {
        return res.status(404).json({ error: 'Transaction not found' });
    }

    const deleted = DB.transactions.splice(index, 1)[0];
    res.json({ message: 'Transaction deleted', transaction: deleted});
});

// Get total savings
app.get('/api/calculations/total-savings', (req, res) => {
    const total = DB.goals.reduce((sum, goal) => {
        const currentAmount = calculateGoalProgress(goal);
        return sum + currentAmount;
    }, 0);

    res.json({ totalSavings: total });
});

// Get monthly income
app.get('/api/calculations/monthly-income', (req, res) => {
    const now = new Date();
    const selectedYear = req.query.year !== undefined ? parseInt(req.query.year) : now.getFullYear();
    const selectedMonth = req.query.month;

    const income = DB.transactions
        .filter(t => {
            const tData = new Date(t.date);

            if (selectedMonth === 'all') {
                return t.type === 'income' && tData.getFullYear() === selectedYear;
            }

            const monthNum = selectedMonth !== undefined ? parseInt(selectedMonth) : now.getMonth();
            return t.type === 'income' && tData.getMonth() === monthNum && tData.getFullYear() === selectedYear;
        })

        .reduce((sum, t) => sum + t.amount, 0);

    res.json({ monthlyIncome: income });
});

// Get monthly expenses
app.get('/api/calculations/monthly-expenses', (req, res) => {
    const now = new Date();
    const selectedYear = req.query.year !== undefined ? parseInt(req.query.year) : now.getFullYear();
    const selectedMonth = req.query.month;

    const expenses = DB.transactions
        .filter(t => {
            const tData = new Date(t.date);

            if (selectedMonth === 'all') {
                return t.type === 'expense' && tData.getFullYear() === selectedYear;
            }

            const monthNum = selectedMonth !== undefined ? parseInt(selectedMonth) : now.getMonth();
            return t.type === 'expense' && tData.getMonth() === monthNum && tData.getFullYear() === selectedYear;
        })

        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    res.json({ monthlyExpenses: expenses });
});

// Get transactions summary
app.get('/api/summary/transactions', (req, res) => {
    const now = new Date();
    const selectedYear = req.query.year !== undefined ? parseInt(req.query.year) : now.getFullYear();
    const selectedMonth = req.query.month;

    const currentMonthTransactions = DB.transactions.filter(t => {
        const tData = new Date(t.date);

        if (selectedMonth === 'all') {
            return tData.getFullYear() === selectedYear;
        }

        const monthNum = selectedMonth !== undefined ? parseInt(selectedMonth) : now.getMonth();
        return tData.getMonth() === monthNum && tData.getFullYear() === selectedYear;
    });

    // Calculate totals
    const totalIncome = currentMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = currentMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const netSavings = totalIncome - totalExpenses;
    const transactionCount = currentMonthTransactions.length;

    res.json({
        totalIncome,
        totalExpenses,
        netSavings,
        transactionCount
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});







