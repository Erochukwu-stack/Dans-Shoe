document.addEventListener("DOMContentLoaded", function () {

  /* ===================================================
     PRICE CALCULATOR
  =================================================== */
  const unitPrice = 45000;
  const bulkThreshold = 3;
  const bulkDiscountRate = 0.10;

  const quantityInput = document.getElementById("quantity");
  const totalOutput = document.getElementById("total-output");

  if (!quantityInput || !totalOutput) {
    console.error("Could not find #quantity or #total-output in the HTML.");
    return;
  }

  function calculateTotal(quantity) {
    let total = quantity * unitPrice;
    const isBulkOrder = quantity >= bulkThreshold;
    let discountText = "";

    if (isBulkOrder) {
      const discountAmount = total * bulkDiscountRate;
      total = total - discountAmount;
      discountText = " (10% bulk discount applied)";
    }

    return { total: total, discountText: discountText };
  }

  function updateTotal() {
    let quantity = Number(quantityInput.value);

    if (quantity < 1 || isNaN(quantity)) {
      quantity = 1;
      quantityInput.value = 1;
    }

    const result = calculateTotal(quantity);
    totalOutput.textContent = "Total: ₦" + result.total.toLocaleString() + result.discountText;
  }

  quantityInput.addEventListener("input", updateTotal);
  updateTotal();

  /* ===================================================
     ACCOUNTS — stored in localStorage as an array of
     { email, password } objects. Demo only, not secure.
  =================================================== */
  function getUsers() {
    const raw = localStorage.getItem("sneakerUsers");
    return raw ? JSON.parse(raw) : [];
  }

  function saveUsers(users) {
    localStorage.setItem("sneakerUsers", JSON.stringify(users));
  }

  function getCurrentUser() {
    return localStorage.getItem("sneakerCurrentUser");
  }

  function setCurrentUser(email) {
    localStorage.setItem("sneakerCurrentUser", email);
  }

  function clearCurrentUser() {
    localStorage.removeItem("sneakerCurrentUser");
  }

  /* ===================================================
     CART — one array per user, keyed by email
  =================================================== */
  function getCart(email) {
    const raw = localStorage.getItem("sneakerCart_" + email);
    return raw ? JSON.parse(raw) : [];
  }

  function saveCart(email, cart) {
    localStorage.setItem("sneakerCart_" + email, JSON.stringify(cart));
  }

  function addToCart(email, quantity) {
    const cart = getCart(email);
    const result = calculateTotal(quantity);

    cart.push({
      quantity: quantity,
      total: result.total,
      addedAt: new Date().toLocaleString()
    });

    saveCart(email, cart);
    updateAccountUI();
  }

  /* ===================================================
     NAVBAR ACCOUNT ICON + BADGE
  =================================================== */
  const accountBtn = document.getElementById("account-btn");
  const accountIcon = document.getElementById("account-icon");
  const cartBadge = document.getElementById("cart-badge");

  function updateAccountUI() {
    const email = getCurrentUser();

    if (email) {
      // Signed in — show first letter of email as the icon
      accountIcon.textContent = email.charAt(0).toUpperCase();

      const cart = getCart(email);
      // Sum quantities across all cart entries using reduce
      const itemCount = cart.reduce(function (sum, item) {
        return sum + item.quantity;
      }, 0);

      if (itemCount > 0) {
        cartBadge.textContent = itemCount;
        cartBadge.classList.remove("hidden");
      } else {
        cartBadge.classList.add("hidden");
      }
    } else {
      // Signed out — generic dot icon, no badge
      accountIcon.innerHTML = "&#9679;";
      cartBadge.classList.add("hidden");
    }
  }

  updateAccountUI();

  /* ===================================================
     AUTH MODAL
  =================================================== */
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
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  let isSignUpMode = false;

  // Tracks whether the modal was opened by "Add to Cart", so we know
  // whether to add an item once sign-in succeeds.
  let pendingAddToCart = false;

  function openAuthModal() {
    overlay.classList.add("active");
  }

  function closeAuthModal() {
    overlay.classList.remove("active");
    authForm.reset();
  }

  function renderMode() {
    if (isSignUpMode) {
      modalTitle.textContent = "Sign Up";
      modalSubtitle.textContent = "Create an account with DANS to complete your order.";
      submitBtn.textContent = "Sign Up";
      toggleText.textContent = "Already have an account?";
      toggleLink.textContent = "Sign in instead";
      confirmGroup.classList.remove("hidden");
      confirmInput.required = true;
    } else {
      modalTitle.textContent = "Sign In";
      modalSubtitle.textContent = "Sign in with DANS to complete your order.";
      submitBtn.textContent = "Sign In";
      toggleText.textContent = "Don't have an account?";
      toggleLink.textContent = "Sign up instead";
      confirmGroup.classList.add("hidden");
      confirmInput.required = false;
    }
  }

  buyBtn.addEventListener("click", function () {
    if (getCurrentUser()) {
      // Already signed in — add straight to cart, no modal needed
      const quantity = Number(quantityInput.value);
      addToCart(getCurrentUser(), quantity);
      buyBtn.textContent = "Added ✓";
      setTimeout(function () { buyBtn.textContent = "Add to Cart"; }, 1200);
    } else {
      pendingAddToCart = true;
      isSignUpMode = false;
      renderMode();
      openAuthModal();
    }
  });

  closeBtn.addEventListener("click", closeAuthModal);

  overlay.addEventListener("click", function (event) {
    if (event.target === overlay) closeAuthModal();
  });

  toggleLink.addEventListener("click", function (event) {
    event.preventDefault();
    isSignUpMode = !isSignUpMode;
    renderMode();
  });

  authForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const email = emailInput.value.trim().toLowerCase();
    const password = passwordInput.value;
    const users = getUsers();

    // Look for an existing account with this email
    const existingUser = users.find(function (user) {
      return user.email === email;
    });

    if (isSignUpMode) {
      if (password !== confirmInput.value) {
        alert("Passwords don't match.");
        return;
      }
      if (existingUser) {
        alert("An account with that email already exists. Try signing in.");
        return;
      }

      users.push({ email: email, password: password });
      saveUsers(users);
      setCurrentUser(email);
    } else {
      if (!existingUser || existingUser.password !== password) {
        alert("Incorrect email or password.");
        return;
      }
      setCurrentUser(email);
    }

    updateAccountUI();
    closeAuthModal();

    // If they got here via "Add to Cart", finish that action now
    if (pendingAddToCart) {
      addToCart(email, Number(quantityInput.value));
      pendingAddToCart = false;
    }
  });

  /* ===================================================
     PROFILE MODAL
  =================================================== */
  const profileOverlay = document.getElementById("profile-overlay");
  const profileClose = document.getElementById("profile-close");
  const profileEmail = document.getElementById("profile-email");
  const cartList = document.getElementById("cart-list");
  const cartTotalEl = document.getElementById("cart-total");
  const signOutBtn = document.getElementById("signout-btn");

  function renderProfile() {
    const email = getCurrentUser();
    profileEmail.textContent = email;

    const cart = getCart(email);
    cartList.innerHTML = "";

    if (cart.length === 0) {
      cartList.innerHTML = "<li class='empty'>Your cart is empty.</li>";
      cartTotalEl.textContent = "";
      return;
    }

    let grandTotal = 0;

    cart.forEach(function (item) {
      const li = document.createElement("li");
      li.textContent = item.quantity + " × Stride 02 — ₦" + item.total.toLocaleString();
      cartList.appendChild(li);
      grandTotal = grandTotal + item.total;
    });

    cartTotalEl.textContent = "Cart total: ₦" + grandTotal.toLocaleString();
  }

  accountBtn.addEventListener("click", function () {
    if (getCurrentUser()) {
      renderProfile();
      profileOverlay.classList.add("active");
    } else {
      pendingAddToCart = false;
      isSignUpMode = false;
      renderMode();
      openAuthModal();
    }
  });

  profileClose.addEventListener("click", function () {
    profileOverlay.classList.remove("active");
  });

  profileOverlay.addEventListener("click", function (event) {
    if (event.target === profileOverlay) profileOverlay.classList.remove("active");
  });

  signOutBtn.addEventListener("click", function () {
    clearCurrentUser();
    updateAccountUI();
    profileOverlay.classList.remove("active");
  });
});