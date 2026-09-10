const registerForm = document.getElementById("registerForm");
const registerMessage = document.getElementById("registerMessage");

if (registerForm) {

    registerForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const name = document.getElementById("name").value;
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const userData = {
            name: name,
            email: email,
            password: password
        };

        try {

            registerMessage.textContent = "Creating account...";

            await registerUser(userData);

            registerMessage.textContent =
                "Account created successfully!";

            registerForm.reset();

        } catch (error) {

            registerMessage.textContent = error.message;

        }

    });

}


// connecting to login
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");

if (loginForm) {

    loginForm.addEventListener("submit", async function (event) {

        event.preventDefault();

        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        const loginData = {
            email: email,
            password: password
        };

        try {

            loginMessage.textContent = "Logging in...";

            const user = await loginUser(loginData);

            localStorage.setItem("userId", user.userId);
            localStorage.setItem("userName", user.name);
            localStorage.setItem("userEmail", user.email);

            loginMessage.textContent =
                "Login successful! Redirecting...";

            window.location.href = "dashboard.html";

        } catch (error) {

            loginMessage.textContent = error.message;

        }

    });

}