
const userId = localStorage.getItem("userId");
const tripId = localStorage.getItem("tripId");





if (!userId) {
    window.location.href = "login.html";
}

if (!tripId) {
    window.location.href = "trips.html";
}


const expenseForm = document.getElementById("expenseForm");
const expenseMessage = document.getElementById("expenseMessage");


expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title =
        document.getElementById("expenseTitle").value;

    const category =
        document.getElementById("expenseCategory").value;

    const amount = Number(
        document.getElementById("expenseAmount").value
    );


    if (amount <= 0) {

        expenseMessage.textContent =
            "Expense amount must be greater than zero.";

        return;
    }


    try {

        expenseMessage.textContent =
            "Adding expense...";


        const response = await fetch(
            `/api/expenses/${userId}/${tripId}`,
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    category: category,
                    amount: amount
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Unable to add expense"
            );
        }


        expenseMessage.textContent =
            `₹${amount.toFixed(2)} expense added successfully!`;


        expenseForm.reset();

        // Refresh the expense list
        loadExpenses();


    } catch (error) {

        console.error("Expense error:", error);

        expenseMessage.textContent =
            error.message;

    }

});


async function loadExpenses() {

    const expenseList =
        document.getElementById("expenseList");

    try {

        const response = await fetch(
            `/api/expenses/user/${userId}/trip/${tripId}`
        );

        if (!response.ok) {

            throw new Error(
                "Unable to load trip expenses"
            );
        }

        const expenses = await response.json();

        console.log(
            "Trip Expenses:",
            expenses
        );


        if (expenses.length === 0) {

            expenseList.innerHTML =
                "<p>No expenses recorded for this trip yet.</p>";

            return;
        }


        expenseList.innerHTML = "";


        expenses.forEach(function (expense) {

            const expenseItem =
                document.createElement("div");

            expenseItem.className =
                "expense-item";


            expenseItem.innerHTML = `
                <div class="expense-info">

                    <h3>
                        ${expense.title}
                    </h3>

                    <p>
                        ${expense.category}
                    </p>

                    <small>
                        ${new Date(
                            expense.expenseDate
                        ).toLocaleString()}
                    </small>

                </div>

                <div class="expense-amount">

                    <strong>
                        ₹${Number(
                            expense.amount
                        ).toFixed(2)}
                    </strong>

                </div>

                <div class="expense-actions">

                    <button
                        onclick="editExpense(${expense.id})">
                        Edit
                    </button>

                    <button
                        onclick="deleteExpense(${expense.id})">
                        Delete
                    </button>

                </div>
            `;


            expenseList.appendChild(
                expenseItem
            );

        });

    } catch (error) {

        console.error(
            "Expense loading error:",
            error
        );

        expenseList.innerHTML =
            `<p>${error.message}</p>`;
    }
}

let editingExpenseId = null;

async function editExpense(expenseId) {

    try {

        const response = await fetch(
            `/api/expenses/user/${userId}/trip/${tripId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load expense");
        }

        const expenses = await response.json();

        const expense = expenses.find(function (item) {
            return item.id === expenseId;
        });

        if (!expense) {
            throw new Error("Expense not found");
        }

        // Store the expense ID
        editingExpenseId = expenseId;

        // Fill the edit form
        document.getElementById("editExpenseTitle").value =
            expense.title;

        document.getElementById("editExpenseCategory").value =
            expense.category;

        document.getElementById("editExpenseAmount").value =
            expense.amount;

        // Show edit section
        document.getElementById("editExpenseSection").style.display =
            "block";

        // Scroll to edit form
        document.getElementById("editExpenseSection").scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {

        console.error(
            "Edit expense error:",
            error
        );

        alert(error.message);
    }
}

//********************************************************


const editExpenseForm =
    document.getElementById("editExpenseForm");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");

editExpenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    if (!editingExpenseId) {
        return;
    }

    const title =
        document.getElementById("editExpenseTitle").value;

    const category =
        document.getElementById("editExpenseCategory").value;

    const amount =
        Number(
            document.getElementById("editExpenseAmount").value
        );

    const editExpenseMessage =
        document.getElementById("editExpenseMessage");

    if (amount <= 0) {

        editExpenseMessage.textContent =
            "Expense amount must be greater than zero.";

        return;
    }

    try {

        editExpenseMessage.textContent =
            "Updating expense...";

        const response = await fetch(
            `/api/expenses/${userId}/${tripId}/${editingExpenseId}`,
            {
                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    title: title,
                    category: category,
                    amount: amount
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {

            throw new Error(
                data.message || "Unable to update expense"
            );
        }

        editExpenseMessage.textContent =
            "Expense updated successfully!";

        // Hide form after successful update
        setTimeout(function () {

            document.getElementById(
                "editExpenseSection"
            ).style.display = "none";

        }, 800);

        editingExpenseId = null;

        // Refresh expense list
        loadExpenses();

    } catch (error) {

        console.error(
            "Update expense error:",
            error
        );

        editExpenseMessage.textContent =
            error.message;
    }
});

//*********
cancelEditBtn.addEventListener("click", function () {

    editingExpenseId = null;

    editExpenseForm.reset();

    document.getElementById(
        "editExpenseSection"
    ).style.display = "none";

});



//*******************************************************************
async function deleteExpense(expenseId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this expense?"
        );


    if (!confirmed) {
        return;
    }


    try {

        const response = await fetch(
            `/api/expenses/${userId}/${tripId}/${expenseId}`,
            {
                method: "DELETE"
            }
        );


        if (!response.ok) {

            throw new Error(
                "Unable to delete expense"
            );
        }


        alert("Expense deleted successfully!");

        loadExpenses();


    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );

        alert(error.message);
    }
}


loadExpenses();

