const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


const budgetForm = document.getElementById("budgetForm");
const budgetMessage = document.getElementById("budgetMessage");


async function loadBudget() {

    try {

        const response = await fetch(
            `/api/budgets/user/${userId}/summary`
        );

        if (!response.ok) {
            throw new Error("Unable to load budget");
        }

        const data = await response.json();

        console.log("Budget data:", data);

        document.getElementById("budgetAmount").textContent =
            `₹${Number(data.totalBudget).toFixed(2)}`;

        document.getElementById("budgetSpent").textContent =
            `₹${Number(data.totalSpent).toFixed(2)}`;

        document.getElementById("budgetRemaining").textContent =
            `₹${Number(data.remainingBudget).toFixed(2)}`;

    } catch (error) {

        console.error("Budget error:", error);

    }
}


budgetForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const amount = Number(
        document.getElementById("budgetAmountInput").value
    );


    if (amount <= 0) {

        budgetMessage.textContent =
            "Budget amount must be greater than zero.";

        return;
    }


    try {

        budgetMessage.textContent =
            "Setting budget...";


        const response = await fetch(
            `/api/budgets/${userId}`,
            {
              method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    amount: amount
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Unable to set budget"
            );
        }


        budgetMessage.textContent =
            `Budget updated to ₹${amount.toFixed(2)} successfully!`;

        budgetForm.reset();

        loadBudget();


    } catch (error) {

        console.error("Budget error:", error);

        budgetMessage.textContent =
            error.message;

    }

});


loadBudget();