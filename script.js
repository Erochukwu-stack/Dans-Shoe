document.addEventListener("DOMContentLoaded", function(){
const unitPrice = 45000;
const bulkThreshold = 3;
const bulkDiscountRate = 0.10;

const quantityInput = document.getElementById("quantity");
const totalPrice = document.getElementById("total-price");

if (!quantityInput || !totalPrice) {
    console.error("Could not find #quantity or #total-price in the HTML.");
    return;
}
function updateTotal() {
    let quantity = Number(quantityInput.value);

    if (quantity < 1 || isNaN(quantity)) {
        quantity = 1;
        quantityInput.value = 1;
    }
    let total = quantity * unitPrice;

    const isBulkOrder = quantity >= bulkThreshold;

    let discountText = "";

    if (isBulkOrder) {
        const discountAmount = total * bulkDiscountRate;
        total = total - discountAmount;
        discountText = " (10% bulk discount applied)";
    }
    totalPrice.textContent = 
        "Total: N" + total.toLocaleString() + discountText;
        console.log("updateTotal ran. quantity:", quantity, "total:", total);
}
quantityInput.addEventListener("input", updateTotal);

updateTotal();

const buyBtn = document.getElementById("buy-btn");
const overlay = document.getElementById("modal-overlay");
const closeBtn = document.getElementById("modal-close");
const toggleLink = document.getElementById("toggle-mode");

const modalTitle = document.getElementById("modal-title");
const modalSubtitle = document.getElementById("modal-subtitle");
const toggleText = document.getElementById("toggle-text");
const submitBtn = document.getElementById("modal-submit");
const confirmGroup = document.getElementById("confirm-password-group");
const confirmInput = document.getElementById("confirm-password");
const authForm = document.getElementById("auth-form");

let isSignUpMode = false;

function openModal() {
    overlay.classList.add("active");
}
function closeModal() {
    overlay.classList.remove("active");
}

function renderMode() {
    if (isSignUpMode) {
        modalTitle.textContent = "Sign Up";
        modalSubtitle.textContent = "Create an account to complete your order with DANS.";
        submitBtn.textContent = "Sign Up";
        toggleText.textContent = "Already have an account?";
        toggleLink.textContent = "Sign in instead";
        confirmGroup.classList.remove("hidden");
        confirmInput.required = true;
    } else {
        modalTitle.textContent = "Sign In";
        modalSubtitle = "Sign in to complete your order with DANS";
        submitBtn.textContent = "Sign In";
        toggleText.textContent = "Don't have an account";
        toggleLink.textContent = "Sign up instead";
        confirmGroup.classList.add("hidden");
        confirmInput.required = false;
    }
}

buyBtn.addEventListener("click", openModal);
closeBtn.addEventListener("click", closeModal)

overlay.addEventListener("click", function (event) {
    if(event.target === overlay) closeModal(); 
});
toggleLink.addEventListener("click", function (event) {
    event.preventDefault();
    isSignUpMode = !isSignUpMode;
    renderMode();
});
authForm.addEventListener("submit", function (event) {
    event.preventDefault();

    if (isSignUpMode && document.getElementById("password").value !== confirmInput.value) {
        alert("Passwords don't match.");
        return;
    }
    alert(isSignUpMode ? "Account created" : "Signed in!");
    closeModal();
})
});