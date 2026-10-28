
const userId = localStorage.getItem("userId");
const tripId = localStorage.getItem("tripId");

// Redirect if required information is missing
if (!userId) {
    window.location.href = "login.html";
}

if (!tripId) {
    window.location.href = "trips.html";
}

// Stop executing if the user or trip ID is missing
if (!userId || !tripId) {
    throw new Error("User ID or Trip ID is missing.");
}


// ==============================
// DOM ELEMENTS
// ==============================

const tripName = document.getElementById("tripName");
const tripInfo = document.getElementById("tripInfo");


// ==============================
// LOAD TRIP INFORMATION
// ==============================

async function loadTrip() {
    try {
        const response = await fetch(`/api/trips/${tripId}`);

        if (!response.ok) {
            throw new Error("Failed to load trip.");
        }

        const trip = await response.json();

        console.log("Trip:", trip);

        tripName.textContent = trip.tripName;

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

        const tripStatus = document.getElementById("tripStatus");

        if (tripStatus) {
            tripStatus.value = trip.status;
        }

    } catch (error) {
        console.error("Trip error:", error);

        tripName.textContent = "Unable to load trip";
    }
}


// ==============================
// LOAD TRIP FINANCIAL SUMMARY
// ==============================

async function loadTripSummary() {
    try {
        const response = await fetch(
            `/api/reports/user/${userId}/trip/${tripId}/summary`
        );

        if (!response.ok) {
            throw new Error("Unable to load trip summary.");
        }

        const summary = await response.json();

        console.log("Trip Summary:", summary);

        document.getElementById("tripBudget").textContent =
            `₹${Number(summary.totalBudget).toFixed(2)}`;

        document.getElementById("tripSpent").textContent =
            `₹${Number(summary.totalSpent).toFixed(2)}`;

        document.getElementById("tripRemaining").textContent =
            `₹${Number(summary.remainingBudget).toFixed(2)}`;

    } catch (error) {
        console.error("Trip summary error:", error);
    }
}


// ==============================
// NAVIGATION
// ==============================

function openBudget() {
    window.location.href = "budget.html";
}

function openExpenses() {
    window.location.href = "expenses.html";
}

function openTransactions() {
    window.location.href = "transactions.html";
}

function openReports() {
    window.location.href = "reports.html";
}

function backToTrips() {
    window.location.href = "trips.html";
}


// ==============================
// UPDATE TRIP STATUS
// ==============================

async function updateTripStatus() {
    const tripStatus = document.getElementById("tripStatus");
    const statusMessage = document.getElementById("statusMessage");

    if (!tripStatus || !statusMessage) {
        console.error("Trip status elements are missing.");
        return;
    }

    const status = tripStatus.value;

    try {
        statusMessage.textContent = "Updating status...";

        const response = await fetch(
            `/api/trips/${userId}/${tripId}/status?status=${encodeURIComponent(status)}`,
            {
                method: "PUT"
            }
        );

        if (!response.ok) {
            const errorText = await response.text();

            throw new Error(
                errorText || "Unable to update trip status."
            );
        }

        statusMessage.textContent =
            `Trip status updated to ${status}.`;

        await loadTrip();

    } catch (error) {
        console.error("Trip status error:", error);
        statusMessage.textContent = error.message;
    }
}


// ==============================
// VIEW TRIP COMPANIONS
// ==============================

const viewCompanionsBtn =
    document.getElementById("viewCompanionsBtn");

const companionsSection =
    document.getElementById("companionsSection");

const tripCompanionsList =
    document.getElementById("tripCompanionsList");


