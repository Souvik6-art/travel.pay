const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


async function loadDashboard() {

    try {

        const response = await fetch(`/api/dashboard/${userId}`);

        if (!response.ok) {
            throw new Error("Unable to load dashboard");
        }

        const data = await response.json();

        console.log("Dashboard data:", data);


        document.getElementById("walletBalance").textContent =
            `₹${data.walletBalance.toFixed(2)}`;

        document.getElementById("totalBudget").textContent =
            `₹${data.totalBudget.toFixed(2)}`;

        document.getElementById("totalSpent").textContent =
            `₹${data.totalSpent.toFixed(2)}`;

        document.getElementById("remainingBudget").textContent =
            `₹${data.remainingBudget.toFixed(2)}`;

        document.getElementById("totalDeposits").textContent =
            `₹${data.totalDeposits.toFixed(2)}`;

        document.getElementById("totalExpenses").textContent =
            `₹${data.totalExpenses.toFixed(2)}`;


        const userName = localStorage.getItem("userName");

        if (userName) {
            document.getElementById("userName").textContent = userName;
        }


    } catch (error) {

        console.error("Dashboard error:", error);

    }
}


loadDashboard();

const depositForm = document.getElementById("depositForm");
const depositMessage = document.getElementById("depositMessage");

/// temporarily adding
console.log("DEPOSIT FORM:", depositForm);
console.log("DEPOSIT MESSAGE:", depositMessage);


if (depositForm) {

    depositForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const amount = Number(
            document.getElementById("depositAmount").value
        );

        if (amount <= 0) {
            depositMessage.textContent =
                "Please enter a valid amount.";
            return;
        }

        try {

            depositMessage.textContent = "Adding money...";

            // Get the user's wallet
            const walletResponse = await fetch(
                `/api/wallets/user/${userId}`
            );

            if (!walletResponse.ok) {
                throw new Error("Wallet not found");
            }

            const wallet = await walletResponse.json();

            // Deposit money
            const depositResponse = await fetch(
                `/api/wallets/${wallet.id}/deposit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        amount: amount
                    })
                }
            );

            const data = await depositResponse.json();

            if (!depositResponse.ok) {
                throw new Error(
                    data.message || "Deposit failed"
                );
            }

            depositMessage.textContent =
                `₹${amount.toFixed(2)} added successfully!`;

            depositForm.reset();

            // Refresh dashboard values
            loadDashboard();

        } catch (error) {

            console.error("Deposit error:", error);

            depositMessage.textContent =
                error.message;

        }

    });

}