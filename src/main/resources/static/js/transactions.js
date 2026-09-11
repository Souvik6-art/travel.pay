const userId = localStorage.getItem("userId");

if (!userId) {
    window.location.href = "login.html";
}


async function loadTransactions() {

    const transactionList =
        document.getElementById("transactionList");

    try {

        const response = await fetch(
            `/api/transactions/user/${userId}`
        );

        if (!response.ok) {
            throw new Error("Unable to load transactions");
        }

        const transactions = await response.json();

        console.log("Transactions:", transactions);
transactions.sort(function (a, b) {

    return new Date(b.transactionDate) -
           new Date(a.transactionDate);

});

        if (transactions.length === 0) {

            transactionList.innerHTML =
                "<p>No transactions yet.</p>";

            return;
        }


        transactionList.innerHTML = "";


        transactions.forEach(function (transaction) {

            const transactionItem =
                document.createElement("div");

            transactionItem.className =
                "transaction-item";


            const isDeposit = transaction.type === "DEPOSIT";

            transactionItem.innerHTML = `
                <div class="transaction-info">

                    <h3>${transaction.description}</h3>

                    <p>
                        ${transaction.type}
                    </p>

                    <small>
                        ${new Date(transaction.transactionDate).toLocaleString()}
                    </small>

                </div>

                <div class="transaction-amount ${isDeposit ? "deposit-amount" : "expense-amount"}">

                    <strong>
                        ${isDeposit ? "+" : "-"}₹${Number(transaction.amount).toFixed(2)}
                    </strong>

                </div>
            `;


            transactionList.appendChild(transactionItem);

        });


    } catch (error) {

        console.error(
            "Transaction error:",
            error
        );

        transactionList.innerHTML =
            `<p>${error.message}</p>`;
    }
}


loadTransactions();