const userId = localStorage.getItem("userId");
const tripId = localStorage.getItem("tripId");


// ============================================================
// CHECK LOGIN AND TRIP
// ============================================================

if (!userId) {
    window.location.href = "login.html";
}

if (!tripId) {
    window.location.href = "trips.html";
}


// ============================================================
// ADD EXPENSE ELEMENTS
// ============================================================

const expenseForm =
    document.getElementById("expenseForm");

const expenseMessage =
    document.getElementById("expenseMessage");

const expenseCategory =
    document.getElementById("expenseCategory");

const customCategoryContainer =
    document.getElementById("customCategoryContainer");

const customCategory =
    document.getElementById("customCategory");


// ============================================================
// SHOW / HIDE CUSTOM CATEGORY
// ============================================================

expenseCategory.addEventListener("change", function () {

    if (this.value === "Custom") {

        customCategoryContainer.style.display = "block";

        customCategory.disabled = false;
        customCategory.readOnly = false;
        customCategory.required = true;

        customCategory.focus();

    } else {

        customCategoryContainer.style.display = "none";

        customCategory.disabled = false;
        customCategory.readOnly = false;
        customCategory.required = false;

        customCategory.value = "";
    }

});


// ============================================================
// ADD EXPENSE
// ============================================================

expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const title =
        document.getElementById("expenseTitle").value.trim();


    let category =
        expenseCategory.value;


    // If Custom is selected
    if (category === "Custom") {

        category =
            customCategory.value.trim();


        if (!category) {

            expenseMessage.textContent =
                "Please enter a custom category.";

            customCategory.focus();

            return;
        }
    }


    const amount =
        Number(
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


        const data =
            await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Unable to add expense"
            );
        }


        expenseMessage.textContent =
            `₹${amount.toFixed(2)} expense added successfully!`;


        // Reset form
        expenseForm.reset();


        // Hide custom category
        customCategoryContainer.style.display = "none";

        customCategory.required = false;

        customCategory.value = "";


        // Reload expenses
        loadExpenses();


    } catch (error) {

        console.error(
            "Expense error:",
            error
        );


        expenseMessage.textContent =
            error.message;
    }

});


// ============================================================
// LOAD EXPENSES
// ============================================================

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


        const expenses =
            await response.json();


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


            expenseList.appendChild(expenseItem);

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


// ============================================================
// EDIT EXPENSE
// ============================================================

let editingExpenseId = null;


const editExpenseCategory =
    document.getElementById("editExpenseCategory");

const editCustomCategoryContainer =
    document.getElementById("editCustomCategoryContainer");

const editCustomCategory =
    document.getElementById("editCustomCategory");


// ============================================================
// EDIT CATEGORY - CUSTOM
// ============================================================

editExpenseCategory.addEventListener("change", function () {

    if (this.value === "Custom") {

        editCustomCategoryContainer.style.display =
            "block";

        editCustomCategory.disabled = false;
        editCustomCategory.readOnly = false;
        editCustomCategory.required = true;

        editCustomCategory.focus();

    } else {

        editCustomCategoryContainer.style.display =
            "none";

        editCustomCategory.disabled = false;
        editCustomCategory.readOnly = false;
        editCustomCategory.required = false;

        editCustomCategory.value = "";
    }

});


// ============================================================
// OPEN EDIT FORM
// ============================================================

async function editExpense(expenseId) {

    try {

        const response = await fetch(
            `/api/expenses/user/${userId}/trip/${tripId}`
        );


        if (!response.ok) {

            throw new Error(
                "Unable to load expense"
            );
        }


        const expenses =
            await response.json();


        const expense =
            expenses.find(function (item) {

                return item.id === expenseId;

            });


        if (!expense) {

            throw new Error(
                "Expense not found"
            );
        }


        editingExpenseId =
            expenseId;


        // Fill title

        document.getElementById(
            "editExpenseTitle"
        ).value =
            expense.title;


        // Predefined categories

        const predefinedCategories = [

            "Accommodation",
            "Food & Dining",
            "Transport",
            "Flights",
            "Activities & Entertainment",
            "Shopping",
            "Health & Medical",
            "Communication",
            "Travel Essentials",
            "Fees & Charges",
            "Visa & Documents",
            "Gifts",
            "Other"

        ];


        if (
            predefinedCategories.includes(
                expense.category
            )
        ) {

            editExpenseCategory.value =
                expense.category;


            editCustomCategoryContainer.style.display =
                "none";

            editCustomCategory.required =
                false;

            editCustomCategory.value =
                "";


        } else {

            // Existing category is custom

            editExpenseCategory.value =
                "Custom";


            editCustomCategoryContainer.style.display =
                "block";

            editCustomCategory.disabled =
                false;

            editCustomCategory.readOnly =
                false;

            editCustomCategory.required =
                true;

            editCustomCategory.value =
                expense.category;
        }


        // Fill amount

        document.getElementById(
            "editExpenseAmount"
        ).value =
            expense.amount;


        // Show edit section

        document.getElementById(
            "editExpenseSection"
        ).style.display =
            "block";


        // Scroll to edit section

        document.getElementById(
            "editExpenseSection"
        ).scrollIntoView({
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


// ============================================================
// UPDATE EXPENSE
// ============================================================

const editExpenseForm =
    document.getElementById("editExpenseForm");

const cancelEditBtn =
    document.getElementById("cancelEditBtn");


editExpenseForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        if (!editingExpenseId) {
            return;
        }


        const title =
            document.getElementById(
                "editExpenseTitle"
            ).value.trim();


        let category =
            editExpenseCategory.value;


        // Custom category

        if (category === "Custom") {

            category =
                editCustomCategory.value.trim();


            if (!category) {

                document.getElementById(
                    "editExpenseMessage"
                ).textContent =
                    "Please enter a custom category.";

                editCustomCategory.focus();

                return;
            }
        }


        const amount =
            Number(
                document.getElementById(
                    "editExpenseAmount"
                ).value
            );


        const editExpenseMessage =
            document.getElementById(
                "editExpenseMessage"
            );


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


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.message ||
                    "Unable to update expense"
                );
            }


            editExpenseMessage.textContent =
                "Expense updated successfully!";


            editingExpenseId = null;


            // Hide edit form

            setTimeout(function () {

                document.getElementById(
                    "editExpenseSection"
                ).style.display =
                    "none";

            }, 800);


            // Reload expenses

            loadExpenses();


        } catch (error) {

            console.error(
                "Update expense error:",
                error
            );


            editExpenseMessage.textContent =
                error.message;
        }

    }
);


// ============================================================
// CANCEL EDIT
// ============================================================

cancelEditBtn.addEventListener(
    "click",
    function () {

        editingExpenseId = null;


        editExpenseForm.reset();


        editCustomCategoryContainer.style.display =
            "none";

        editCustomCategory.required =
            false;

        editCustomCategory.value =
            "";


        document.getElementById(
            "editExpenseSection"
        ).style.display =
            "none";

    }
);


// ============================================================
// DELETE EXPENSE
// ============================================================

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


        alert(
            "Expense deleted successfully!"
        );


        loadExpenses();


    } catch (error) {

        console.error(
            "Delete expense error:",
            error
        );


        alert(
            error.message
        );
    }

}


// ============================================================
// INITIAL LOAD
// ============================================================

loadExpenses();