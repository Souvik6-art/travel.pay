
const userId = localStorage.getItem("userId");
const tripId = localStorage.getItem("tripId");

console.log("NEW BUDGET.JS LOADED");

if (!userId) {
    window.location.href = "login.html";
}

if (!tripId) {
    window.location.href = "trips.html";
}

const budgetForm = document.getElementById("budgetForm");
const budgetMessage = document.getElementById("budgetMessage");

const budgetAmount = document.getElementById("budgetAmount");
const budgetSpent = document.getElementById("budgetSpent");
const budgetRemaining = document.getElementById("budgetRemaining");

let budgetExists = false;


// Load budget summary
async function loadBudget() {
    try {
        const response = await fetch(
            `/api/budgets/user/${userId}/trip/${tripId}/summary`
        );

        if (!response.ok) {
            // A new trip may not have a budget yet.
            // Check whether the budget itself exists.
            const budgetResponse = await fetch(
                `/api/budgets/user/${userId}/trip/${tripId}`
            );

            if (budgetResponse.status === 404) {
                budgetExists = false;
                showNoBudget();
                return;
            }

            if (!budgetResponse.ok) {
                // Your controller may return 500 for
                // RuntimeException("Budget not found").
                const errorText = await budgetResponse.text();

                if (errorText.includes("Budget not found")) {
                    budgetExists = false;
                    showNoBudget();
                    return;
                }

                throw new Error("Unable to load trip budget.");
            }

            // The budget exists, but the summary failed.
            throw new Error("Unable to load budget summary.");
        }

        const data = await response.json();

        budgetExists = true;

        budgetAmount.textContent =
            `₹${Number(data.totalBudget).toFixed(2)}`;

        budgetSpent.textContent =
            `₹${Number(data.totalSpent).toFixed(2)}`;

        budgetRemaining.textContent =
            `₹${Number(data.remainingBudget).toFixed(2)}`;

        console.log("Trip budget data:", data);

    } catch (error) {
        console.error("Budget loading error:", error);

        budgetMessage.textContent =
            "Unable to load the budget. Please refresh the page.";
    }
}


// Display default values when no budget exists
function showNoBudget() {
    budgetAmount.textContent = "₹0.00";
    budgetSpent.textContent = "₹0.00";
    budgetRemaining.textContent = "₹0.00";
}


// Create or update budget
budgetForm.addEventListener("submit", async function (event) {
    event.preventDefault();

    const amount = Number(
        document.getElementById("budgetAmountInput").value
    );

    if (!Number.isFinite(amount) || amount <= 0) {
        budgetMessage.textContent =
            "Budget amount must be greater than zero.";
        return;
    }

    try {
        budgetMessage.textContent = "Saving trip budget...";

        // POST creates a new budget; PUT updates an existing one.
        const method = budgetExists ? "PUT" : "POST";

        const response = await fetch(
            `/api/budgets/${userId}/${tripId}`,
            {
                method: method,
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    amount: amount
                })
            }
        );

        const responseText = await response.text();

        let data = {};

        try {
            data = responseText ? JSON.parse(responseText) : {};
        } catch {
            data = {};
        }

        if (!response.ok) {
            throw new Error(
                data.message ||
                data.error ||
                `Unable to save trip budget (HTTP ${response.status}).`
            );
        }

        budgetExists = true;

        budgetMessage.textContent =
            `Trip budget ${method === "POST" ? "created" : "updated"} successfully!`;

        budgetForm.reset();

        await loadBudget();

    } catch (error) {
        console.error("Budget saving error:", error);
        budgetMessage.textContent = error.message;
    }
});


// Initial load
loadBudget();