if (viewCompanionsBtn && companionsSection && tripCompanionsList) {

    viewCompanionsBtn.addEventListener("click", async () => {

        const currentTripId = localStorage.getItem("tripId");

        if (!currentTripId) {
            alert("Trip ID is missing. Please reopen your trip.");
            return;
        }

        // Determine visibility reliably, including CSS-defined display.
        const isHidden =
            getComputedStyle(companionsSection).display === "none";

        // Hide the list if it is already visible.
        if (!isHidden) {
            companionsSection.style.display = "none";
            viewCompanionsBtn.textContent = "👥 View Companions";
            return;
        }

        // Show the section and load companions.
        companionsSection.style.display = "block";
        viewCompanionsBtn.textContent = "👥 Hide Companions";

        tripCompanionsList.textContent = "Loading companions...";

        try {
            const response = await fetch(
                `/api/trip-companions/trip/${currentTripId}`
            );

            if (!response.ok) {
                const errorText = await response.text();

                throw new Error(
                    `Unable to load companions (${response.status}). ${errorText}`
                );
            }

            const companions = await response.json();

            tripCompanionsList.replaceChildren();

            if (!Array.isArray(companions) || companions.length === 0) {
                tripCompanionsList.textContent =
                    "No companions have been added to this trip.";
                return;
            }

            const list = document.createElement("ul");
            list.className = "companions-list";


companions.forEach(companion => {
    const item = document.createElement("li");

    item.className = companion.contributor
        ? "contributor"
        : "non-contributor";

    const name = document.createElement("strong");
    name.textContent = companion.name;

    const role = document.createElement("span");
    role.className = "companion-role";
    role.textContent = companion.contributor
        ? "Contributor"
        : "Non-contributor";

    item.append(name, role);
    list.appendChild(item);
});

            tripCompanionsList.appendChild(list);

            console.log("Trip companions:", companions);

        } catch (error) {
            console.error("Companions loading error:", error);

            tripCompanionsList.textContent =
                error.message || "Unable to load companions. Please try again.";
        }
    });

} else {
    console.error(
        "Companions UI elements are missing. Check the IDs in trip-dashboard.html:",
        {
            viewCompanionsBtn,
            companionsSection,
            tripCompanionsList
        }
    );
}


// ==============================
// START
// ==============================

loadTrip();
loadTripSummary();

async function viewTripSettlement() {
    const tripId = localStorage.getItem("tripId");

    if (!tripId) {
        alert("Trip ID not found. Please open a trip first.");
        return;
    }

    const section = document.getElementById("settlementSection");
    const totalElement = document.getElementById("settlementTotal");
    const participantsElement = document.getElementById("settlementParticipants");
    const transfersElement = document.getElementById("settlementTransfers");
    const hideButton = document.getElementById("hideSettlementBtn");

    // Show loading state
    section.style.display = "block";
    totalElement.textContent = "Loading...";
    participantsElement.replaceChildren();
    transfersElement.replaceChildren();

    // Hide the Hide Settlement button until loading succeeds
    if (hideButton) {
        hideButton.style.display = "none";
    }

    try {
        const response = await fetch(`/api/trips/${tripId}/settlement`);

        if (!response.ok) {
            throw new Error("Failed to load settlement.");
        }

        const data = await response.json();

        totalElement.textContent = Number(data.totalExpense).toFixed(2);

        // Display participant balances
        data.participants.forEach(person => {
            const row = document.createElement("p");

            row.textContent =
                `${person.name} — Paid ₹${Number(person.totalPaid).toFixed(2)}, ` +
                `Share ₹${Number(person.equalShare).toFixed(2)}, ` +
                `${person.status}: ₹${Math.abs(Number(person.netBalance)).toFixed(2)}`;

            participantsElement.appendChild(row);
        });

        // Display settlement transfers
        if (data.settlements.length === 0) {
            transfersElement.textContent =
                "Everyone is settled. No payments required.";
        } else {
            data.settlements.forEach(transfer => {
                const row = document.createElement("p");

                row.textContent =
                    `${transfer.from} pays ${transfer.to} ₹` +
                    `${Number(transfer.amount).toFixed(2)}`;

                transfersElement.appendChild(row);
            });
        }

        // Show Hide Settlement only after successful loading
        if (hideButton) {
            hideButton.style.display = "inline-block";
        }

    } catch (error) {
        console.error("Error loading settlement:", error);

        totalElement.textContent = "Unable to load settlement.";
        participantsElement.replaceChildren();
        transfersElement.replaceChildren();

        // Hide the section if loading fails
        section.style.display = "none";

        if (hideButton) {
            hideButton.style.display = "none";
        }

        alert("Unable to load trip settlement. Please try again.");
    }
}

// Hide the settlement section and its button
function hideTripSettlement() {
    document.getElementById("settlementSection").style.display = "none";

    const hideButton = document.getElementById("hideSettlementBtn");

    if (hideButton) {
        hideButton.style.display = "none";
    }
}
