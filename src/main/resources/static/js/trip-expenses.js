const userId = localStorage.getItem("userId");

const container =
    document.getElementById("tripExpensesContainer");

if (!userId) {
    window.location.href = "login.html";
}

async function loadTripExpenses() {

    try {

        const response = await fetch(
            `/api/reports/user/${userId}/trip-totals`
        );

        if (!response.ok) {
            throw new Error("Failed to load trip expenses");
        }

        const tripExpenses = await response.json();

        container.innerHTML = "";

        let grandTotal = 0;

        const trips = Object.entries(tripExpenses);

        if (trips.length === 0) {

            container.innerHTML =
                "<p>No expenses found.</p>";

            return;
        }

        trips.forEach(([tripName, amount]) => {

            grandTotal += amount;

            const tripCard =
                document.createElement("div");

            tripCard.className = "dashboard-card";

            tripCard.innerHTML = `
                <p>${tripName}</p>
                <h2>₹${amount.toFixed(2)}</h2>
                <span>Total Spent on this Trip</span>
            `;

            container.appendChild(tripCard);
        });

        const totalCard =
            document.createElement("div");

        totalCard.className = "dashboard-card";

        totalCard.innerHTML = `
            <p>Total Expenses</p>
            <h2>₹${grandTotal.toFixed(2)}</h2>
            <span>All Trips Combined</span>
        `;

        container.appendChild(totalCard);

    } catch (error) {

        console.error(
            "Trip expenses error:",
            error
        );

        container.innerHTML =
            "<p>Unable to load trip expenses.</p>";
    }
}

loadTripExpenses();