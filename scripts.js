document.addEventListener('DOMContentLoaded', () => {
    const invoiceForm = document.getElementById('invoiceForm');
    const invoiceItems = document.getElementById('invoiceItems');
    const addItemBtn = document.getElementById('addItemBtn');
    const subtotalDisplay = document.getElementById('subtotal');
    const discountInput = document.getElementById('discount');
    const vatInput = document.getElementById('vat');
    const postInput = document.getElementById('post');
    const finalTotalDisplay = document.getElementById('finalTotal');
    const invoiceDateInput = document.getElementById('invoiceDate');

    // Set today's date as the default
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    invoiceDateInput.value = formattedDate;

    // A counter to keep track of item rows
    let itemCounter = 0;

    // Function to add a new item row to the table
    const addNewItem = () => {
        itemCounter++;
        const newRow = document.createElement('tr');
        newRow.className = 'item-row';
        newRow.dataset.itemId = itemCounter;

        newRow.innerHTML = `
            <td><input type="text" class="item-description" placeholder="Description"></td>
            <td><input type="number" class="item-price" placeholder="Price" min="0" step="0.01"></td>
            <td><input type="number" class="item-quantity" placeholder="Qty" value="1" min="1"></td>
            <td><input type="number" class="item-discount" placeholder="Discount" value="0" min="0"></td>
            <td><button type="button" class="removeItemBtn" data-item-id="${itemCounter}">Remove</button></td>
        `;

        invoiceItems.appendChild(newRow);
    };

    // Calculate totals whenever an input changes
    const calculateTotals = () => {
        let subtotal = 0;
        const allItems = invoiceItems.querySelectorAll('.item-row');

        allItems.forEach(item => {
            const price = parseFloat(item.querySelector('.item-price').value) || 0;
            const quantity = parseInt(item.querySelector('.item-quantity').value) || 0;
            const itemDiscount = parseFloat(item.querySelector('.item-discount').value) || 0;
            subtotal += (price * quantity) - itemDiscount;
        });

        const overallDiscount = parseFloat(discountInput.value) || 0;
        const vat = parseFloat(vatInput.value) || 0;
        const post = parseFloat(postInput.value) || 0;
        const total = subtotal - overallDiscount + vat + post;

        subtotalDisplay.textContent = `R ${subtotal.toFixed(2)}`;
        finalTotalDisplay.textContent = `R ${total.toFixed(2)}`;
    };

    // Event listeners
    addItemBtn.addEventListener('click', addNewItem);
    invoiceItems.addEventListener('input', calculateTotals);
    discountInput.addEventListener('input', calculateTotals);
    vatInput.addEventListener('input', calculateTotals);
    postInput.addEventListener('input', calculateTotals);

    // Initial item row
    addNewItem();

    // Handle form submission
    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const items = [];
        invoiceItems.querySelectorAll('.item-row').forEach(item => {
            items.push({
                description: item.querySelector('.item-description').value,
                price: parseFloat(item.querySelector('.item-price').value),
                quantity: parseInt(item.querySelector('.item-quantity').value),
                itemDiscount: parseFloat(item.querySelector('.item-discount').value)
            });
        });

        const invoiceData = {
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value,
            clientName: document.getElementById('clientName').value,
            businessName: document.getElementById('businessName').value,
            clientEmail: document.getElementById('clientEmail').value,
            subtotal: parseFloat(subtotalDisplay.textContent.replace('R ', '')),
            discount: parseFloat(discountInput.value),
            vat: parseFloat(vatInput.value),
            post: parseFloat(postInput.value),
            total: parseFloat(finalTotalDisplay.textContent.replace('R ', '')),
            items: items
        };

        try {
            const response = await fetch('https://https://zany-eden-karabomagabe213-bdf3bb65.koyeb.app/api/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(invoiceData),
            });

            const data = await response.json();
            if (response.ok) {
                alert('Invoice created and sent successfully!');
            } else {
                alert(`Error: ${data.error || 'Failed to create and send invoice.'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server. Please ensure the backend is running.');
        }
    });

    // Handle remove item button clicks
    invoiceItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('removeItemBtn')) {
            const row = e.target.closest('.item-row');
            row.remove();
            calculateTotals();
        }
    });
});