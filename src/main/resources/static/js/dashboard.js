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