
const userId = localStorage.getItem("userId");

const tripList = document.getElementById("tripList");
const createTripBtn = document.getElementById("createTripBtn");
const createTripForm = document.getElementById("createTripForm");
const saveTripBtn = document.getElementById("saveTripBtn");
const addCompanionBtn = document.getElementById("addCompanionBtn");
const companionsContainer = document.getElementById("companionsContainer");

// Load trips
async function loadTrips() {
    if (!userId) {
        tripList.innerHTML = "<p>Please login first.</p>";
        return;
    }

    try {
        const response = await fetch(`/api/trips/user/${userId}`);

        if (!response.ok) {
            throw new Error("Failed to load trips");
        }

        const trips = await response.json();

        if (trips.length === 0) {
            tripList.innerHTML = "<p>No trips found.</p>";
            return;
        }

        tripList.innerHTML = "";

        trips.forEach(trip => {
            const tripCard = document.createElement("div");

            tripCard.innerHTML = `
                <h2>${trip.tripName}</h2>
                <p>Destination: ${trip.destination}</p>
                <p>Start: ${trip.startDate}</p>
                <p>End: ${trip.endDate}</p>
                <p>Status: ${trip.status}</p>
                <button onclick="openTrip(${trip.id})">Open Trip</button>
            `;

            tripList.appendChild(tripCard);
        });

    } catch (error) {
        console.error(error);
        tripList.innerHTML = "<p>Unable to load trips.</p>";
    }
}

function openTrip(tripId) {
    localStorage.setItem("tripId", tripId);
    window.location.href = "trip-dashboard.html";
}

createTripBtn.addEventListener("click", () => {
    createTripForm.style.display = "block";
});

// Add a companion row
function addCompanionRow() {
    const row = document.createElement("div");
    row.className = "companion-row";
    row.style.marginBottom = "15px";

    row.innerHTML = `
        <input
            type="text"
            class="companion-name"
            placeholder="Companion name"
        >

        <label>
            <input
                type="radio"
                class="companion-role"
                value="true"
                checked
            >
            Add as Contributor
        </label>

        <label>
            <input
                type="radio"
                class="companion-role"
                value="false"
            >
            Add without Contributor
        </label>

        <button type="button" class="remove-companion-btn">
            Remove
        </button>
    `;

    // Both radio buttons must belong to the same group.
    const radios = row.querySelectorAll(".companion-role");
    const groupName = `companion-role-${Date.now()}-${Math.random()}`;

    radios.forEach(radio => {
        radio.name = groupName;
    });

    row.querySelector(".remove-companion-btn").addEventListener("click", () => {
        row.remove();
    });

    companionsContainer.appendChild(row);
}

addCompanionBtn.addEventListener("click", addCompanionRow);

// Save trip and companions
saveTripBtn.addEventListener("click", async () => {
    const tripName = document.getElementById("tripName").value.trim();
    const destination = document.getElementById("destination").value.trim();
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!userId) {
        alert("Please login first.");
        return;
    }

    if (!tripName || !destination || !startDate || !endDate) {
        alert("Please fill all trip fields.");
        return;
    }

    if (endDate < startDate) {
        alert("End date cannot be before start date.");
        return;
    }

    const companionRows = [
        ...companionsContainer.querySelectorAll(".companion-row")
    ];

    const companions = [];

    for (const row of companionRows) {
        const name = row.querySelector(".companion-name").value.trim();

        const selectedRole = row.querySelector(
            ".companion-role:checked"
        );

        if (!name) {
            alert("Please enter a name for every companion or remove the empty row.");
            return;
        }

        companions.push({
            name: name,
            contributor: selectedRole.value === "true"
        });
    }

    saveTripBtn.disabled = true;

    try {
        const response = await fetch(`/api/trips/${userId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                tripName,
                destination,
                startDate,
                endDate
            })
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "Failed to create trip");
        }

        const trip = await response.json();

        // Save companions against the newly created trip.
        for (const companion of companions) {
            const companionResponse = await fetch(
                `/api/trip-companions/${trip.id}`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify(companion)
                }
            );

            if (!companionResponse.ok) {
                throw new Error(
                    `Trip was created, but saving companion "${companion.name}" failed.`
                );
            }
        }

        alert("Trip and companions saved successfully!");

        document.getElementById("tripName").value = "";
        document.getElementById("destination").value = "";
        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";

        companionsContainer.innerHTML = "";
        createTripForm.style.display = "none";

        await loadTrips();

    } catch (error) {
        console.error(error);
        alert(error.message);
    } finally {
        saveTripBtn.disabled = false;
    }
});

loadTrips();
