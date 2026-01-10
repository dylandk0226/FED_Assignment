# MyFinGoals - Personal Finance Management Application

A simple web application to track financial goals, manage transactions, and monitor savings progress.

**Live Demo:** [https://myfingoals.onrender.com](https://myfingoals.onrender.com)
**Github:** [https://github.com/dylandk0226/FED_Assignment.git](https://github.com/dylandk0226/FED_Assignment.git)
**Figma:** [https://www.figma.com/proto/3CYMjqq3mpMTAt3VlPLVkN/MyFinGoals?node-id=87-4149&t=wJqckKo3dsSm7uNE-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2](https://www.figma.com/proto/3CYMjqq3mpMTAt3VlPLVkN/MyFinGoals?node-id=87-4149&t=wJqckKo3dsSm7uNE-1&scaling=min-zoom&content-scaling=fixed&page-id=0%3A1&starting-point-node-id=1%3A2)

---

## About The Project

MyFinGoals helps users manage their personal finances by:
- Setting and tracking financial goals (savings & budgets)
- Recording income and expenses
- Viewing financial summaries and progress

---

## Design Process

### Target Users
- Individuals who want to track their personal finances
- People setting savings goals or budget limits
- Anyone wanting to monitor their spending habits

### User Stories

**As a user, I want to:**
- View my financial summary on a dashboard, so I can see my current financial status
- Create savings goals, so I can track my progress toward financial targets
- Set budget limits, so I can control my spending in specific categories
- Add transactions easily, so I can keep accurate financial records
- Filter transactions by month, so I can review specific time periods
- Edit my profile information, so my account details stay current
- Change my password, so my account remains secure

---

## Features

### Current Features

1. **Dashboard**
   - Total Savings, Monthly Income, Monthly Expenses, Available to Save
   - Recent goals with progress bars
   - Recent transactions list

2. **Goals Management**
   - Create income goals (savings) or expense goals (budgets)
   - Track real-time progress based on transactions
   - Mark goals as complete
   - Edit or delete goals

3. **Transactions**
   - Add income or expense transactions
   - Edit or delete transactions
   - Filter by month/year
   - View transaction summary

4. **Profile Management**
   - Update personal information (name, email, phone)
   - Change password securely

### Features To Add
- Login credentials
- Export transactions to CSV/Excel
- Charts and graphs for spending trends
- Recurring transactions
- Email notifications for budget alerts

---

## Technologies Used

### Frontend
- **HTML5** - Structure and content
- **[Tailwind CSS](https://tailwindcss.com/)** - Styling and responsive design
- **JavaScript (ES6+)** - Interactivity and logic
- **[Axios](https://axios-http.com/)** - HTTP requests to backend

### Backend
- **[Node.js](https://nodejs.org/)** - JavaScript runtime
- **[Express.js](https://expressjs.com/)** - Web server and API routing

### Deployment
- **[Render](https://render.com/)** - Cloud hosting platform

---

## API Endpoints

### Base URL
- Local: `http://localhost:3000/api`
- Production: `https://testing-mtjx.onrender.com/api`

### User Management
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/user` | Get user profile |
| PUT | `/api/user` | Update profile |
| PUT | `/api/user/password` | Change password |

### Goals
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/goals` | Get all goals |
| GET | `/api/goals/:id` | Get specific goal |
| GET | `/api/goals/status/active` | Get active goals |
| GET | `/api/goals/status/completed` | Get completed goals |
| POST | `/api/goals` | Create new goal |
| PUT | `/api/goals/:id` | Update goal |
| DELETE | `/api/goals/:id` | Delete goal |

### Transactions
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/transactions` | Get all transactions |
| POST | `/api/transactions` | Create transaction |
| PUT | `/api/transactions/:id` | Update transaction |
| DELETE | `/api/transactions/:id` | Delete transaction |

### Calculations & Summary
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/summary/goals` | Get goals summary (total saved, active, completed) |
| GET | `/api/summary/transactions?month=X&year=Y` | Get transaction summary for period |
| GET | `/api/calculations/total-savings` | Calculate total savings |
| GET | `/api/calculations/monthly-income?month=X&year=Y` | Calculate monthly income |
| GET | `/api/calculations/monthly-expenses?month=X&year=Y` | Calculate monthly expenses |
| GET | `/api/categories` | Get all categories (from goal names) |

---

## Testing

## Testing Summary

All features of MyFinGoals were tested manually to ensure they work correctly. Here's what was tested:

---

### Test 1. Dashboard Testing
Opening the dashboard and checking if all statistics display correctly.

**Result:** ✓ **PASS** - The dashboard successfully loads and shows:
- Total Savings amount
- Monthly Income amount
- Monthly Expenses amount
- Available to Save amount
- Recent goals with progress bars
- Recent transactions list

Everything displays correctly with the right numbers.

---

### Test 2. Goals - Create New Goal
Clicking "Add New Goal" button, filling in the form (name, target amount, date, type), and submitting.

**Result:** ✓ **PASS** - New goals are created successfully. After clicking "Create Goal," the new goal appears in the Active goals list with $0 starting progress.

---

### Test 3. Goals - Edit Goal
Clicking "Edit" on an existing goal, changing the details (like target amount or date), and saving.

**Result:** ✓ **PASS** - Goals can be edited successfully. Changes are saved and the goal updates immediately with the new information.

---

### Test 4. Goals - Delete Goal
Clicking "Delete" on a goal and confirming the deletion.

**Result:** ✓ **PASS** - Goals can be deleted successfully. After confirmation, the goal is removed from the list completely.

---

### Test 5. Transactions - Add Transaction
Clicking "Add Transaction" button, filling in transaction details (type, description, amount, category, date, payment method), and submitting.

**Result:** ✓ **PASS** - New transactions are added successfully. The transaction appears in the list immediately and the goal progress updates automatically.

---

### Test 6. Transactions - Edit Transaction
Clicking the ⋮ menu on a transaction, selecting "Edit," modifying the details (amount, description, etc.), and saving.

**Result:** ✓ **PASS** - Transactions can be edited successfully. Changes are saved and reflected immediately in the transaction list.

---

### Test 7. Transactions - Delete Transaction
Clicking the ⋮ menu on a transaction, selecting "Delete," and confirming the deletion.

**Result:** ✓ **PASS** - Transactions can be deleted successfully. After confirmation, the transaction is removed from the list and goal progress updates accordingly.

---

### Test 8. Transactions - Filter by Month
Selecting a specific month and year from the dropdown filters and clicking "Filter" button.

**Result:** ✓ **PASS** - Filtering works correctly. Only transactions from the selected month are displayed, and the summary (total income, expenses, net savings) calculates correctly for that specific period.

---

### Test 9. Profile - Update Information
Going to Profile page, changing personal information (name, email, or phone number), and clicking "Save Changes."

**Result:** ✓ **PASS** - Profile information updates successfully. After saving, a success message appears and the new information is stored. The changes remain even after refreshing the page.

---

### Test 10. Profile - Change Password
Entering current password, new password, and confirming new password, then clicking "Change Password."

**Result:** ✓ **PASS** - Password changes successfully. The system verifies the current password is correct, checks that the new password meets requirements (at least 6 characters), and saves the new password. A success message is displayed.

### Browser Compatibility

- Chrome
- Safari
- Microsoft Edge

### Responsive Testing

- Mobile Supported
- Tablet Supported
- Desktop Supported

---

### Technologies
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Axios](https://axios-http.com/) - HTTP client
- [Express.js](https://expressjs.com/) - Backend framework
- [Node.js](https://nodejs.org/) - JavaScript runtime

### Deployment
- [Render](https://render.com/) - Cloud hosting platform

### Fonts
- [Google Fonts - Inter](https://fonts.google.com/specimen/Inter) - Typography

### SVG Icons
- [Lucide](https://lucide.dev/icons/)
- [Tabler](https://tabler.io/icons)
