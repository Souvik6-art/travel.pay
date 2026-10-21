const userId = localStorage.getItem("userId");
const tripId = localStorage.getItem("tripId");

// ============================================================
// CHECK LOGIN AND TRIP
// ============================================================

if (!userId) {
    window.location.href = "login.html";
} else if (!tripId) {
    window.location.href = "trips.html";
}

// ============================================================
// ADD EXPENSE ELEMENTS
// ============================================================

const expenseForm = document.getElementById("expenseForm");
const expenseMessage = document.getElementById("expenseMessage");
const expenseCategory = document.getElementById("expenseCategory");
const customCategoryContainer = document.getElementById("customCategoryContainer");
const customCategory = document.getElementById("customCategory");

const expenseContributor = document.getElementById("expenseContributor");
const editExpenseContributor = document.getElementById("editExpenseContributor");

let tripCompanions = [];

// ============================================================
// LOAD CONTRIBUTORS
// ============================================================

async function loadContributors() {
    try {
        const response = await fetch(
            `/api/trip-companions/trip/${tripId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load trip contributors.");
        }

        const companions = await response.json();

        // Only companions marked as contributors are eligible.
        tripCompanions = companions.filter(
            companion => companion.contributor === true
        );

        // Populate both Add and Edit dropdowns.
        [expenseContributor, editExpenseContributor].forEach(select => {
            if (!select) {
                throw new Error(
                    "Contributor dropdown missing in expenses.html."
                );
            }

            select.innerHTML = "";

            const ownerOption = document.createElement("option");
            ownerOption.value = "owner";
            ownerOption.textContent = "Trip owner";
            select.appendChild(ownerOption);

            tripCompanions.forEach(companion => {
                const option = document.createElement("option");

                option.value = String(companion.id);
                option.textContent = companion.name;

                select.appendChild(option);
            });
        });

    } catch (error) {
        console.error("Contributor loading error:", error);

        if (expenseMessage) {
            expenseMessage.textContent =
                "Unable to load contributors. Please refresh the page.";
        }
    }
}

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

    const title = document.getElementById("expenseTitle").value.trim();

    let category = expenseCategory.value;

    // Handle custom category.
    if (category === "Custom") {
        category = customCategory.value.trim();

        if (!category) {
            expenseMessage.textContent =
                "Please enter a custom category.";
            customCategory.focus();
            return;
        }
    }

    const amount = Number(
        document.getElementById("expenseAmount").value
    );

    if (!title) {
        expenseMessage.textContent = "Please enter an expense title.";
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        expenseMessage.textContent =
            "Expense amount must be greater than zero.";
        return;
    }

    if (!expenseContributor || !expenseContributor.value) {
        expenseMessage.textContent =
            "Please select who paid for this expense.";
        return;
    }

    const contributorCompanionId =
        expenseContributor.value === "owner"
            ? null
            : Number(expenseContributor.value);

    // Prevent submitting an invalid companion selection.
    if (
        contributorCompanionId !== null &&
        !tripCompanions.some(
            companion =>
                Number(companion.id) === contributorCompanionId
        )
    ) {
        expenseMessage.textContent =
            "Please select a valid trip contributor.";
        return;
    }

    try {
        expenseMessage.textContent = "Adding expense...";

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
                    amount: amount,
                    contributorCompanionId: contributorCompanionId
                })
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || data.error || "Unable to add expense."
            );
        }

        expenseMessage.textContent =
            `₹${amount.toFixed(2)} expense added successfully!`;

        // Reset the form.
        expenseForm.reset();

        customCategoryContainer.style.display = "none";
        customCategory.required = false;
        customCategory.value = "";

        // Restore the default payer.
        expenseContributor.value = "owner";

        await loadExpenses();

    } catch (error) {
        console.error("Expense error:", error);
        expenseMessage.textContent = error.message;
    }
});

// ============================================================
// GET CONTRIBUTOR NAME
// ============================================================

function getContributorName(expense) {
    if (expense.contributorCompanionId == null) {
        return "Trip owner";
    }

    const companion = tripCompanions.find(
        item =>
            Number(item.id) ===
            Number(expense.contributorCompanionId)
    );

    return companion ? companion.name : "Unknown contributor";
}

// ============================================================
// LOAD EXPENSES
// ============================================================

async function loadExpenses() {
    const expenseList = document.getElementById("expenseList");

    try {
        const response = await fetch(
            `/api/expenses/user/${userId}/trip/${tripId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load trip expenses.");
        }

        const expenses = await response.json();

        if (!Array.isArray(expenses)) {
            throw new Error("Unexpected expense data received.");
        }

        if (expenses.length === 0) {
            expenseList.innerHTML =
                "<p>No expenses recorded for this trip yet.</p>";
            return;
        }

        expenseList.innerHTML = "";

        expenses.forEach(expense => {
            const expenseItem = document.createElement("div");
            expenseItem.className = "expense-item";

            const expenseInfo = document.createElement("div");
            expenseInfo.className = "expense-info";

            const title = document.createElement("h3");
            title.textContent = expense.title || "";

            const category = document.createElement("p");
            category.textContent = expense.category || "";

            const contributor = document.createElement("p");
            contributor.textContent =
                `Paid by: ${getContributorName(expense)}`;

            const date = document.createElement("small");
            date.textContent = expense.expenseDate
                ? new Date(expense.expenseDate).toLocaleString()
                : "";

            expenseInfo.append(title, category, contributor, date);

            const expenseAmount = document.createElement("div");
            expenseAmount.className = "expense-amount";

            const amount = document.createElement("strong");
            amount.textContent =
                `₹${Number(expense.amount).toFixed(2)}`;

            expenseAmount.appendChild(amount);

            const expenseActions = document.createElement("div");
            expenseActions.className = "expense-actions";

            const editButton = document.createElement("button");
            editButton.type = "button";
            editButton.textContent = "Edit";
            editButton.addEventListener("click", function () {
                editExpense(expense.id);
            });

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";
            deleteButton.addEventListener("click", function () {
                deleteExpense(expense.id);
            });

            expenseActions.append(editButton, deleteButton);

            expenseItem.append(
                expenseInfo,
                expenseAmount,
                expenseActions
            );

            expenseList.appendChild(expenseItem);
        });

    } catch (error) {
        console.error("Expense loading error:", error);

        expenseList.textContent = error.message;
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
        editCustomCategoryContainer.style.display = "block";
        editCustomCategory.disabled = false;
        editCustomCategory.readOnly = false;
        editCustomCategory.required = true;
        editCustomCategory.focus();
    } else {
        editCustomCategoryContainer.style.display = "none";
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
            throw new Error("Unable to load expense.");
        }

        const expenses = await response.json();

        const expense = expenses.find(
            item => Number(item.id) === Number(expenseId)
        );

        if (!expense) {
            throw new Error("Expense not found.");
        }

        editingExpenseId = expenseId;

        // Fill title.
        document.getElementById("editExpenseTitle").value =
            expense.title || "";

        // Predefined categories.
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

        if (predefinedCategories.includes(expense.category)) {
            editExpenseCategory.value = expense.category;

            editCustomCategoryContainer.style.display = "none";
            editCustomCategory.required = false;
            editCustomCategory.value = "";
        } else {
            // Existing category is custom.
            editExpenseCategory.value = "Custom";

            editCustomCategoryContainer.style.display = "block";
            editCustomCategory.disabled = false;
            editCustomCategory.readOnly = false;
            editCustomCategory.required = true;
            editCustomCategory.value = expense.category || "";
        }

        // Fill amount.
        document.getElementById("editExpenseAmount").value =
            expense.amount;

        // Restore the saved contributor.
        editExpenseContributor.value =
            expense.contributorCompanionId == null
                ? "owner"
                : String(expense.contributorCompanionId);

        // If the saved contributor is no longer eligible,
        // fall back to the trip owner.
        if (editExpenseContributor.selectedIndex === -1) {
            editExpenseContributor.value = "owner";
        }

        document.getElementById("editExpenseMessage").textContent = "";

        // Show edit section.
        const editSection =
            document.getElementById("editExpenseSection");

        editSection.style.display = "block";
        editSection.scrollIntoView({
            behavior: "smooth"
        });

    } catch (error) {
        console.error("Edit expense error:", error);
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

editExpenseForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    if (editingExpenseId == null) {
        return;
    }

    const title = document.getElementById("editExpenseTitle").value.trim();

    let category = editExpenseCategory.value;

    // Handle custom category.
    if (category === "Custom") {
        category = editCustomCategory.value.trim();

        if (!category) {
            document.getElementById("editExpenseMessage").textContent =
                "Please enter a custom category.";

            editCustomCategory.focus();
            return;
        }
    }

    const amount = Number(
        document.getElementById("editExpenseAmount").value
    );

    const editExpenseMessage =
        document.getElementById("editExpenseMessage");

    if (!title) {
        editExpenseMessage.textContent =
            "Please enter an expense title.";
        return;
    }

    if (!Number.isFinite(amount) || amount <= 0) {
        editExpenseMessage.textContent =
            "Expense amount must be greater than zero.";
        return;
    }

    if (!editExpenseContributor || !editExpenseContributor.value) {
        editExpenseMessage.textContent =
            "Please select who paid for this expense.";
        return;
    }

    const contributorCompanionId =
        editExpenseContributor.value === "owner"
            ? null
            : Number(editExpenseContributor.value);

    if (
        contributorCompanionId !== null &&
        !tripCompanions.some(
            companion =>
                Number(companion.id) === contributorCompanionId
        )
    ) {
        editExpenseMessage.textContent =
            "Please select a valid trip contributor.";
        return;
    }

    try {
        editExpenseMessage.textContent = "Updating expense...";

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
                    amount: amount,
                    contributorCompanionId: contributorCompanionId
                })
            }
        );

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(
                data.message || data.error || "Unable to update expense."
            );
        }

        editExpenseMessage.textContent =
            "Expense updated successfully!";

        editingExpenseId = null;

        // Hide edit form after showing the success message.
        setTimeout(function () {
            document.getElementById("editExpenseSection").style.display =
                "none";
        }, 800);

        await loadExpenses();

    } catch (error) {
        console.error("Update expense error:", error);
        editExpenseMessage.textContent = error.message;
    }
});

// ============================================================
// CANCEL EDIT
// ============================================================

cancelEditBtn.addEventListener("click", function () {
    editingExpenseId = null;

    editExpenseForm.reset();

    editCustomCategoryContainer.style.display = "none";
    editCustomCategory.required = false;
    editCustomCategory.value = "";

    editExpenseContributor.value = "owner";

    document.getElementById("editExpenseMessage").textContent = "";

    document.getElementById("editExpenseSection").style.display = "none";
});

// ============================================================
// DELETE EXPENSE
// ============================================================

async function deleteExpense(expenseId) {
    const confirmed = confirm(
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
            const data = await response.json().catch(() => ({}));

            throw new Error(
                data.message || data.error || "Unable to delete expense."
            );
        }

        alert("Expense deleted successfully!");

        await loadExpenses();

    } catch (error) {
        console.error("Delete expense error:", error);
        alert(error.message);
    }
}

// ============================================================
// INITIAL LOAD
// ============================================================

async function initializeExpenses() {
    await loadContributors();
    await loadExpenses();
}

initializeExpenses();