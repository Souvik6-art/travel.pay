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



const galleryPagePhotoInput =
    document.getElementById("galleryPagePhotoInput");
/*
if (galleryPagePhotoInput) {

    galleryPagePhotoInput.addEventListener(
        "change",
        async function () {

            const tripId =
                galleryPageTripSelect.value;

            if (!tripId) {

                alert("Please select a trip first.");

                return;
            }

            const files =
                galleryPagePhotoInput.files;

            if (!files.length) {
                return;
            }

            for (const file of files) {

                const formData =
                    new FormData();

                formData.append("file", file);

                try {

                    const response =
                        await fetch(
                            `/api/trip-photos/upload/${tripId}`,
                            {
                                method: "POST",
                                body: formData
                            }
                        );

                    if (!response.ok) {

                        throw new Error(
                            "Upload failed: " +
                            response.status
                        );
                    }

                    console.log(
                        "Uploaded:",
                        file.name
                    );

                } catch (error) {

                    console.error(
                        "Photo upload error:",
                        error
                    );

                    alert(
                        "Failed to upload " +
                        file.name
                    );
                }
            }

            alert("Photos uploaded successfully!");

        }
    );
}
*/
/* =========================================
   PHOTO UPLOAD
   ========================================= */

const galleryUploadBtn =
    document.getElementById("galleryUploadBtn");


if (galleryUploadBtn && galleryPagePhotoInput) {

    galleryUploadBtn.addEventListener(
        "click",
        function () {

            const tripId =
                galleryPageTripSelect.value;

            if (!tripId) {

                alert("Please select a trip first.");

                galleryPageTripSelect.focus();

                return;
            }

            galleryPagePhotoInput.click();

        }
    );


    galleryPagePhotoInput.addEventListener(
        "change",
        async function () {

            const tripId =
                galleryPageTripSelect.value;

            const files =
                galleryPagePhotoInput.files;

            if (!tripId || !files.length) {
                return;
            }

            for (const file of files) {

                const formData =
                    new FormData();

                formData.append("file", file);

                try {

                    const response =
                        await fetch(
                            `/api/trip-photos/upload/${tripId}`,
                            {
                                method: "POST",
                                body: formData
                            }
                        );

                    if (!response.ok) {

                        throw new Error(
                            "Upload failed: " +
                            response.status
                        );
                    }

                    console.log(
                        "Uploaded:",
                        file.name
                    );

                } catch (error) {

                    console.error(
                        "Photo upload error:",
                        error
                    );

                    alert(
                        "Failed to upload " +
                        file.name
                    );
                }
            }

            alert("Photos uploaded successfully!");

            galleryPagePhotoInput.value = "";

        }
    );
}

/* =========================================
   LOAD PHOTOS FOR SELECTED TRIP
   ========================================= */

const galleryPhotoGrid =
    document.getElementById("galleryPhotoGrid");

if (galleryPageTripSelect && galleryPhotoGrid) {

    galleryPageTripSelect.addEventListener(
        "change",
        async function () {

            const tripId =
                galleryPageTripSelect.value;

            if (!tripId) {

                galleryPhotoGrid.innerHTML = `
                    <div class="gallery-empty-state">

                        <div class="gallery-empty-icon">
                            📷
                        </div>

                        <h3>
                            Select a trip
                        </h3>

                        <p>
                            Choose a trip above to view its photos.
                        </p>

                    </div>
                `;

                return;
            }

            galleryPhotoGrid.innerHTML = `
                <p class="gallery-loading">
                    Loading photos...
                </p>
            `;

            try {

                const response =
                    await fetch(
                        `/api/trip-photos/trip/${tripId}`
                    );

                if (!response.ok) {

                    throw new Error(
                        "Failed to load photos."
                    );
                }

                const photos =
                    await response.json();

                console.log(
                    "Photos for trip:",
                    photos
                );

                if (photos.length === 0) {

                    galleryPhotoGrid.innerHTML = `
                        <div class="gallery-empty-state">

                            <div class="gallery-empty-icon">
                                📷
                            </div>

                            <h3>
                                No photos yet
                            </h3>

                            <p>
                                Upload some memories from this trip.
                            </p>

                        </div>
                    `;

                    return;
                }

                galleryPhotoGrid.innerHTML = "";

                photos.forEach(photo => {

                    const photoCard =
                        document.createElement("div");

                    photoCard.className =
                        "gallery-photo-card";

                    photoCard.innerHTML = `
                        <img
                            src="${photo.filePath}"
                            alt="${photo.fileName}"
                        >
                    `;

                    galleryPhotoGrid.appendChild(
                        photoCard
                    );

                });

            } catch (error) {

                console.error(
                    "Photo loading error:",
                    error
                );

                galleryPhotoGrid.innerHTML = `
                    <div class="gallery-empty-state">

                        <div class="gallery-empty-icon">
                            ⚠️
                        </div>

                        <h3>
                            Unable to load photos
                        </h3>

                        <p>
                            Please try again.
                        </p>

                    </div>
                `;

            }

        }
    );

}