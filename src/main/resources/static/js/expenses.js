
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


loadExpenses();
