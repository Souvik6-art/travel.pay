/* =========================================
   LOAD TRIPS FOR GALLERY PAGE
   ========================================= */

async function loadGalleryPageTrips() {

    const tripSelect =
        document.getElementById("galleryPageTripSelect");

    const userId =
        localStorage.getItem("userId");

    if (!tripSelect || !userId) {
        console.log("Gallery page: dropdown or user ID not found.");
        return;
    }

    try {

        console.log("Loading trips for gallery page:", userId);

        const response =
            await fetch(`/api/trips/user/${userId}`);

        if (!response.ok) {
            throw new Error(
                "Failed to load trips. Status: " + response.status
            );
        }

        const trips = await response.json();

        console.log("Gallery page trips:", trips);

        tripSelect.innerHTML = `
            <option value="">
                -- Select a Trip --
            </option>
        `;

        trips.forEach(trip => {

            const option =
                document.createElement("option");

            option.value = trip.id;

            option.textContent =
                `${trip.tripName} - ${trip.destination}`;

            tripSelect.appendChild(option);

        });

        console.log(
            "Dropdown options:",
            tripSelect.innerHTML
        );

    } catch (error) {

        console.error(
            "Gallery page trip loading error:",
            error
        );

    }
}




loadGalleryPageTrips();