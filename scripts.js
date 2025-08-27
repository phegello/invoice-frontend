document.addEventListener('DOMContentLoaded', () => {
    const invoiceItems = document.getElementById('invoiceItems');
    const addItemBtn = document.getElementById('addItemBtn');
    const invoiceForm = document.getElementById('invoiceForm');
    const subtotalDisplay = document.getElementById('subtotal');
    const discountInput = document.getElementById('discount');
    const finalTotalDisplay = document.getElementById('finalTotal');

    const today = new Date().toISOString().split('T')[0];
    document.getElementById('invoiceDate').value = today;

    // The updateTotals function is moved here
    const updateTotals = () => {
        let subtotal = 0;
        document.querySelectorAll('.item-row').forEach(row => {
            const totalText = row.querySelector('.total-cell').textContent;
            subtotal += parseFloat(totalText.replace('R ', '')) || 0;
        });

        const discount = parseFloat(discountInput.value) || 0;
        const finalTotal = subtotal - discount;

        subtotalDisplay.textContent = `R ${subtotal.toFixed(2)}`;
        finalTotalDisplay.textContent = `R ${finalTotal.toFixed(2)}`;
    };

    const addNewItemRow = () => {
        const row = document.createElement('tr');
        row.className = 'item-row';
        row.innerHTML = `
            <td><input type="text" class="item-description" required></td>
            <td><input type="number" class="item-price" min="0" step="0.01" value="0" required></td>
            <td><input type="number" class="item-qty" min="1" value="1" required></td>
            <td class="total-cell">R 0.00</td>
            <td><button type="button" class="remove-item-btn">X</button></td>
        `;
        invoiceItems.appendChild(row);
    };

    addNewItemRow();

    addItemBtn.addEventListener('click', addNewItemRow);

    invoiceItems.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-item-btn')) {
            e.target.closest('tr').remove();
            updateTotals();
        }
    });

    invoiceItems.addEventListener('input', (e) => {
        if (e.target.classList.contains('item-price') || e.target.classList.contains('item-qty')) {
            const row = e.target.closest('tr');
            const price = parseFloat(row.querySelector('.item-price').value) || 0;
            const qty = parseInt(row.querySelector('.item-qty').value) || 0;
            const total = price * qty;
            row.querySelector('.total-cell').textContent = `R ${total.toFixed(2)}`;
            updateTotals();
        }
    });

    discountInput.addEventListener('input', updateTotals);

    invoiceForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const invoiceData = {
            clientName: document.getElementById('clientName').value,
            clientEmail: document.getElementById('clientEmail').value,
            invoiceNumber: document.getElementById('invoiceNumber').value,
            invoiceDate: document.getElementById('invoiceDate').value,
            items: [],
            subtotal: parseFloat(subtotalDisplay.textContent.replace('R ', '')),
            discount: parseFloat(discountInput.value),
            total: parseFloat(finalTotalDisplay.textContent.replace('R ', ''))
        };

        document.querySelectorAll('.item-row').forEach(row => {
            invoiceData.items.push({
                description: row.querySelector('.item-description').value,
                price: parseFloat(row.querySelector('.item-price').value),
                quantity: parseInt(row.querySelector('.item-qty').value)
            });
        });

        try {
            const response = await fetch('http://localhost:3000/api/create-invoice', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(invoiceData)
            });

            if (response.ok) {
                const result = await response.json();
                alert(result.message);
                invoiceForm.reset();
            } else {
                const error = await response.json();
                alert(`Error: ${error.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to connect to the server. Please ensure the backend is running.');
        }
    });
});