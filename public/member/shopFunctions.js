/**
 * shopFunctions.js
 * Contains all shopping-related functionality for the RAS Member Portal
 */

import { shopItems, irlShopItems, HCB_BASE_URL } from './constants.js';
import { getPurchasesByEid } from './eidStats.js';

/**
 * Initialize shop functionality
 */
export function initShopFunctionality() {
    // Generate the shop table
    generateShopTable();
    
    // Add event listener to checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        // Make the checkout button bigger
        checkoutBtn.style.padding = '12px 24px';
        checkoutBtn.style.fontSize = '1.2em';
        checkoutBtn.style.fontWeight = 'bold';
        
        checkoutBtn.addEventListener('click', function() {
            processCheckout();
        });
    }
    
    // Initial total calculation
    updateTotal();
}

/**
 * Process the shop items to propagate image and price values downward
 * @param {Array} itemsArray - Array of shop items
 * @returns {Array} - Processed array of shop items
 */
export function processShopItems(itemsArray = shopItems) {
    let lastImage = null;
    let lastPrice = null;
    
    return itemsArray.map(item => {
        // If this item doesn't have an image, use the last one
        if (!item.image && lastImage) {
            item.image = lastImage;
        } else if (item.image) {
            lastImage = item.image;
        }
        
        // If this item doesn't have a price, use the last one
        if (!item.price && lastPrice) {
            item.price = lastPrice;
        } else if (item.price) {
            lastPrice = item.price;
        }
        
        return {...item}; // Return a copy of the item to avoid modifying the original
    });
}

/**
 * Generate shop table from items array
 */
export function generateShopTable() {
    const container = document.getElementById('shopTableContainer');
    if (!container) return;
    
    // Check if we're in IRL mode
    const isIrlMode = new URLSearchParams(window.location.search).has('irl');
    
    // Get the items to display based on mode
    let itemsToProcess = [...shopItems]; // Make a copy of the array
    if (isIrlMode) {
        // In IRL mode, show IRL items first, then regular items
        itemsToProcess = [...irlShopItems, ...shopItems];
    }
    
    // Process items to propagate values
    const processedItems = processShopItems(itemsToProcess);
    
    // Create table element
    const table = document.createElement('table');
    table.id = 'shopTable';
    table.className = 'shop-table';
    
    // Create table header
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    
    const headers = ['Item', 'Quantity', 'Purchased', 'Price', 'Item Photo'];
    headers.forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        
        // Make "Purchased" header smaller
        if (headerText === 'Purchased') {
            th.style.fontSize = '0.85em';
        }
        
        headerRow.appendChild(th);
    });
    
    thead.appendChild(headerRow);
    table.appendChild(thead);
    
    // Get current EID for purchase history
    const eidInput = document.getElementById('eid');
    const currentEid = eidInput ? eidInput.value.trim().toLowerCase() : '';
    const userPurchases = currentEid ? getPurchasesByEid(currentEid) || {} : {};
    
    // Create table body
    const tbody = document.createElement('tbody');
    
    // Create rows for each item
    processedItems.forEach(item => {
        const row = document.createElement('tr');
        row.setAttribute('data-item-id', item.id);
        row.setAttribute('data-price', item.price);
        
        // Photo cell
        const photoCell = document.createElement('td');
        const img = document.createElement('img');
        img.src = item.image;
        img.alt = item.name;
        img.className = 'item-photo';
        photoCell.appendChild(img);
        
        // Name cell
        const nameCell = document.createElement('td');
        nameCell.textContent = item.name;
        
        // Price cell
        const priceCell = document.createElement('td');
        priceCell.textContent = `$${(item.price/100).toFixed(2)}`;
        
        // Purchased cell - show previous purchases if available
        const purchasedCell = document.createElement('td');
        purchasedCell.className = 'purchased-cell';
        
        // Check if this item has been purchased before
        const purchasedCount = getPurchaseCount(userPurchases, item.id);
        if (purchasedCount > 0) {
            purchasedCell.textContent = purchasedCount;
            purchasedCell.classList.add('has-purchases');
        } else {
            purchasedCell.textContent = '-';
        }
        
        // Make purchased text smaller
        purchasedCell.style.fontSize = '0.85em';
        
        // Quantity cell
        const quantityCell = document.createElement('td');
        const input = document.createElement('input');
        input.type = 'number';
        input.min = 0;
        input.value = 0;
        input.className = 'quantity-input';
        input.addEventListener('change', function() {
            // Ensure value is not negative
            if (parseInt(this.value) < 0) {
                this.value = 0;
            }
            updateTotal();
        });
        quantityCell.appendChild(input);
        
        // Append cells to row in new order (Item, Quantity, Purchased, Price, Item Photo)
        row.appendChild(nameCell);
        row.appendChild(quantityCell);
        row.appendChild(purchasedCell);
        row.appendChild(priceCell);
        row.appendChild(photoCell);
        
        // Add row to table body
        tbody.appendChild(row);
    });
    
    table.appendChild(tbody);
    container.appendChild(table);
    
    // Add "Snack Shop" link if we're NOT already in IRL mode
    if (!isIrlMode) {
        const snackShopLink = document.createElement('a');
        snackShopLink.href = window.location.pathname + '?irl=1';
        snackShopLink.textContent = 'Snack Shop';
        snackShopLink.style.color = '#0066cc';
        snackShopLink.style.textDecoration = 'underline';
        snackShopLink.style.display = 'inline-block';
        snackShopLink.style.marginTop = '10px';
        snackShopLink.style.fontSize = '0.9em';
        container.appendChild(snackShopLink);
    }
}

