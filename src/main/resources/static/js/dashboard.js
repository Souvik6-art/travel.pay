console.log("DASHBOARD JS LOADED");
const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


async function loadDashboard() {

    try {

        const response = await fetch(`/api/dashboard/${userId}`);

        if (!response.ok) {
            throw new Error("Unable to load dashboard");
        }

        const data = await response.json();

        console.log("Dashboard data:", data);


        document.getElementById("walletBalance").textContent =
            `₹${data.walletBalance.toFixed(2)}`;

        document.getElementById("totalDeposits").textContent =
            `₹${data.totalDeposits.toFixed(2)}`;

        document.getElementById("totalExpenses").textContent =
            `₹${data.totalExpenses.toFixed(2)}`;


        const userName = localStorage.getItem("userName");

        if (userName) {
            document.getElementById("userName").textContent = userName;
        }


    } catch (error) {

        console.error("Dashboard error:", error);

    }
}


loadDashboard();

const depositForm = document.getElementById("depositForm");
const depositMessage = document.getElementById("depositMessage");

/// temporarily adding
console.log("DEPOSIT FORM:", depositForm);
console.log("DEPOSIT MESSAGE:", depositMessage);


if (depositForm) {

    depositForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const amount = Number(
            document.getElementById("depositAmount").value
        );

        if (amount <= 0) {
            depositMessage.textContent =
                "Please enter a valid amount.";
            return;
        }

        try {

            depositMessage.textContent = "Adding money...";

            // Get the user's wallet
            const walletResponse = await fetch(
                `/api/wallets/user/${userId}`
            );

            if (!walletResponse.ok) {
                throw new Error("Wallet not found");
            }

            const wallet = await walletResponse.json();

            // Deposit money
            const depositResponse = await fetch(
                `/api/wallets/${wallet.id}/deposit`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        amount: amount
                    })
                }
            );

            const data = await depositResponse.json();

            if (!depositResponse.ok) {
                throw new Error(
                    data.message || "Deposit failed"
                );
            }

            depositMessage.textContent =
                `₹${amount.toFixed(2)} added successfully!`;

            depositForm.reset();

            // Refresh dashboard values
            loadDashboard();

        } catch (error) {

            console.error("Deposit error:", error);

            depositMessage.textContent =
                error.message;

        }

    });

}

const myTripsCard = document.getElementById("myTripsCard");

if (myTripsCard) {
    myTripsCard.addEventListener("click", function () {
        window.location.href = "trips.html";
    });
}

//**************************************************************/
const totalExpensesCard =
    document.getElementById("totalExpensesCard");

if (totalExpensesCard) {
    totalExpensesCard.addEventListener("click", function () {

        window.location.href = "trip-expenses.html";

    });
}
/************************************/
const totalDepositsCard =
    document.getElementById("totalDepositsCard");

const depositHistory =
    document.getElementById("depositHistory");

let depositHistoryLoaded = false;

if (totalDepositsCard) {

    totalDepositsCard.addEventListener("click", async function () {

        if (depositHistory.style.display === "block") {
            depositHistory.style.display = "none";
            return;
        }

        depositHistory.style.display = "block";

        if (depositHistoryLoaded) {
            return;
        }

        try {

            const response = await fetch(
                `/api/transactions/user/${userId}`
            );

            if (!response.ok) {
                throw new Error("Failed to load deposit history");
            }

            const transactions = await response.json();

            const deposits = transactions
                .filter(transaction =>
                    String(transaction.type).toUpperCase() === "DEPOSIT"
                )
                .sort((a, b) =>
                    new Date(b.transactionDate) -
                    new Date(a.transactionDate)
                );

            if (deposits.length === 0) {

                depositHistory.innerHTML =
                    "<p>No deposits found.</p>";

                return;
            }

            depositHistory.innerHTML = "";

            deposits.forEach(transaction => {

                const amount =
                    Number(transaction.amount) || 0;

                const date =
                    new Date(transaction.transactionDate)
                        .toLocaleString("en-IN", {
                            dateStyle: "medium",
                            timeStyle: "short"
                        });

                const depositItem =
                    document.createElement("div");

                depositItem.className = "deposit-history-item";

                depositItem.innerHTML = `
                    <h4>₹${amount.toFixed(2)}</h4>
                    <p>${transaction.description || "Wallet deposit"}</p>
                    <span>${date}</span>
                `;

                depositHistory.appendChild(depositItem);

            });

            depositHistoryLoaded = true;

        } catch (error) {

            console.error(
                "Deposit history error:",
                error
            );

            depositHistory.innerHTML =
                "<p>Unable to load deposit history.</p>";
        }

    });
}
/*******************************************************
 * WALLET
 *******************************************************/

const walletCard =
    document.getElementById("walletCard");

const walletOptions =
    document.getElementById("walletOptions");

const payFromWalletBtn =
    document.getElementById("payFromWalletBtn");

const walletPaymentForm =
    document.getElementById("walletPaymentForm");

const confirmWalletPaymentBtn =
    document.getElementById("confirmWalletPaymentBtn");

const walletHistoryBtn =
    document.getElementById("walletHistoryBtn");

const walletHistory =
    document.getElementById("walletHistory");


/*******************************************************
 * OPEN WALLET OPTIONS
 *******************************************************/

