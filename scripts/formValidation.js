// formValidation.js

document.addEventListener("DOMContentLoaded", () => {
    const bookingForm = document.getElementById("bookingForm");
    const contactForm = document.getElementById("contactForm");

    
    function createErrorElement(input) {
        let errorSpan = input.parentElement.querySelector(".error-message");

        if (!errorSpan) {
            errorSpan = document.createElement("span");
            errorSpan.classList.add("error-message");
            errorSpan.style.color = "red";
            errorSpan.style.fontSize = "0.85em";
            errorSpan.style.display = "block";
            errorSpan.style.marginTop = "4px";
            input.parentElement.appendChild(errorSpan);
        }

        return errorSpan;
    }

    function showError(input, message) {
        const errorSpan = createErrorElement(input);
        errorSpan.textContent = message;
        input.classList.add("input-error");
        input.classList.remove("input-valid");
        input.style.borderColor = "red";
    }

    function clearError(input) {
        const errorSpan = input.parentElement.querySelector(".error-message");
        if (errorSpan) {
            errorSpan.textContent = "";
        }
        input.classList.remove("input-error");
        input.classList.add("input-valid");
        input.style.borderColor = "green";
    }

    function isEmailValid(email) {
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return pattern.test(email);
    }

    function isPhoneValid(phone) {
        const pattern = /^[0-9+\-\s]{6,20}$/; // αριθμοί, +, -, κενά
        return pattern.test(phone);
    }

    if (bookingForm) {
        bookingForm.addEventListener("submit", (e) => {
            let isValid = true;

           
            const firstName = bookingForm.elements["first_name"];
            const lastName = bookingForm.elements["last_name"];
            const email = bookingForm.elements["email"];
            const phone = bookingForm.elements["phone"];
            const destination = bookingForm.elements["destination"];
            const travelers = bookingForm.elements["travelers"];
            const departureDate = bookingForm.elements["departure_date"];
            const returnDate = bookingForm.elements["return_date"];
            const budget = bookingForm.elements["budget"];
            const terms = bookingForm.elements["terms"];

            // Καθαρίζουμε παλιά errors
            [firstName, lastName, email, phone, destination, travelers, departureDate, returnDate, budget].forEach(input => {
                if (input) clearError(input);
            });

            // First Name
            if (!firstName.value.trim()) {
                showError(firstName, "First name is required.");
                isValid = false;
            } else if (firstName.value.trim().length < 2) {
                showError(firstName, "First name must be at least 2 characters.");
                isValid = false;
            }

            // Last Name
            if (!lastName.value.trim()) {
                showError(lastName, "Last name is required.");
                isValid = false;
            } else if (lastName.value.trim().length < 2) {
                showError(lastName, "Last name must be at least 2 characters.");
                isValid = false;
            }

            // Email
            if (!email.value.trim()) {
                showError(email, "Email address is required.");
                isValid = false;
            } else if (!isEmailValid(email.value.trim())) {
                showError(email, "Please enter a valid email (e.g. name@example.com).");
                isValid = false;
            }

            // Phone
            if (!phone.value.trim()) {
                showError(phone, "Phone number is required.");
                isValid = false;
            } else if (!isPhoneValid(phone.value.trim())) {
                showError(phone, "Phone number can contain only digits, spaces, + or - and must be at least 6 characters.");
                isValid = false;
            }

            // Destination
            if (!destination.value.trim()) {
                showError(destination, "Please enter a preferred destination.");
                isValid = false;
            }

            // Travelers
            const travelersNum = parseInt(travelers.value, 10);
            if (!travelers.value.trim()) {
                showError(travelers, "Please enter the number of travelers.");
                isValid = false;
            } else if (isNaN(travelersNum) || travelersNum < 1) {
                showError(travelers, "Number of travelers must be a positive number.");
                isValid = false;
            }

            // Dates
            if (!departureDate.value) {
                showError(departureDate, "Please select a departure date.");
                isValid = false;
            }
            if (!returnDate.value) {
                showError(returnDate, "Please select a return date.");
                isValid = false;
            }
            if (departureDate.value && returnDate.value) {
                const dep = new Date(departureDate.value);
                const ret = new Date(returnDate.value);
                if (dep > ret) {
                    showError(returnDate, "Return date cannot be earlier than departure date.");
                    isValid = false;
                }
            }

            // Budget 
            if (budget.value.trim()) {
                const budgetNum = parseFloat(budget.value);
                if (isNaN(budgetNum) || budgetNum < 0) {
                    showError(budget, "Budget must be a positive number.");
                    isValid = false;
                }
            }

            // Terms checkbox
            if (!terms.checked) {
                alert("You must accept the Terms & Conditions to proceed.");
                isValid = false;
            }

            // Αν υπάρχει έστω ένα λάθος, δεν γίνεται submit
            if (!isValid) {
                e.preventDefault();
            }
        });
    }

    
    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            let isValid = true;

            const fullName = contactForm.elements["fullname"];
            const email = contactForm.elements["email"];
            const message = contactForm.elements["message"];
            const thankYou = document.getElementById("thankYouMessage");

            [fullName, email, message].forEach(input => {
                if (input) clearError(input);
            });

            if (!fullName.value.trim()) {
                showError(fullName, "Full name is required.");
                isValid = false;
            }

            if (!email.value.trim()) {
                showError(email, "Email address is required.");
                isValid = false;
            } else if (!isEmailValid(email.value.trim())) {
                showError(email, "Please enter a valid email address.");
                isValid = false;
            }

            if (!message.value.trim()) {
                showError(message, "Please enter your message.");
                isValid = false;
            }

            if (!isValid) {
                e.preventDefault();
                return;
            }

        //thank you μηνυμα
            e.preventDefault();
            if (thankYou) {
                thankYou.style.display = "block";
            }
            contactForm.reset();
        });
    }
});