/**
 * Helper function to get purchase count for an item
 * @param {Object} userPurchases - Object with purchase history
 * @param {string} itemId - ID of the item to check
 * @returns {number} - Number of purchases for the item
 */
export function getPurchaseCount(userPurchases, itemId) {
    return userPurchases[itemId] || userPurchases[itemId.toLowerCase()] || 
           Object.entries(userPurchases).find(([k, v]) => k.toLowerCase() === itemId.toLowerCase())?.[1] || 0;
}

/**
 * Calculate and update total amount
 * @returns {number} - Total amount in cents
 */
export function updateTotal() {
    let total = 0;
    const rows = document.querySelectorAll('#shopTable tbody tr');
    
    rows.forEach(row => {
        const price = parseInt(row.getAttribute('data-price'));
        const quantity = parseInt(row.querySelector('.quantity-input').value);
        total += price * quantity;
    });
    
    // Update total display (convert cents to dollars)
    const totalAmountElement = document.getElementById('totalAmount');
    if (totalAmountElement) {
        totalAmountElement.textContent = (total / 100).toFixed(2);
    }
    
    // Enable/disable checkout button based on total
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        if (total <= 0) {
            checkoutBtn.disabled = true;
            checkoutBtn.classList.add('disabled');
            checkoutBtn.style.opacity = '0.5';
            checkoutBtn.style.cursor = 'not-allowed';
        } else {
            checkoutBtn.disabled = false;
            checkoutBtn.classList.remove('disabled');
            checkoutBtn.style.opacity = '1';
            checkoutBtn.style.cursor = 'pointer';
        }
    }
    
    return total;
}

/**
 * Process checkout by generating HCB URL and redirecting
 */
export function processCheckout() {
    const eidInput = document.getElementById('eid');
    const eid = eidInput ? eidInput.value.trim().toLowerCase() : '';
    
    if (!eid) {
        alert('Please enter your EID first.');
        return;
    }
    
    // Use HCB_BASE_URL from constants
    const baseUrl = HCB_BASE_URL;
    
    // Calculate total amount in cents
    const totalAmount = updateTotal();
    
    // Button should already be disabled if total is 0, but double-check
    if (totalAmount <= 0) {
        return;
    }
    
    // Build message string with item details
    let messageItems = [];
    messageItems.push(`rasform25;id:${eid}`);
    
    const rows = document.querySelectorAll('#shopTable tbody tr');
    rows.forEach(row => {
        const itemId = row.getAttribute('data-item-id');
        const quantity = parseInt(row.querySelector('.quantity-input').value);
        
        if (quantity > 0) {
            messageItems.push(`${itemId}:${quantity}`);
        }
    });
    
    const messageParam = encodeURIComponent(messageItems.join(';'));
    
    // Complete URL with parameters
    const checkoutUrl = `${baseUrl}&message=${messageParam}&amount=${totalAmount}`;
    
    // Redirect to HCB checkout
    window.location.href = checkoutUrl;
}