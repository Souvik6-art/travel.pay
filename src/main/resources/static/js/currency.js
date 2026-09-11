const currencyForm =
    document.getElementById("currencyForm");

const currencyResult =
    document.getElementById("currencyResult");


currencyForm.addEventListener("submit", async function (event) {

    event.preventDefault();


    const amount = Number(
        document.getElementById("currencyAmount").value
    );

    const from =
        document.getElementById("fromCurrency").value;

    const to =
        document.getElementById("toCurrency").value;


    if (amount <= 0) {

        currencyResult.innerHTML =
            "<p>Please enter a valid amount.</p>";

        return;
    }


    if (!from || !to) {

        currencyResult.innerHTML =
            "<p>Please select both currencies.</p>";

        return;
    }


    try {

        currencyResult.innerHTML =
            "<p>Converting...</p>";


        const response = await fetch(
            "/api/currency/convert",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    amount: amount,
                    from: from,
                    to: to

                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.message || "Currency conversion failed"
            );

        }


        currencyResult.innerHTML = `

            <div class="conversion-result">

                <p>
                    ${Number(data.amount).toFixed(2)}
                    ${data.from}
                </p>

                <h2>
                    ${Number(data.convertedAmount).toFixed(2)}
                    ${data.to}
                </h2>

                <span>
                    Converted successfully
                </span>

            </div>

        `;


    } catch (error) {

        console.error(
            "Currency conversion error:",
            error
        );


        currencyResult.innerHTML = `

            <p>
                ${error.message}
            </p>

        `;

    }

});