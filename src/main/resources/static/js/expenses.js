const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


const expenseForm = document.getElementById("expenseForm");
const expenseMessage = document.getElementById("expenseMessage");


expenseForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const title = document.getElementById("expenseTitle").value;
    const category = document.getElementById("expenseCategory").value;
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
            `/api/expenses/${userId}`,
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


    } catch (error) {

        console.error("Expense error:", error);

        expenseMessage.textContent =
            error.message;

    }

});