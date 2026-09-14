const userId = localStorage.getItem("userId");

const tripList = document.getElementById("tripList");

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

                <button onclick="openTrip(${trip.id})">
                    Open Trip
                </button>
            `;

            tripList.appendChild(tripCard);
        });

    } catch (error) {

        console.error(error);

        tripList.innerHTML =
            "<p>Unable to load trips.</p>";
    }
}


function openTrip(tripId) {

    localStorage.setItem("tripId", tripId);

    window.location.href = "trip-dashboard.html";
}


loadTrips();

const createTripBtn = document.getElementById("createTripBtn");
const createTripForm = document.getElementById("createTripForm");
const saveTripBtn = document.getElementById("saveTripBtn");

createTripBtn.addEventListener("click", () => {
    createTripForm.style.display = "block";
});

saveTripBtn.addEventListener("click", async () => {

    const tripName = document.getElementById("tripName").value;
    const destination = document.getElementById("destination").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    if (!tripName || !destination || !startDate || !endDate) {
        alert("Please fill all fields.");
        return;
    }

    try {

        const response = await fetch(`/api/trips/${userId}`, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                tripName: tripName,
                destination: destination,
                startDate: startDate,
                endDate: endDate
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to create trip");
        }

        alert("Trip created successfully!");

        createTripForm.style.display = "none";

        document.getElementById("tripName").value = "";
        document.getElementById("destination").value = "";
        document.getElementById("startDate").value = "";
        document.getElementById("endDate").value = "";

        loadTrips();

    } catch (error) {

        console.error(error);
        alert(error.message);
    }
});