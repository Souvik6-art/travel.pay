const userId = localStorage.getItem("userId");
const tripId = localStorage.getItem("tripId");

if (!userId) {
    window.location.href = "login.html";
}

if (!tripId) {
    window.location.href = "trips.html";
}


async function loadSummary() {

    try {

        const response = await fetch(
            `/api/reports/user/${userId}/trip/${tripId}/summary`
        );

        if (!response.ok) {
            throw new Error("Unable to load trip summary");
        }

        const data = await response.json();

        console.log("Trip Report summary:", data);

        document.getElementById("reportBudget").textContent =
            `₹${Number(data.totalBudget).toFixed(2)}`;

        document.getElementById("reportExpenses").textContent =
            `₹${Number(data.totalSpent).toFixed(2)}`;

        document.getElementById("reportRemaining").textContent =
            `₹${Number(data.remainingBudget).toFixed(2)}`;


        // Load global wallet balance
        const walletResponse = await fetch(
            `/api/wallets/user/${userId}`
        );

        if (!walletResponse.ok) {
            throw new Error("Unable to load wallet balance");
        }

        const wallet = await walletResponse.json();

        document.getElementById("reportBalance").textContent =
            `₹${Number(wallet.balance).toFixed(2)}`;

    } catch (error) {

        console.error("Summary error:", error);

    }
}

async function loadCategoryReport() {

    const categoryReport =
        document.getElementById("categoryReport");

    try {

        const response = await fetch(
            `/api/reports/user/${userId}/trip/${tripId}/category`
        );

        if (!response.ok) {
            throw new Error("Unable to load category report");
        }

        const data = await response.json();

        console.log("Category report:", data);

        // Data for chart
        const categories = Object.keys(data);
        const amounts = Object.values(data);

        const chartCanvas =
            document.getElementById("categoryChart");

        new Chart(chartCanvas, {
            type: "doughnut",

            data: {
                labels: categories,

                datasets: [{
                    label: "Spending",
                    data: amounts
                }]
            },

            options: {
                responsive: true,

                plugins: {
                    legend: {
                        position: "bottom"
                    }
                }
            }
        });

        // Data for report cards
        categoryReport.innerHTML = "";

        const categoryEntries = Object.entries(data);

        if (categoryEntries.length === 0) {

            categoryReport.innerHTML =
                "<p>No expense data available.</p>";

            return;
        }

        categoryEntries.forEach(function ([category, amount]) {

            const item =
                document.createElement("div");

            item.className =
                "report-item";

            item.innerHTML = `
                <div>
                    <h3>${category}</h3>
                </div>

                <strong>
                    ₹${Number(amount).toFixed(2)}
                </strong>
            `;

            categoryReport.appendChild(item);

        });

    } catch (error) {

        console.error(
            "Category report error:",
            error
        );

        categoryReport.innerHTML =
            `<p>${error.message}</p>`;
    }
}

async function loadMonthlyReport() {

    const monthlyReport =
        document.getElementById("monthlyReport");

    try {

       const response = await fetch(
           `/api/reports/user/${userId}/trip/${tripId}/monthly`
       );

        if (!response.ok) {
            throw new Error("Unable to load monthly report");
        }

        const data = await response.json();

        console.log("Monthly report:", data);


        //adding recetly
        const monthNumbers = Object.keys(data);
        const amounts = Object.values(data);

        const monthNames = monthNumbers.map(function (month) {

            const date = new Date(2026, Number(month) - 1);

            return date.toLocaleString("en-US", {
                month: "long"
            });

        });

        const chartCanvas =
            document.getElementById("monthlyChart");

        new Chart(chartCanvas, {

            type: "bar",

            data: {

                labels: monthNames,

                datasets: [{
                    label: "Monthly Spending",
                    data: amounts
                }]

            },

            options: {

                responsive: true,

                scales: {

                    y: {
                        beginAtZero: true
                    }

                }

            }

        });

        monthlyReport.innerHTML = "";

        const months = Object.entries(data);

        if (months.length === 0) {

            monthlyReport.innerHTML =
                "<p>No monthly expense data available.</p>";

            return;
        }


       months.forEach(function ([month, amount]) {

           const date = new Date(2026, Number(month) - 1);

           const monthName = date.toLocaleString("en-US", {
               month: "long"
           });

           const item =
               document.createElement("div");

           item.className =
               "report-item";

           item.innerHTML = `
               <div>
                   <h3>${monthName}</h3>
               </div>

               <strong>
                   ₹${Number(amount).toFixed(2)}
               </strong>
           `;

           monthlyReport.appendChild(item);

       });

    } catch (error) {

        console.error(
            "Monthly report error:",
            error
        );

        monthlyReport.innerHTML =
            `<p>${error.message}</p>`;
    }
}


loadSummary();
loadCategoryReport();
loadMonthlyReport();