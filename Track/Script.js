let transactions = [];
let budget = 0;
let expenseChart;

// Selectors
const form = document.getElementById("transaction-form");
const textInput = document.getElementById("text");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const balanceEl = document.getElementById("balance");
const incomeEl = document.getElementById("income");
const expenseEl = document.getElementById("expense");
const transactionsEl = document.getElementById("transactions");
const budgetInput = document.getElementById("budget");
const setBudgetBtn = document.getElementById("set-budget");
const budgetWarning = document.getElementById("budget-warning");

// Add transaction
function addTransaction(e) {
  e.preventDefault();

  const text = textInput.value.trim();
  const amount = parseFloat(amountInput.value.trim());
  const category = categoryInput.value;

  if (text === "" || isNaN(amount)) {
    alert("Please enter valid text and amount");
    return;
  }

  const transaction = {
    id: Date.now(),
    text,
    amount,
    category,
    date: new Date().toLocaleDateString(),
  };

  transactions.push(transaction);
  updateUI();
  textInput.value = "";
  amountInput.value = "";
}

// Update UI
function updateUI() {
  const income = transactions.filter((t) => t.amount > 0).reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions.filter((t) => t.amount < 0).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const balance = income - expense;

  // Update DOM with floating point numbers
  balanceEl.textContent = `₹${balance.toFixed(2)}`;
  incomeEl.textContent = `₹${income.toFixed(2)}`;
  expenseEl.textContent = `₹${expense.toFixed(2)}`;

  transactionsEl.innerHTML = "";
  transactions.forEach(addTransactionToDOM);

  checkBudget(expense);

  // Update the pie chart after every transaction
  renderPieChart(income, expense);
}

// Add transaction to DOM
function addTransactionToDOM(transaction) {
  const li = document.createElement("li");
  li.className = transaction.amount < 0 ? "expense" : "income";
  li.innerHTML = `
    ${transaction.text} 
    <span>${transaction.amount < 0 ? "-" : "+"}₹${Math.abs(transaction.amount).toFixed(2)}</span>
  `;
  transactionsEl.appendChild(li);
}

// Check budget
function checkBudget(totalExpense) {
  // Check if budget is set and the total expense exceeds the budget
  if (budget > 0 && totalExpense > budget) {
    budgetWarning.style.display = "block";
    budgetWarning.textContent = `Warning: Budget Exceeded! Total Expense: ₹${totalExpense.toFixed(2)} > Budget: ₹${budget.toFixed(2)}`;
  } else {
    budgetWarning.style.display = "none";
  }
}

// Render Pie Chart
function renderPieChart(income, expense) {
  const ctx = document.getElementById("expense-chart").getContext("2d");

  if (expenseChart) {
    expenseChart.destroy();
  }

  expenseChart = new Chart(ctx, {
    type: "pie",
    data: {
      labels: ["Income", "Expense"],
      datasets: [
        {
          data: [income, expense],
          backgroundColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
}

// Set budget
function setBudget() {
  const inputBudget = parseFloat(budgetInput.value.trim());
  if (isNaN(inputBudget) || inputBudget < 0) {
    alert("Please enter a valid budget amount.");
    return;
  }
  budget = inputBudget;
  alert(`Budget of ₹${budget.toFixed(2)} set successfully.`);
  budgetInput.value = "";
  updateUI();
}

// Download transactions
document.getElementById("download-btn").addEventListener("click", () => {
  const csvContent = "data:text/csv;charset=utf-8,Text,Amount,Category\n" +
    transactions.map((t) => `${t.text},${t.amount.toFixed(2)},${t.category}`).join("\n");
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.href = encodedUri;
  link.download = "transactions.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
});

// Dark mode
document.getElementById("toggle-dark-mode").addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
});

// Event listeners
form.addEventListener("submit", addTransaction);
setBudgetBtn.addEventListener("click", setBudget);
