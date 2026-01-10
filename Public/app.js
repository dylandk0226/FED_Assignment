const BASE_URL = 'https://myfingoals.onrender.com';

const API = {
    getUser: async () => {
        const response = await axios.get(`${BASE_URL}/api/user`);
        return response.data;
    },

    updateUser: async (userData) => {
        const response = await axios.put(`${BASE_URL}/api/user`, userData);
        return response.data;
    },

    updatePassword: async (currentPassword, newPassword) => {
        const response = await axios.put(`${BASE_URL}/api/user/password`, {
            currentPassword,
            newPassword
        });
        return response.data;
    },

    getGoals: async () => {
        const response = await axios.get(`${BASE_URL}/api/goals`);
        return response.data;
    },

    getGoalById: async (id) => {
        const response = await axios.get(`${BASE_URL}/api/goals/${id}`);
        return response.data;
    },

    getActiveGoals: async () => {
        const response = await axios.get(`${BASE_URL}/api/goals/status/active`);
        return response.data;
    },

    getCompletedGoals: async () => {
        const response = await axios.get(`${BASE_URL}/api/goals/status/completed`);
        return response.data;
    },

    addGoal: async (goalData) => {
        const response = await axios.post(`${BASE_URL}/api/goals`, goalData);
        return response.data;
    },

    updateGoal: async (id, goalData) => {
        const response = await axios.put(`${BASE_URL}/api/goals/${id}`, goalData);
        return response.data;
    },

    deleteGoal: async (id) => {
        const response = await axios.delete(`${BASE_URL}/api/goals/${id}`);
        return response.data;
    },

    getGoalsSummary: async () => {
        const response = await axios.get(`${BASE_URL}/api/summary/goals`);
        return response.data;
    },

    calculateGoalProgress: (currentAmount, targetAmount) => {
        return Math.round((currentAmount / targetAmount) * 100);
    },

    getGoalStatus: (goal) => {
        if (goal.status === "completed") return "Completed";

        const progress = API.calculateGoalProgress(goal.currentAmount, goal.targetAmount);
        const today = new Date();
        const targetDate = new Date(goal.targetDate);
        const daysRemaining = Math.ceil((targetDate - today) / (1000 * 60 * 60 * 24));
        const monthsRemaining = daysRemaining / 30;
        const amountRemaining = goal.targetAmount - goal.currentAmount;
        const requiredMonthlyContribution = monthsRemaining > 0 ? amountRemaining / monthsRemaining : amountRemaining;

        return goal.monthlyContribution >= requiredMonthlyContribution ? "On Track" : "At Risk";
    },

    getTransactions: async () => {
        const response = await axios.get(`${BASE_URL}/api/transactions`);
        return response.data;
    },

    addTransaction: async (transactionData) => {
        const response = await axios.post(`${BASE_URL}/api/transactions`, transactionData);
        return response.data;
    },

    updateTransaction: async (id, transactionData) => {
        const response = await axios.put(`${BASE_URL}/api/transactions/${id}`, transactionData);
        return response.data;
    },

    deleteTransaction: async (id) => {
        const response = await axios.delete(`${BASE_URL}/api/transactions/${id}`);
        return response.data;
    },

    getTransactionsSummary: async (month, year) => {
        const params = {};
        if (month !== undefined) params.month = month;
        if (year !== undefined) params.year = year;

        const response = await axios.get(`${BASE_URL}/api/summary/transactions`, { params });
        return response.data;
    },

    getCategories: async () => {
        const response = await axios.get(`${BASE_URL}/api/categories`);
        return response.data;
    },

    calculateTotalSavings: async () => {
        const response = await axios.get(`${BASE_URL}/api/calculations/total-savings`);
        return response.data.totalSavings;
    },

    calculateMonthlyIncome: async (month, year) => {
        const params = {};
        if (month !== undefined) params.month = month;
        if (year !== undefined) params.year = year;

        const response = await axios.get(`${BASE_URL}/api/calculations/monthly-income`, { params });
        return response.data.monthlyIncome;
    },

    calculateMonthlyExpenses: async (month, year) => {
        const params = {};
        if (month !== undefined) params.month = month;
        if (year !== undefined) params.year = year;

        const response = await axios.get(`${BASE_URL}/api/calculations/monthly-expenses`, { params });
        return response.data.monthlyExpenses;
    },

    calculateAvailableToSave: async (month, year) => {
        let incomePromise = API.calculateMonthlyIncome(month, year);
        let expensesPromise = API.calculateMonthlyExpenses(month, year);

        const income = await incomePromise;
        const expenses = await expensesPromise;

        return income - expenses;
    },
};