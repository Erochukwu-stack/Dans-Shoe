const unitPrice = 45000;
const bulkThreshold = 5;
const bulkDiscountRate = 0.10;

const quantityInput = document.getElementById("quantity");
const totalPrice = document.getElementById("total-price");

function updateTotal() {
    let quantity = Number(quantityInput.value);

    if (quantity < 1) {
        quantity = 1;
        quantityInput.value = 1;
    }
    let total = quantity * unitPrice;

    const isBulkOrder = quantity >= bulkThreshold

    let discountText = "";

    if (isBulkOrder) {
        const discountAmount = total * bulkDiscountRate;
        total = total - discountAmount;
        discountText = "(10% bulk discount applied)";
    }
    totalPrice.textContenr = 
        "Total: N" + total.toLocaleString() + discountText;
}
quantityInput.addEventListener("input", updateTotal)

updateTotal();