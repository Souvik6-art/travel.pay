const userId = localStorage.getItem("userId");
const tripId = localStorage.getItem("tripId");

if (!userId) {
    window.location.href = "login.html";
}

if (!tripId) {
    window.location.href = "trips.html";
}


const tripName = document.getElementById("tripName");
const tripInfo = document.getElementById("tripInfo");


// Load trip information
async function loadTrip() {

    try {

        const response = await fetch(
            `/api/trips/${tripId}`
        );

        if (!response.ok) {
            throw new Error("Failed to load trip");
        }

        const trip = await response.json();

        console.log("Trip:", trip);

        tripName.textContent =
            trip.tripName;

        tripInfo.innerHTML = `
            <p>
                <strong>Destination:</strong>
                ${trip.destination}
            </p>

            <p>
                <strong>Start Date:</strong>
                ${trip.startDate}
            </p>

            <p>
                <strong>End Date:</strong>
                ${trip.endDate}
            </p>

            <p>
                <strong>Status:</strong>
                ${trip.status}
            </p>
        `;

    } catch (error) {

        console.error("Trip error:", error);

        tripName.textContent =
            "Unable to load trip";

    }
}


// Load trip financial summary
async function loadTripSummary() {

    try {

        const response = await fetch(
            `/api/reports/user/${userId}/trip/${tripId}/summary`
        );

        if (!response.ok) {
            throw new Error(
                "Unable to load trip summary"
            );
        }

        const summary = await response.json();

        console.log(
            "Trip Summary:",
            summary
        );


        document.getElementById("tripBudget").textContent =
            `₹${Number(summary.totalBudget).toFixed(2)}`;


        document.getElementById("tripSpent").textContent =
            `₹${Number(summary.totalSpent).toFixed(2)}`;


        document.getElementById("tripRemaining").textContent =
            `₹${Number(summary.remainingBudget).toFixed(2)}`;

    } catch (error) {

        console.error(
            "Trip summary error:",
            error
        );

    }
}


// Navigation

function openBudget() {

    window.location.href =
        "budget.html";
}


function openExpenses() {

    window.location.href =
        "expenses.html";
}


function openTransactions() {

    window.location.href =
        "transactions.html";
}


function openReports() {

    window.location.href =
        "reports.html";
}


function backToTrips() {

    window.location.href =
        "trips.html";
}


// Start

loadTrip();
loadTripSummary();