if (walletCard) {

    walletCard.addEventListener("click", function () {

        walletOptions.style.display = "block";

    });

}


/*******************************************************
 * OPEN PAY FROM WALLET FORM
 *******************************************************/

if (payFromWalletBtn) {

    payFromWalletBtn.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            walletPaymentForm.style.display = "block";

        }
    );

}


/*******************************************************
 * PAY FROM WALLET
 *******************************************************/

if (confirmWalletPaymentBtn) {

    confirmWalletPaymentBtn.addEventListener(
        "click",
        async function (event) {

            event.stopPropagation();

            const amount =
                Number(
                    document.getElementById(
                        "walletPaymentAmount"
                    ).value
                );

            const description =
                document.getElementById(
                    "walletPaymentDescription"
                ).value;

            const message =
                document.getElementById(
                    "walletPaymentMessage"
                );


            // Check amount

            if (amount <= 0) {

                message.textContent =
                    "Please enter a valid amount.";

                return;
            }


            try {

                message.textContent =
                    "Processing payment...";


                // Get wallet

                const walletResponse =
                    await fetch(
                        `/api/wallets/user/${userId}`
                    );


                if (!walletResponse.ok) {

                    throw new Error(
                        "Wallet not found"
                    );

                }


                const wallet =
                    await walletResponse.json();


                // Pay from wallet

                const response =
                    await fetch(
                        `/api/wallets/${wallet.id}/pay`,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body: JSON.stringify({
                                amount: amount,
                                description: description
                            })
                        }
                    );


                if (!response.ok) {

                    const errorText =
                        await response.text();

                    throw new Error(
                        errorText ||
                        "Payment failed"
                    );

                }


                const updatedWallet =
                    await response.json();


                // Update balance

                document.getElementById(
                    "walletBalance"
                ).textContent =
                    `₹${updatedWallet.balance.toFixed(2)}`;


                message.textContent =
                    "Payment successful!";


                // Clear inputs

                document.getElementById(
                    "walletPaymentAmount"
                ).value = "";

                document.getElementById(
                    "walletPaymentDescription"
                ).value = "";


                // Refresh dashboard

                loadDashboard();

            }
            catch (error) {

                console.error(
                    "Wallet payment error:",
                    error
                );

                message.textContent =
                    error.message ||
                    "Payment failed.";

            }

        }
    );

}


/*******************************************************
 * WALLET HISTORY
 *******************************************************/

if (walletHistoryBtn) {

    walletHistoryBtn.addEventListener(
        "click",
        async function (event) {

            event.stopPropagation();


            // Show history

            walletHistory.style.display = "block";


            walletHistory.innerHTML =
                "<p>Loading wallet history...</p>";


            try {

                const response =
                    await fetch(
                        `/api/transactions/user/${userId}`
                    );


                if (!response.ok) {

                    throw new Error(
                        "Failed to load wallet history"
                    );

                }


                const transactions =
                    await response.json();


                console.log(
                    "Wallet transactions:",
                    transactions
                );


                /*
                 * Only wallet transactions
                 *
                 * DEPOSIT  = money added
                 * EXPENSE  = money paid
                 */

                const walletTransactions =
                    transactions
                        .filter(function (transaction) {

                            const type =
                                String(
                                    transaction.type || ""
                                ).toUpperCase();

                            return (
                                type === "DEPOSIT" ||
                                type === "EXPENSE"
                            );

                        })
                        .sort(function (a, b) {

                            return (
                                new Date(
                                    b.transactionDate
                                ) -
                                new Date(
                                    a.transactionDate
                                )
                            );

                        });


                // No history

                if (
                    walletTransactions.length === 0
                ) {

                    walletHistory.innerHTML =
                        "<p>No wallet history yet.</p>";

                    return;

                }


                // Clear loading message

                walletHistory.innerHTML = "";


                // Display transactions

                walletTransactions.forEach(
                    function (transaction) {

                        const type =
                            String(
                                transaction.type || ""
                            ).toUpperCase();


                        const isDeposit =
                            type === "DEPOSIT";


                        const symbol =
                            isDeposit
                                ? "↓"
                                : "↑";


                        const amount =
                            Number(
                                transaction.amount
                            ) || 0;


                        const description =
                            transaction.description ||
                            (
                                isDeposit
                                    ? "Money added to wallet"
                                    : "Wallet payment"
                            );


                        const date =
                            transaction.transactionDate
                                ? new Date(
                                    transaction.transactionDate
                                ).toLocaleString(
                                    "en-IN",
                                    {
                                        dateStyle: "medium",
                                        timeStyle: "short"
                                    }
                                )
                                : "Date unavailable";


                        const item =
                            document.createElement("div");


                        item.className =
                            "wallet-history-item";


                        item.innerHTML = `

                            <div>

                                <strong>
                                    ${symbol}
                                    ₹${amount.toFixed(2)}
                                </strong>

                                <p>
                                    ${description}
                                </p>

                                <small>
                                    ${date}
                                </small>

                            </div>

                            <hr>

                        `;


                        walletHistory.appendChild(item);

                    }
                );

            }
            catch (error) {

                console.error(
                    "Wallet history error:",
                    error
                );


                walletHistory.innerHTML =
                    "<p>Unable to load wallet history.</p>";

            }

        }
    );

}