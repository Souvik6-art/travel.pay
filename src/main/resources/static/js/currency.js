const currencyForm = document.getElementById("currencyForm");

const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");

const fromFlag = document.getElementById("fromFlag");
const toFlag = document.getElementById("toFlag");

const currencyMessage = document.getElementById("currencyMessage");

const swapCurrency = document.getElementById("swapCurrency");


// --------------------------------------
// Create currency dropdown options
// --------------------------------------

for (let currCode in countryList) {

    const fromOption = document.createElement("option");

    fromOption.innerText = currCode;
    fromOption.value = currCode;

    if (currCode === "USD") {
        fromOption.selected = true;
    }

    fromCurrency.append(fromOption);


    const toOption = document.createElement("option");

    toOption.innerText = currCode;
    toOption.value = currCode;

    if (currCode === "INR") {
        toOption.selected = true;
    }

    toCurrency.append(toOption);
}


// --------------------------------------
// Update currency flag
// --------------------------------------

function updateFlag(selectElement) {

    const currCode = selectElement.value;

    const countryCode = countryList[currCode];

    const flagURL =
        `https://flagsapi.com/${countryCode}/flat/64.png`;

    if (selectElement === fromCurrency) {
        fromFlag.src = flagURL;
    }

    if (selectElement === toCurrency) {
        toFlag.src = flagURL;
    }
}


// --------------------------------------
// Change flags when currency changes
// --------------------------------------

fromCurrency.addEventListener("change", function () {
    updateFlag(fromCurrency);
});

toCurrency.addEventListener("change", function () {
    updateFlag(toCurrency);
});


// --------------------------------------
// Set initial flags
// --------------------------------------

updateFlag(fromCurrency);
updateFlag(toCurrency);


// --------------------------------------
// Swap currencies
// --------------------------------------

swapCurrency.addEventListener("click", function () {

    const temporaryCurrency = fromCurrency.value;

    fromCurrency.value = toCurrency.value;
    toCurrency.value = temporaryCurrency;

    updateFlag(fromCurrency);
    updateFlag(toCurrency);
});


// --------------------------------------
// Currency conversion
// --------------------------------------

currencyForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    const amount = Number(
        document.getElementById("currencyAmount").value
    );

    const from = fromCurrency.value;
    const to = toCurrency.value;


    // Check amount

    if (amount <= 0) {

        currencyMessage.textContent =
            "Please enter a valid amount.";

        return;
    }


    // Same currency

    if (from === to) {

        currencyMessage.textContent =
            `${amount.toFixed(2)} ${from} = ${amount.toFixed(2)} ${to}`;

        return;
    }


    try {

        currencyMessage.textContent =
            "Getting exchange rate...";


        const response = await fetch("/api/currency/convert", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                amount: amount,
                from: from,
                to: to
            })

        });


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Currency conversion failed"
            );

        }


        currencyMessage.textContent =
            `${Number(data.amount).toFixed(2)} ${data.from} = ${Number(data.convertedAmount).toFixed(2)} ${data.to}`;


    } catch (error) {

        console.error(
            "Currency conversion error:",
            error
        );

        currencyMessage.textContent =
            error.message;

    }

});